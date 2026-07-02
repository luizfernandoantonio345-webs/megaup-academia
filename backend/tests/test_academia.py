"""
Testes FASE 9 — Multi-tenant Academia.

Cobre: listar personais, adicionar, remover, isolamento de tenant.
admin_academia é registrado via rota /auth/registrar-personal com role=admin_academia?
Como admin_academia ainda não tem rota própria, usamos um personal e alteramos o role
diretamente no DB (via fixture) para simular o comportamento.
"""
import pytest

from app.models import Role, User


PERSONAL_DATA = {
    "nome": "Personal X",
    "email": "personalx@test.com",
    "senha": "senha123",
    "nome_academia": "Academia X",
}
PERSONAL2_DATA = {
    "nome": "Personal Y",
    "email": "personaly@test.com",
    "senha": "senha123",
    "nome_academia": "Academia Y",
}


def _registrar_e_logar(client, payload):
    client.post("/auth/registrar-personal", json=payload)
    r = client.post("/auth/login", json={"email": payload["email"], "senha": payload["senha"]})
    return r.json()["access_token"]


def _promover_admin(db, email: str):
    """Eleva role do user para admin_academia no banco."""
    user = db.query(User).filter(User.email == email).first()
    user.role = Role.admin_academia
    db.commit()


def test_admin_academia_lista_personais(client, db):
    token = _registrar_e_logar(client, PERSONAL_DATA)
    _promover_admin(db, PERSONAL_DATA["email"])

    # Precisamos de novo token com role admin_academia — loga de novo
    login = client.post("/auth/login", json={"email": PERSONAL_DATA["email"], "senha": PERSONAL_DATA["senha"]})
    token_admin = login.json()["access_token"]

    r = client.get("/academia/personais/", headers={"Authorization": f"Bearer {token_admin}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_personal_comum_nao_acessa_academia(client):
    token = _registrar_e_logar(client, PERSONAL_DATA)
    r = client.get("/academia/personais/", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


def test_adicionar_personal_na_academia(client, db):
    token_admin = _registrar_e_logar(client, PERSONAL_DATA)
    _promover_admin(db, PERSONAL_DATA["email"])
    login = client.post("/auth/login", json={"email": PERSONAL_DATA["email"], "senha": PERSONAL_DATA["senha"]})
    token_admin = login.json()["access_token"]

    # Registra personal Y (outro tenant)
    _registrar_e_logar(client, PERSONAL2_DATA)

    r = client.post(
        "/academia/personais/",
        json={"email": PERSONAL2_DATA["email"]},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    assert r.status_code == 201
    assert r.json()["email"] == PERSONAL2_DATA["email"]
    assert r.json()["ativo"] is True


def test_adicionar_personal_duas_vezes_retorna_409(client, db):
    _registrar_e_logar(client, PERSONAL_DATA)
    _promover_admin(db, PERSONAL_DATA["email"])
    login = client.post("/auth/login", json={"email": PERSONAL_DATA["email"], "senha": PERSONAL_DATA["senha"]})
    token_admin = login.json()["access_token"]

    _registrar_e_logar(client, PERSONAL2_DATA)

    client.post("/academia/personais/", json={"email": PERSONAL2_DATA["email"]},
                headers={"Authorization": f"Bearer {token_admin}"})
    r = client.post("/academia/personais/", json={"email": PERSONAL2_DATA["email"]},
                    headers={"Authorization": f"Bearer {token_admin}"})
    assert r.status_code == 409


def test_email_inexistente_retorna_404(client, db):
    _registrar_e_logar(client, PERSONAL_DATA)
    _promover_admin(db, PERSONAL_DATA["email"])
    login = client.post("/auth/login", json={"email": PERSONAL_DATA["email"], "senha": PERSONAL_DATA["senha"]})
    token_admin = login.json()["access_token"]

    r = client.post("/academia/personais/", json={"email": "naoexiste@nada.com"},
                    headers={"Authorization": f"Bearer {token_admin}"})
    assert r.status_code == 404


def test_remover_personal(client, db):
    _registrar_e_logar(client, PERSONAL_DATA)
    _promover_admin(db, PERSONAL_DATA["email"])
    login = client.post("/auth/login", json={"email": PERSONAL_DATA["email"], "senha": PERSONAL_DATA["senha"]})
    token_admin = login.json()["access_token"]

    _registrar_e_logar(client, PERSONAL2_DATA)
    r = client.post("/academia/personais/", json={"email": PERSONAL2_DATA["email"]},
                    headers={"Authorization": f"Bearer {token_admin}"})
    user_id = r.json()["id"]

    r = client.delete(f"/academia/personais/{user_id}",
                      headers={"Authorization": f"Bearer {token_admin}"})
    assert r.status_code == 204

    # Confirma que foi removido
    r = client.get("/academia/personais/", headers={"Authorization": f"Bearer {token_admin}"})
    assert not any(p["id"] == user_id for p in r.json())


def test_remover_personal_inexistente_retorna_404(client, db):
    _registrar_e_logar(client, PERSONAL_DATA)
    _promover_admin(db, PERSONAL_DATA["email"])
    login = client.post("/auth/login", json={"email": PERSONAL_DATA["email"], "senha": PERSONAL_DATA["senha"]})
    token_admin = login.json()["access_token"]

    r = client.delete("/academia/personais/99999",
                      headers={"Authorization": f"Bearer {token_admin}"})
    assert r.status_code == 404
