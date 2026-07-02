"""
Testes de FASE 3: treino do dia, execução com itens, histórico de carga.
"""
from datetime import datetime

PERSONAL = {
    "nome": "Personal Exec",
    "email": "exec@academia.com",
    "senha": "pass1234",
    "nome_academia": "Academia Exec",
}

# Convenção idêntica à do alunos.py
_DIAS_SEMANA = {
    0: "segunda", 1: "terca", 2: "quarta", 3: "quinta",
    4: "sexta", 5: "sabado", 6: "domingo",
}
DIA_HOJE = _DIAS_SEMANA[datetime.utcnow().weekday()]
DIA_OUTRO = "domingo" if DIA_HOJE != "domingo" else "segunda"


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _setup(client, headers):
    """Cria aluno + exercício + treino com item. Retorna (aluno_id, treino_id, ex_id, item_id)."""
    r = client.post("/alunos/", json={"nome": "Aluno Exec", "email": "alunoexec@test.com"},
                    headers=headers)
    aluno_id = r.json()["id"]

    r = client.post("/exercicios/", json={"nome": "Supino Reto", "grupo_muscular": "peito"},
                    headers=headers)
    ex_id = r.json()["id"]

    r = client.post("/treinos/", json={
        "aluno_id": aluno_id, "nome": "Treino Peito", "dia_semana": DIA_HOJE,
    }, headers=headers)
    treino_id = r.json()["id"]

    r = client.post(f"/treinos/{treino_id}/itens/", json={
        "exercicio_id": ex_id, "series": 4, "repeticoes": "10", "carga": 40.0,
    }, headers=headers)
    item_id = r.json()["id"]

    return aluno_id, treino_id, ex_id, item_id


# ---------------------------------------------------------------------------
# Treino do dia
# ---------------------------------------------------------------------------

def test_treino_do_dia_retorna_treino_de_hoje(client):
    headers = _auth(client)
    aluno_id, treino_id, *_ = _setup(client, headers)

    r = client.get(f"/alunos/{aluno_id}/treino-do-dia", headers=headers)
    assert r.status_code == 200
    nomes = [t["nome"] for t in r.json()]
    assert "Treino Peito" in nomes


def test_treino_do_dia_nao_retorna_outro_dia(client):
    headers = _auth(client)
    r = client.post("/alunos/", json={"nome": "Aluno2", "email": "a2exec@test.com"},
                    headers=headers)
    aluno_id = r.json()["id"]

    client.post("/treinos/", json={
        "aluno_id": aluno_id, "nome": "Treino Errado", "dia_semana": DIA_OUTRO,
    }, headers=headers)

    r = client.get(f"/alunos/{aluno_id}/treino-do-dia", headers=headers)
    assert r.status_code == 200
    assert r.json() == []


def test_treino_do_dia_retorna_itens(client):
    headers = _auth(client)
    aluno_id, treino_id, ex_id, item_id = _setup(client, headers)

    r = client.get(f"/alunos/{aluno_id}/treino-do-dia", headers=headers)
    assert r.status_code == 200
    treinos = r.json()
    assert len(treinos) == 1
    assert len(treinos[0]["itens"]) == 1
    assert treinos[0]["itens"][0]["exercicio_id"] == ex_id


def test_treino_do_dia_aluno_de_outro_tenant_retorna_404(client):
    hA = _auth(client)
    client.post("/auth/registrar-personal", json={
        "nome": "B", "email": "b@exec.com", "senha": "pass1234", "nome_academia": "B"
    })
    hB = {"Authorization": "Bearer " + client.post("/auth/login", json={
        "email": "b@exec.com", "senha": "pass1234"
    }).json()["access_token"]}

    aluno_id, *_ = _setup(client, hA)

    r = client.get(f"/alunos/{aluno_id}/treino-do-dia", headers=hB)
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Registro de execução
# ---------------------------------------------------------------------------

def test_registrar_execucao_sem_itens(client):
    headers = _auth(client)
    aluno_id, treino_id, *_ = _setup(client, headers)

    r = client.post(f"/treinos/{treino_id}/executar", json={
        "dificuldade": "ok",
        "comentario": "Treino tranquilo",
        "itens": [],
    }, headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert data["dificuldade"] == "ok"
    assert data["aluno_id"] == aluno_id
    assert data["itens"] == []


def test_registrar_execucao_com_itens(client):
    headers = _auth(client)
    aluno_id, treino_id, ex_id, item_id = _setup(client, headers)

    r = client.post(f"/treinos/{treino_id}/executar", json={
        "dificuldade": "dificil",
        "comentario": "Pesado hoje",
        "itens": [
            {
                "exercicio_id": ex_id,
                "treino_item_id": item_id,
                "carga_realizada": 45.0,
                "repeticoes_realizadas": "8",
                "series_realizadas": 4,
            }
        ],
    }, headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert len(data["itens"]) == 1
    assert data["itens"][0]["carga_realizada"] == 45.0
    assert data["itens"][0]["repeticoes_realizadas"] == "8"


def test_registrar_execucao_treino_inexistente_retorna_404(client):
    headers = _auth(client)
    r = client.post("/treinos/99999/executar", json={
        "dificuldade": "ok", "itens": []
    }, headers=headers)
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Histórico de carga
# ---------------------------------------------------------------------------

def test_historico_carga_vazio(client):
    headers = _auth(client)
    aluno_id, _, ex_id, _ = _setup(client, headers)

    r = client.get(f"/alunos/{aluno_id}/historico-carga/{ex_id}", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["exercicio_id"] == ex_id
    assert data["aluno_id"] == aluno_id
    assert data["historico"] == []


def test_historico_carga_acumula_execucoes(client):
    headers = _auth(client)
    aluno_id, treino_id, ex_id, item_id = _setup(client, headers)

    cargas = [40.0, 42.5, 45.0]
    for carga in cargas:
        client.post(f"/treinos/{treino_id}/executar", json={
            "dificuldade": "ok",
            "itens": [{
                "exercicio_id": ex_id,
                "treino_item_id": item_id,
                "carga_realizada": carga,
                "repeticoes_realizadas": "10",
                "series_realizadas": 4,
            }],
        }, headers=headers)

    r = client.get(f"/alunos/{aluno_id}/historico-carga/{ex_id}", headers=headers)
    assert r.status_code == 200
    historico = r.json()["historico"]
    assert len(historico) == 3
    # Mais recente primeiro
    assert historico[0]["carga_realizada"] == 45.0
    assert historico[2]["carga_realizada"] == 40.0


def test_historico_carga_inclui_dificuldade(client):
    headers = _auth(client)
    aluno_id, treino_id, ex_id, item_id = _setup(client, headers)

    client.post(f"/treinos/{treino_id}/executar", json={
        "dificuldade": "facil",
        "itens": [{"exercicio_id": ex_id, "carga_realizada": 50.0}],
    }, headers=headers)

    r = client.get(f"/alunos/{aluno_id}/historico-carga/{ex_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["historico"][0]["dificuldade"] == "facil"


def test_historico_carga_aluno_outro_tenant_retorna_404(client):
    hA = _auth(client)
    client.post("/auth/registrar-personal", json={
        "nome": "C", "email": "c@exec.com", "senha": "pass1234", "nome_academia": "C"
    })
    hC = {"Authorization": "Bearer " + client.post("/auth/login", json={
        "email": "c@exec.com", "senha": "pass1234"
    }).json()["access_token"]}

    aluno_id, _, ex_id, _ = _setup(client, hA)

    r = client.get(f"/alunos/{aluno_id}/historico-carga/{ex_id}", headers=hC)
    assert r.status_code == 404
