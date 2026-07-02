"""
Testes de FASE 5: gamificação (streak, conquistas, endpoint).
"""
from datetime import datetime, timedelta

import pytest
from sqlalchemy.orm import Session

from app.models import Aluno, Conquista, ExecucaoTreino, Tenant, User, Role
from app.services.gamificacao import atualizar_gamificacao, calcular_streak

PERSONAL = {
    "nome": "Gami Trainer",
    "email": "gami@academia.com",
    "senha": "pass1234",
    "nome_academia": "Academia Gami",
}


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _criar_aluno(client, headers, email="aluno@gami.com", nome="Aluno Gami"):
    r = client.post("/alunos/", json={"nome": nome, "email": email}, headers=headers)
    assert r.status_code == 201
    return r.json()["id"]


def _criar_treino(client, headers, aluno_id, nome="Treino A"):
    r = client.post("/treinos/", json={"aluno_id": aluno_id, "nome": nome}, headers=headers)
    assert r.status_code == 201
    return r.json()["id"]


def _executar(client, headers, treino_id):
    r = client.post(f"/treinos/{treino_id}/executar", json={"dificuldade": "ok"}, headers=headers)
    assert r.status_code == 201
    return r.json()


# ---------------------------------------------------------------------------
# calcular_streak — testes unitários (sem HTTP)
# ---------------------------------------------------------------------------

def test_calcular_streak_sem_execucoes(db: Session):
    """Sem execuções, streak deve ser 0."""
    # Cria estrutura mínima para ter um aluno válido
    tenant = Tenant(nome="T1")
    db.add(tenant)
    db.flush()
    user = User(
        tenant_id=tenant.id, nome="P", email="p@t.com",
        senha_hash="x", role=Role.personal,
    )
    db.add(user)
    db.flush()
    aluno = Aluno(tenant_id=tenant.id, personal_id=user.id, nome="A", email="a@t.com")
    db.add(aluno)
    db.commit()

    assert calcular_streak(aluno.id, db) == 0


def test_calcular_streak_apenas_hoje(db: Session):
    tenant = Tenant(nome="T2")
    db.add(tenant)
    db.flush()
    user = User(
        tenant_id=tenant.id, nome="P", email="p2@t.com",
        senha_hash="x", role=Role.personal,
    )
    db.add(user)
    db.flush()
    aluno = Aluno(tenant_id=tenant.id, personal_id=user.id, nome="A", email="a2@t.com")
    db.add(aluno)
    db.flush()

    treino_fake_id = 99
    db.add(ExecucaoTreino(
        tenant_id=tenant.id, treino_id=treino_fake_id,
        aluno_id=aluno.id, data=datetime.utcnow(),
    ))
    db.commit()

    assert calcular_streak(aluno.id, db) == 1


def test_calcular_streak_quebrado_ha_dois_dias(db: Session):
    """Última execução há 2 dias → streak = 0."""
    tenant = Tenant(nome="T3")
    db.add(tenant)
    db.flush()
    user = User(
        tenant_id=tenant.id, nome="P", email="p3@t.com",
        senha_hash="x", role=Role.personal,
    )
    db.add(user)
    db.flush()
    aluno = Aluno(tenant_id=tenant.id, personal_id=user.id, nome="A", email="a3@t.com")
    db.add(aluno)
    db.flush()

    db.add(ExecucaoTreino(
        tenant_id=tenant.id, treino_id=99,
        aluno_id=aluno.id,
        data=datetime.utcnow() - timedelta(days=2),
    ))
    db.commit()

    assert calcular_streak(aluno.id, db) == 0


def test_calcular_streak_tres_dias_consecutivos(db: Session):
    tenant = Tenant(nome="T4")
    db.add(tenant)
    db.flush()
    user = User(
        tenant_id=tenant.id, nome="P", email="p4@t.com",
        senha_hash="x", role=Role.personal,
    )
    db.add(user)
    db.flush()
    aluno = Aluno(tenant_id=tenant.id, personal_id=user.id, nome="A", email="a4@t.com")
    db.add(aluno)
    db.flush()

    for delta in range(3):
        db.add(ExecucaoTreino(
            tenant_id=tenant.id, treino_id=99,
            aluno_id=aluno.id,
            data=datetime.utcnow() - timedelta(days=delta),
        ))
    db.commit()

    assert calcular_streak(aluno.id, db) == 3


def test_calcular_streak_multiplos_treinos_mesmo_dia(db: Session):
    """Dois treinos no mesmo dia contam como 1 dia."""
    tenant = Tenant(nome="T5")
    db.add(tenant)
    db.flush()
    user = User(
        tenant_id=tenant.id, nome="P", email="p5@t.com",
        senha_hash="x", role=Role.personal,
    )
    db.add(user)
    db.flush()
    aluno = Aluno(tenant_id=tenant.id, personal_id=user.id, nome="A", email="a5@t.com")
    db.add(aluno)
    db.flush()

    hoje = datetime.utcnow()
    db.add(ExecucaoTreino(tenant_id=tenant.id, treino_id=99, aluno_id=aluno.id, data=hoje))
    db.add(ExecucaoTreino(tenant_id=tenant.id, treino_id=99, aluno_id=aluno.id,
                          data=hoje.replace(hour=(hoje.hour + 1) % 24)))
    db.commit()

    assert calcular_streak(aluno.id, db) == 1


# ---------------------------------------------------------------------------
# Endpoint GET /alunos/{id}/gamificacao
# ---------------------------------------------------------------------------

def test_gamificacao_aluno_novo(client):
    """Aluno recém-criado tem streak 0 e sem conquistas."""
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers)

    r = client.get(f"/alunos/{aluno_id}/gamificacao", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["aluno_id"] == aluno_id
    assert data["streak_atual"] == 0
    assert data["streak_recorde"] == 0
    assert data["total_treinos"] == 0
    assert data["conquistas"] == []


def test_gamificacao_primeiro_treino_desbloqueia_conquista(client):
    """Primeira execução deve desbloquear a conquista 'primeiro_treino'."""
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers, email="first@aluno.com")
    treino_id = _criar_treino(client, headers, aluno_id)

    _executar(client, headers, treino_id)

    r = client.get(f"/alunos/{aluno_id}/gamificacao", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total_treinos"] == 1
    assert data["streak_atual"] == 1
    assert data["streak_recorde"] == 1
    codigos = [c["codigo"] for c in data["conquistas"]]
    assert "primeiro_treino" in codigos


def test_gamificacao_conquista_nao_duplica(client):
    """Executar o mesmo treino duas vezes não duplica a conquista 'primeiro_treino'."""
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers, email="nodup@aluno.com")
    treino_id = _criar_treino(client, headers, aluno_id)

    _executar(client, headers, treino_id)
    _executar(client, headers, treino_id)

    r = client.get(f"/alunos/{aluno_id}/gamificacao", headers=headers)
    assert r.status_code == 200
    codigos = [c["codigo"] for c in r.json()["conquistas"]]
    assert codigos.count("primeiro_treino") == 1


def test_gamificacao_streak_recorde_atualizado(client):
    """streak_recorde deve refletir o maior streak já atingido."""
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers, email="rec@aluno.com")
    treino_id = _criar_treino(client, headers, aluno_id)

    _executar(client, headers, treino_id)

    r = client.get(f"/alunos/{aluno_id}/gamificacao", headers=headers)
    assert r.json()["streak_recorde"] >= 1


def test_gamificacao_outro_tenant_retorna_404(client):
    """Personal B não pode ver gamificação de aluno do tenant A."""
    hA = _auth(client)
    client.post("/auth/registrar-personal", json={
        "nome": "B", "email": "b@gami.com", "senha": "pass1234", "nome_academia": "B",
    })
    hB = {"Authorization": "Bearer " + client.post("/auth/login", json={
        "email": "b@gami.com", "senha": "pass1234",
    }).json()["access_token"]}

    aluno_id = _criar_aluno(client, hA, email="exclusivo@aluno.com")

    r = client.get(f"/alunos/{aluno_id}/gamificacao", headers=hB)
    assert r.status_code == 404


def test_gamificacao_conquista_tem_descricao(client):
    """Campo descricao deve ser texto legível (não o código)."""
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers, email="desc@aluno.com")
    treino_id = _criar_treino(client, headers, aluno_id)
    _executar(client, headers, treino_id)

    r = client.get(f"/alunos/{aluno_id}/gamificacao", headers=headers)
    for c in r.json()["conquistas"]:
        assert c["descricao"] != c["codigo"]
        assert len(c["descricao"]) > 5


def test_gamificacao_10_treinos_desbloqueia_conquista(client):
    """Após 10 execuções, conquista 'treinos_10' deve aparecer."""
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers, email="dez@aluno.com")
    treino_id = _criar_treino(client, headers, aluno_id)

    for _ in range(10):
        _executar(client, headers, treino_id)

    r = client.get(f"/alunos/{aluno_id}/gamificacao", headers=headers)
    codigos = [c["codigo"] for c in r.json()["conquistas"]]
    assert "treinos_10" in codigos
