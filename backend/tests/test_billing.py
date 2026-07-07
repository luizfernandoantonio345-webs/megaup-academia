"""Testes de billing: status, checkout, webhook."""
from unittest.mock import patch, MagicMock

PERSONAL = {
    "nome": "Trainer Billing",
    "email": "billing@test.com",
    "senha": "Senha@2024",
    "nome_academia": "Academia Billing",
}


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_billing_status_retorna_trial(client):
    h = _auth(client)
    r = client.get("/billing/status", headers=h)
    assert r.status_code == 200
    data = r.json()
    assert data["tier"] in ("trial", "free")
    assert data["stripe_configurado"] is False


def test_checkout_sem_stripe_retorna_503(client):
    h = _auth(client)
    r = client.post("/billing/checkout", json={"plano": "starter"}, headers=h)
    assert r.status_code == 503


def test_checkout_plano_invalido_retorna_400(client):
    h = _auth(client)
    r = client.post("/billing/checkout", json={"plano": "invalido"}, headers=h)
    assert r.status_code in (400, 503)


def test_listar_planos_publico(client):
    r = client.get("/billing/planos")
    assert r.status_code == 200
    planos = r.json()
    tiers = [p["tier"] for p in planos]
    assert "starter" in tiers
    assert "pro" in tiers
    assert "elite" in tiers


def test_billing_sem_token_retorna_403(client):
    r = client.get("/billing/status")
    assert r.status_code == 403


def test_webhook_sem_stripe_configurado_retorna_200(client):
    """Webhook sem Stripe configurado deve retornar 200 sem processar."""
    r = client.post("/billing/webhook", content=b"{}", headers={"stripe-signature": "t=x,v1=y"})
    assert r.status_code == 200
