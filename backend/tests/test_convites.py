"""
Testes de FASE 1: fluxo ponta a ponta de convite de aluno.

Fluxo testado:
  1. Personal se cadastra automaticamente (sem admin)
  2. Personal faz login e obtém token
  3. Personal gera convite para email do aluno
  4. API retorna token de convite + link
  5. Endpoint público valida o convite (info para o frontend)
  6. Aluno usa o token para criar conta
  7. Aluno fica no mesmo tenant do personal
  8. Aluno consegue fazer login
"""
import pytest

PERSONAL = {
    "nome": "Carlos Personal",
    "email": "carlos@academia.com",
    "senha": "strongpass1",
    "nome_academia": "Academia Silva",
}
EMAIL_ALUNO = "joao.aluno@email.com"


def _registrar_e_logar(client, payload):
    client.post("/auth/registrar-personal", json=payload)
    r = client.post("/auth/login", json={"email": payload["email"], "senha": payload["senha"]})
    return r.json()["access_token"]


# ---------------------------------------------------------------------------
# Fluxo principal (happy path)
# ---------------------------------------------------------------------------

def test_fluxo_completo_convite(client):
    """Personal convida → aluno aceita → ambos no mesmo tenant."""
    # 1. Personal cria conta
    r = client.post("/auth/registrar-personal", json=PERSONAL)
    assert r.status_code == 201
    tenant_do_personal = r.json()["user"]["tenant_id"]

    # 2. Login do personal
    token_personal = _registrar_e_logar.__wrapped__(client, PERSONAL) if hasattr(_registrar_e_logar, "__wrapped__") else None
    login_r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    token_personal = login_r.json()["access_token"]

    # 3. Personal gera convite
    r = client.post(
        "/convites/",
        json={"email_aluno": EMAIL_ALUNO},
        headers={"Authorization": f"Bearer {token_personal}"},
    )
    assert r.status_code == 201
    convite_token = r.json()["token"]
    assert "link_convite" in r.json()
    assert convite_token in r.json()["link_convite"]

    # 4. Endpoint público retorna info do convite
    r = client.get(f"/convites/{convite_token}")
    assert r.status_code == 200
    info = r.json()
    assert info["email_aluno"] == EMAIL_ALUNO
    assert info["nome_personal"] == PERSONAL["nome"]
    assert info["nome_academia"] == PERSONAL["nome_academia"]

    # 5. Aluno aceita o convite
    r = client.post("/auth/aceitar-convite", json={
        "token": convite_token,
        "nome": "João Aluno",
        "senha": "senhaAluno1",
    })
    assert r.status_code == 201
    aceite = r.json()
    assert "access_token" in aceite
    assert aceite["user"]["role"] == "aluno"

    # 6. Aluno faz login
    r = client.post("/auth/login", json={"email": EMAIL_ALUNO, "senha": "senhaAluno1"})
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "aluno"

    # 7. Token do aluno dá acesso à rota protegida
    token_aluno = r.json()["access_token"]
    r = client.get("/alunos/", headers={"Authorization": f"Bearer {token_aluno}"})
    assert r.status_code == 200

    # 8. Verifica que aluno está no mesmo tenant do personal (via listagem)
    r_lista = client.get("/alunos/", headers={"Authorization": f"Bearer {token_personal}"})
    alunos = r_lista.json()
    assert any(a["email"] == EMAIL_ALUNO for a in alunos)
    assert all(a["tenant_id"] == tenant_do_personal for a in alunos)


# ---------------------------------------------------------------------------
# Casos de erro
# ---------------------------------------------------------------------------

def test_convite_token_invalido_retorna_404(client):
    r = client.get("/convites/token-que-nao-existe")
    assert r.status_code == 404


def test_aceitar_convite_token_invalido_retorna_404(client):
    r = client.post("/auth/aceitar-convite", json={
        "token": "invalido",
        "nome": "Alguém",
        "senha": "senha123",
    })
    assert r.status_code == 404


def test_aceitar_convite_duas_vezes_retorna_410(client):
    # setup: personal + convite
    client.post("/auth/registrar-personal", json=PERSONAL)
    login = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    token_personal = login.json()["access_token"]

    r = client.post(
        "/convites/",
        json={"email_aluno": "novaaluno@email.com"},
        headers={"Authorization": f"Bearer {token_personal}"},
    )
    convite_token = r.json()["token"]

    # Primeira vez: ok
    client.post("/auth/aceitar-convite", json={
        "token": convite_token, "nome": "Aluno X", "senha": "senha123",
    })

    # Segunda vez: 410
    r = client.post("/auth/aceitar-convite", json={
        "token": convite_token, "nome": "Aluno X", "senha": "senha123",
    })
    assert r.status_code == 410


def test_convidar_sem_auth_retorna_403(client):
    r = client.post("/convites/", json={"email_aluno": "teste@email.com"})
    assert r.status_code == 403


def test_aluno_nao_pode_gerar_convite(client):
    """Aluno com token válido não pode criar convites."""
    # Cria personal + aluno via convite
    client.post("/auth/registrar-personal", json=PERSONAL)
    login = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    token_personal = login.json()["access_token"]

    r = client.post(
        "/convites/",
        json={"email_aluno": "aluno.teste2@email.com"},
        headers={"Authorization": f"Bearer {token_personal}"},
    )
    convite_token = r.json()["token"]

    client.post("/auth/aceitar-convite", json={
        "token": convite_token, "nome": "Aluno Teste2", "senha": "senha123",
    })
    login_aluno = client.post("/auth/login", json={
        "email": "aluno.teste2@email.com", "senha": "senha123",
    })
    token_aluno = login_aluno.json()["access_token"]

    r = client.post(
        "/convites/",
        json={"email_aluno": "outro@email.com"},
        headers={"Authorization": f"Bearer {token_aluno}"},
    )
    assert r.status_code == 403
