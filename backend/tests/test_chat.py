"""Testes para chat entre personal e aluno."""

PERSONAL = {
    "nome": "Trainer Chat",
    "email": "chat@academia.com",
    "senha": "pass1234",
    "nome_academia": "Academia Chat",
}


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _criar_aluno(client, headers):
    r = client.post("/alunos/", json={"nome": "Chat User", "email": "chatuser@test.com"}, headers=headers)
    return r.json()["id"]


def test_listar_mensagens_vazio(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r = client.get(f"/chat/{aid}", headers=h)
    assert r.status_code == 200
    assert r.json() == []


def test_enviar_mensagem(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r = client.post(f"/chat/{aid}", json={"texto": "Olá aluno!"}, headers=h)
    assert r.status_code == 201
    data = r.json()
    assert data["texto"] == "Olá aluno!"
    assert data["meu"] is True


def test_timestamp_termina_com_z(client):
    """Timestamps devem ter sufixo Z para o browser interpretar como UTC."""
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r = client.post(f"/chat/{aid}", json={"texto": "Teste timezone"}, headers=h)
    assert r.json()["criado_em"].endswith("Z"), "Timestamp deve terminar com 'Z' (UTC explícito)"


def test_mensagem_vazia_rejeitada(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r = client.post(f"/chat/{aid}", json={"texto": "   "}, headers=h)
    assert r.status_code == 400


def test_mensagem_muito_longa_rejeitada(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r = client.post(f"/chat/{aid}", json={"texto": "x" * 2001}, headers=h)
    assert r.status_code == 400


def test_polling_incremental(client):
    """desde_id retorna apenas mensagens com id maior."""
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r1 = client.post(f"/chat/{aid}", json={"texto": "Msg 1"}, headers=h)
    id1 = r1.json()["id"]
    client.post(f"/chat/{aid}", json={"texto": "Msg 2"}, headers=h)

    r = client.get(f"/chat/{aid}?desde_id={id1}", headers=h)
    assert r.status_code == 200
    textos = [m["texto"] for m in r.json()]
    assert "Msg 1" not in textos
    assert "Msg 2" in textos


def test_chat_aluno_inexistente_retorna_404(client):
    h = _auth(client)
    r = client.get("/chat/99999", headers=h)
    assert r.status_code == 404
