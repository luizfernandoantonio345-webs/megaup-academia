"""Testes para PUT/DELETE de exercícios (endpoints novos)."""

PERSONAL = {
    "nome": "Trainer Ex",
    "email": "exed@academia.com",
    "senha": "pass1234",
    "nome_academia": "Academia Ex",
}


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _criar(client, headers, nome="Supino"):
    r = client.post("/exercicios/", json={"nome": nome, "grupo_muscular": "Peito"}, headers=headers)
    assert r.status_code == 201
    return r.json()["id"]


def test_atualizar_nome(client):
    h = _auth(client)
    eid = _criar(client, h, "Agachamento Livre")
    r = client.put(f"/exercicios/{eid}", json={"nome": "Agachamento Sumô"}, headers=h)
    assert r.status_code == 200
    assert r.json()["nome"] == "Agachamento Sumô"


def test_atualizar_video_url(client):
    h = _auth(client)
    eid = _criar(client, h)
    url = "https://www.youtube.com/watch?v=abc123"
    r = client.put(f"/exercicios/{eid}", json={"video_url": url}, headers=h)
    assert r.status_code == 200
    assert r.json()["video_url"] == url


def test_limpar_video_url_com_string_vazia(client):
    h = _auth(client)
    eid = _criar(client, h)
    # Primeiro define URL
    client.put(f"/exercicios/{eid}", json={"video_url": "https://youtube.com/watch?v=x"}, headers=h)
    # Limpa com string vazia
    r = client.put(f"/exercicios/{eid}", json={"video_url": ""}, headers=h)
    assert r.status_code == 200
    assert r.json()["video_url"] is None


def test_deletar_exercicio(client):
    h = _auth(client)
    eid = _criar(client, h, "Para Deletar")
    r = client.delete(f"/exercicios/{eid}", headers=h)
    assert r.status_code == 204

    # Confirma que sumiu da lista
    r2 = client.get("/exercicios/", headers=h)
    nomes = [e["nome"] for e in r2.json()]
    assert "Para Deletar" not in nomes


def test_nao_pode_editar_exercicio_de_outro_tenant(client):
    """Tenant A não pode editar exercício do Tenant B."""
    # Personal A cria exercício
    h_a = _auth(client)
    eid = _criar(client, h_a, "Exercício do A")

    # Personal B registra e tenta editar
    client.post("/auth/registrar-personal", json={
        "nome": "Personal B", "email": "pb@academia.com",
        "senha": "pass1234", "nome_academia": "Academia B",
    })
    r_b = client.post("/auth/login", json={"email": "pb@academia.com", "senha": "pass1234"})
    h_b = {"Authorization": f"Bearer {r_b.json()['access_token']}"}

    r = client.put(f"/exercicios/{eid}", json={"nome": "Hackeado"}, headers=h_b)
    assert r.status_code == 404


def test_nao_pode_deletar_exercicio_de_outro_tenant(client):
    h_a = _auth(client)
    eid = _criar(client, h_a)

    client.post("/auth/registrar-personal", json={
        "nome": "Personal C", "email": "pc@academia.com",
        "senha": "pass1234", "nome_academia": "Academia C",
    })
    r_c = client.post("/auth/login", json={"email": "pc@academia.com", "senha": "pass1234"})
    h_c = {"Authorization": f"Bearer {r_c.json()['access_token']}"}

    r = client.delete(f"/exercicios/{eid}", headers=h_c)
    assert r.status_code == 404
