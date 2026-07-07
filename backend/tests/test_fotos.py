"""Testes para fotos de evolução (endpoints novos)."""
import base64

PERSONAL = {
    "nome": "Trainer Fotos",
    "email": "fotos@academia.com",
    "senha": "pass1234",
    "nome_academia": "Academia Fotos",
}


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _criar_aluno(client, headers, email="aluno_fotos@test.com"):
    r = client.post("/alunos/", json={"nome": "Aluno Fotos", "email": email}, headers=headers)
    assert r.status_code == 201
    return r.json()["id"]


def _foto_b64():
    """JPEG mínimo válido (1×1 pixel)."""
    jpeg = bytes([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9,
    ])
    return base64.b64encode(jpeg).decode()


def test_listar_fotos_vazio(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r = client.get(f"/alunos/{aid}/fotos", headers=h)
    assert r.status_code == 200
    assert r.json() == []


def test_upload_foto(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    payload = {
        "foto_base64": _foto_b64(),
        "tipo": "frente",
        "peso": 75.5,
        "observacao": "Início",
    }
    r = client.post(f"/alunos/{aid}/fotos", json=payload, headers=h)
    assert r.status_code == 201
    data = r.json()
    assert data["tipo"] == "frente"
    assert data["peso"] == 75.5
    assert data["observacao"] == "Início"
    assert "id" in data
    assert data["criado_em"] if "criado_em" in data else data.get("data") is not None


def test_listar_fotos_apos_upload(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    client.post(f"/alunos/{aid}/fotos", json={"foto_base64": _foto_b64(), "tipo": "lado"}, headers=h)
    client.post(f"/alunos/{aid}/fotos", json={"foto_base64": _foto_b64(), "tipo": "costas"}, headers=h)

    r = client.get(f"/alunos/{aid}/fotos", headers=h)
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_deletar_foto(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r = client.post(f"/alunos/{aid}/fotos", json={"foto_base64": _foto_b64(), "tipo": "frente"}, headers=h)
    foto_id = r.json()["id"]

    r2 = client.delete(f"/alunos/{aid}/fotos/{foto_id}", headers=h)
    assert r2.status_code == 204

    r3 = client.get(f"/alunos/{aid}/fotos", headers=h)
    assert r3.json() == []


def test_imagem_muito_grande_rejeitada(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    # base64 de mais de 210.000 chars
    grande = base64.b64encode(b"x" * 160_000).decode()
    r = client.post(f"/alunos/{aid}/fotos", json={"foto_base64": grande, "tipo": "frente"}, headers=h)
    assert r.status_code == 400


def test_base64_invalido_rejeitado(client):
    h = _auth(client)
    aid = _criar_aluno(client, h)
    r = client.post(f"/alunos/{aid}/fotos", json={"foto_base64": "nao-é-base64!!!", "tipo": "frente"}, headers=h)
    assert r.status_code == 400


def test_data_uri_prefix_aceito(client):
    """Frontend pode enviar 'data:image/jpeg;base64,...' e o backend extrai a parte base64."""
    h = _auth(client)
    aid = _criar_aluno(client, h)
    data_uri = f"data:image/jpeg;base64,{_foto_b64()}"
    r = client.post(f"/alunos/{aid}/fotos", json={"foto_base64": data_uri, "tipo": "costas"}, headers=h)
    assert r.status_code == 201


def test_isolamento_tenant(client):
    """Personal B não vê fotos do aluno do Personal A."""
    h_a = _auth(client)
    aid = _criar_aluno(client, h_a)
    client.post(f"/alunos/{aid}/fotos", json={"foto_base64": _foto_b64()}, headers=h_a)

    client.post("/auth/registrar-personal", json={
        "nome": "B", "email": "fotosb@academia.com",
        "senha": "pass1234", "nome_academia": "B",
    })
    r_b = client.post("/auth/login", json={"email": "fotosb@academia.com", "senha": "pass1234"})
    h_b = {"Authorization": f"Bearer {r_b.json()['access_token']}"}

    r = client.get(f"/alunos/{aid}/fotos", headers=h_b)
    assert r.status_code == 404
