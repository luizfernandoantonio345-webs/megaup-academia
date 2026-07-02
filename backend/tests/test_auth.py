"""Testes de FASE 0: registro de personal, login, token válido."""
import pytest


PERSONAL_PAYLOAD = {
    "nome": "Trainer Teste",
    "email": "trainer@test.com",
    "senha": "senha123",
    "nome_academia": "Academia Teste",
}


def test_registrar_personal(client):
    r = client.post("/auth/registrar-personal", json=PERSONAL_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["user"]["role"] == "personal"
    assert data["user"]["email"] == PERSONAL_PAYLOAD["email"]
    assert "tenant_id" in data["user"]


def test_login_retorna_token(client):
    client.post("/auth/registrar-personal", json=PERSONAL_PAYLOAD)

    r = client.post("/auth/login", json={
        "email": PERSONAL_PAYLOAD["email"],
        "senha": PERSONAL_PAYLOAD["senha"],
    })
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "personal"
    assert data["user"]["nome"] == PERSONAL_PAYLOAD["nome"]


def test_login_credenciais_invalidas(client):
    r = client.post("/auth/login", json={
        "email": "naoexiste@test.com",
        "senha": "errado",
    })
    assert r.status_code == 401


def test_email_duplicado_retorna_409(client):
    client.post("/auth/registrar-personal", json=PERSONAL_PAYLOAD)
    r = client.post("/auth/registrar-personal", json=PERSONAL_PAYLOAD)
    assert r.status_code == 409


def test_rota_protegida_sem_token_retorna_403(client):
    """Sem Authorization header, FastAPI HTTPBearer retorna 403."""
    r = client.get("/alunos/")
    assert r.status_code == 403


def test_rota_protegida_token_invalido_retorna_401(client):
    r = client.get("/alunos/", headers={"Authorization": "Bearer token-invalido"})
    assert r.status_code == 401


def test_rota_protegida_com_token_valido(client):
    client.post("/auth/registrar-personal", json=PERSONAL_PAYLOAD)
    login = client.post("/auth/login", json={
        "email": PERSONAL_PAYLOAD["email"],
        "senha": PERSONAL_PAYLOAD["senha"],
    })
    token = login.json()["access_token"]

    r = client.get("/alunos/", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)
