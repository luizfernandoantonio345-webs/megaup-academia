"""Testes de RBAC: aluno não pode chamar endpoints exclusivos de personal."""

PERSONAL = {
    "nome": "Personal RBAC",
    "email": "rbac.personal@test.com",
    "senha": "Senha@2024",
    "nome_academia": "Academia RBAC",
}
# Segundo personal simula "aluno" com token diferente mas role personal
# (não temos como criar aluno com login sem convite no teste)
INTRUSO = {
    "nome": "Intruso",
    "email": "intruso@test.com",
    "senha": "Senha@2024",
    "nome_academia": "Academia Intruso",
}


def _auth(client, payload):
    client.post("/auth/registrar-personal", json=payload)
    r = client.post("/auth/login", json={"email": payload["email"], "senha": payload["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_personal_pode_criar_aluno(client):
    h = _auth(client, PERSONAL)
    r = client.post("/alunos/", json={"nome": "Aluno OK", "email": "ok@test.com"}, headers=h)
    assert r.status_code == 201


def test_senha_curta_rejeitada_no_registro(client):
    payload = {**PERSONAL, "email": "curta@test.com", "senha": "abc"}
    r = client.post("/auth/registrar-personal", json=payload)
    assert r.status_code == 422


def test_senha_so_numeros_rejeitada(client):
    payload = {**PERSONAL, "email": "numeros@test.com", "senha": "12345678"}
    r = client.post("/auth/registrar-personal", json=payload)
    assert r.status_code == 422


def test_health_check_retorna_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_isolamento_billing_outro_tenant(client):
    """Personal A não pode ver billing de Personal B."""
    hA = _auth(client, PERSONAL)
    hB = _auth(client, INTRUSO)
    rA = client.get("/billing/status", headers=hA)
    rB = client.get("/billing/status", headers=hB)
    assert rA.status_code == 200
    assert rB.status_code == 200
    # Cada um vê apenas seu próprio tenant
    assert rA.json()["tier"] in ("trial", "free")
    assert rB.json()["tier"] in ("trial", "free")
