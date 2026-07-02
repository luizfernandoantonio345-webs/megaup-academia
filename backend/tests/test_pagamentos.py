"""
Testes FASE 9 — Pagamentos.

Cobrem: criação de plano, listagem, cobrança, marcar pago,
resumo financeiro, webhook Asaas, isolamento entre tenants.
"""
import pytest
from datetime import datetime, timedelta

PERSONAL = {
    "nome": "Personal Pag",
    "email": "personal.pag@test.com",
    "senha": "senha123",
    "nome_academia": "Academia Pag",
}
PERSONAL2 = {
    "nome": "Personal B",
    "email": "personalb@test.com",
    "senha": "senha123",
    "nome_academia": "Academia B",
}
ALUNO = {
    "nome": "Aluno Pag",
    "email": "aluno.pag@test.com",
    "objetivo": "Emagrecer",
}


def _setup(client):
    """Retorna (token_personal, aluno_id)."""
    client.post("/auth/registrar-personal", json=PERSONAL)
    login = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    token = login.json()["access_token"]
    r = client.post("/alunos/", json=ALUNO, headers={"Authorization": f"Bearer {token}"})
    aluno_id = r.json()["id"]
    return token, aluno_id


def _plano_payload(aluno_id):
    return {"aluno_id": aluno_id, "nome": "Plano Mensal", "valor": 250.0, "dia_vencimento": 10}


# ---------------------------------------------------------------------------
# Planos
# ---------------------------------------------------------------------------

def test_criar_plano(client):
    token, aluno_id = _setup(client)
    r = client.post(
        "/pagamentos/planos/",
        json=_plano_payload(aluno_id),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["valor"] == 250.0
    assert data["aluno_id"] == aluno_id
    assert data["status"] == "ativo"


def test_criar_plano_valor_invalido(client):
    token, aluno_id = _setup(client)
    r = client.post(
        "/pagamentos/planos/",
        json={"aluno_id": aluno_id, "nome": "Plano", "valor": -10, "dia_vencimento": 10},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 422


def test_criar_plano_dia_vencimento_invalido(client):
    token, aluno_id = _setup(client)
    r = client.post(
        "/pagamentos/planos/",
        json={"aluno_id": aluno_id, "nome": "Plano", "valor": 100, "dia_vencimento": 31},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 422


def test_plano_duplicado_retorna_409(client):
    token, aluno_id = _setup(client)
    payload = _plano_payload(aluno_id)
    client.post("/pagamentos/planos/", json=payload, headers={"Authorization": f"Bearer {token}"})
    r = client.post("/pagamentos/planos/", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 409


def test_listar_planos(client):
    token, aluno_id = _setup(client)
    client.post("/pagamentos/planos/", json=_plano_payload(aluno_id),
                headers={"Authorization": f"Bearer {token}"})
    r = client.get("/pagamentos/planos/", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_inativar_plano(client):
    token, aluno_id = _setup(client)
    r = client.post("/pagamentos/planos/", json=_plano_payload(aluno_id),
                    headers={"Authorization": f"Bearer {token}"})
    plano_id = r.json()["id"]
    r = client.delete(f"/pagamentos/planos/{plano_id}",
                      headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 204


def test_plano_outro_tenant_retorna_404(client):
    _, aluno_id = _setup(client)
    client.post("/auth/registrar-personal", json=PERSONAL2)
    login2 = client.post("/auth/login", json={"email": PERSONAL2["email"], "senha": PERSONAL2["senha"]})
    token2 = login2.json()["access_token"]
    r = client.post(
        "/pagamentos/planos/",
        json={"aluno_id": aluno_id, "nome": "X", "valor": 100, "dia_vencimento": 5},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Cobranças
# ---------------------------------------------------------------------------

def _criar_plano(client, token, aluno_id):
    r = client.post("/pagamentos/planos/", json=_plano_payload(aluno_id),
                    headers={"Authorization": f"Bearer {token}"})
    return r.json()["id"]


def test_criar_cobranca(client):
    token, aluno_id = _setup(client)
    plano_id = _criar_plano(client, token, aluno_id)
    vencimento = (datetime.utcnow() + timedelta(days=30)).isoformat()
    r = client.post(
        "/pagamentos/cobrancas/",
        json={"plano_id": plano_id, "vencimento": vencimento},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["valor"] == 250.0
    assert data["status"] == "pendente"


def test_listar_cobrancas(client):
    token, aluno_id = _setup(client)
    plano_id = _criar_plano(client, token, aluno_id)
    vencimento = (datetime.utcnow() + timedelta(days=30)).isoformat()
    client.post("/pagamentos/cobrancas/",
                json={"plano_id": plano_id, "vencimento": vencimento},
                headers={"Authorization": f"Bearer {token}"})
    r = client.get("/pagamentos/cobrancas/", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_marcar_pago(client):
    token, aluno_id = _setup(client)
    plano_id = _criar_plano(client, token, aluno_id)
    vencimento = (datetime.utcnow() + timedelta(days=30)).isoformat()
    r = client.post("/pagamentos/cobrancas/",
                    json={"plano_id": plano_id, "vencimento": vencimento},
                    headers={"Authorization": f"Bearer {token}"})
    cob_id = r.json()["id"]

    r = client.patch(f"/pagamentos/cobrancas/{cob_id}/pagar",
                     json={},
                     headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["status"] == "pago"
    assert r.json()["pago_em"] is not None


def test_marcar_pago_duas_vezes_retorna_409(client):
    token, aluno_id = _setup(client)
    plano_id = _criar_plano(client, token, aluno_id)
    vencimento = (datetime.utcnow() + timedelta(days=30)).isoformat()
    r = client.post("/pagamentos/cobrancas/",
                    json={"plano_id": plano_id, "vencimento": vencimento},
                    headers={"Authorization": f"Bearer {token}"})
    cob_id = r.json()["id"]
    client.patch(f"/pagamentos/cobrancas/{cob_id}/pagar", json={},
                 headers={"Authorization": f"Bearer {token}"})
    r = client.patch(f"/pagamentos/cobrancas/{cob_id}/pagar", json={},
                     headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 409


# ---------------------------------------------------------------------------
# Resumo financeiro
# ---------------------------------------------------------------------------

def test_resumo_financeiro(client):
    token, aluno_id = _setup(client)
    _criar_plano(client, token, aluno_id)
    r = client.get("/pagamentos/resumo", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["total_alunos_com_plano"] == 1
    assert data["receita_mensal_prevista"] == 250.0
    assert "inadimplentes" in data
    assert "proximas_cobrancas" in data


def test_resumo_inadimplentes(client):
    token, aluno_id = _setup(client)
    plano_id = _criar_plano(client, token, aluno_id)
    # cobrança já vencida
    vencimento = (datetime.utcnow() - timedelta(days=5)).isoformat()
    client.post("/pagamentos/cobrancas/",
                json={"plano_id": plano_id, "vencimento": vencimento},
                headers={"Authorization": f"Bearer {token}"})
    r = client.get("/pagamentos/resumo", headers={"Authorization": f"Bearer {token}"})
    data = r.json()
    assert data["inadimplentes"] >= 1
    assert data["valor_inadimplente"] >= 250.0


# ---------------------------------------------------------------------------
# Webhook Asaas
# ---------------------------------------------------------------------------

def test_webhook_asaas_marca_pago(client):
    token, aluno_id = _setup(client)
    plano_id = _criar_plano(client, token, aluno_id)
    vencimento = (datetime.utcnow() + timedelta(days=5)).isoformat()
    r = client.post("/pagamentos/cobrancas/",
                    json={"plano_id": plano_id, "vencimento": vencimento},
                    headers={"Authorization": f"Bearer {token}"})
    asaas_id = r.json().get("asaas_id")

    # Simula webhook do Asaas
    r = client.post("/pagamentos/webhook/asaas", json={
        "event": "PAYMENT_RECEIVED",
        "payment": {"id": asaas_id},
    })
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_webhook_evento_desconhecido_ignorado(client):
    r = client.post("/pagamentos/webhook/asaas", json={
        "event": "PAYMENT_REFUNDED",
        "payment": {"id": "qualquer"},
    })
    assert r.status_code == 200
    assert r.json()["processado"] is False
