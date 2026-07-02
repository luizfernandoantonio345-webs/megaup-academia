"""Testes de FASE 2: CRUD de treinos, itens e exercícios."""

PERSONAL = {
    "nome": "Trainer Treinos",
    "email": "treinos@academia.com",
    "senha": "pass1234",
    "nome_academia": "Academia Treinos",
}


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _criar_aluno(client, headers, nome="Aluno", email="aluno@test.com"):
    r = client.post("/alunos/", json={"nome": nome, "email": email}, headers=headers)
    return r.json()["id"]


def _criar_exercicio(client, headers, nome="Supino"):
    r = client.post("/exercicios/", json={"nome": nome, "grupo_muscular": "peito"}, headers=headers)
    return r.json()["id"]


# ---------------------------------------------------------------------------
# Exercícios
# ---------------------------------------------------------------------------

def test_criar_exercicio_customizado(client):
    headers = _auth(client)
    r = client.post("/exercicios/", json={
        "nome": "Rosca Direta",
        "grupo_muscular": "bíceps",
        "equipamento": "barra",
    }, headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert data["nome"] == "Rosca Direta"
    assert data["tenant_id"] is not None


def test_listar_exercicios_retorna_proprios(client):
    headers = _auth(client)
    client.post("/exercicios/", json={"nome": "Leg Press"}, headers=headers)
    r = client.get("/exercicios/", headers=headers)
    assert r.status_code == 200
    nomes = [e["nome"] for e in r.json()]
    assert "Leg Press" in nomes


# ---------------------------------------------------------------------------
# Treinos
# ---------------------------------------------------------------------------

def test_criar_treino(client):
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers)

    r = client.post("/treinos/", json={
        "aluno_id": aluno_id,
        "nome": "Treino A",
        "dia_semana": "segunda",
    }, headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert data["nome"] == "Treino A"
    assert data["aluno_id"] == aluno_id
    assert data["itens"] == []


def test_criar_treino_aluno_inexistente_retorna_404(client):
    headers = _auth(client)
    r = client.post("/treinos/", json={"aluno_id": 99999, "nome": "Treino X"}, headers=headers)
    assert r.status_code == 404


def test_listar_treinos(client):
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers)
    client.post("/treinos/", json={"aluno_id": aluno_id, "nome": "T1"}, headers=headers)
    client.post("/treinos/", json={"aluno_id": aluno_id, "nome": "T2"}, headers=headers)

    r = client.get("/treinos/", headers=headers)
    assert r.status_code == 200
    nomes = [t["nome"] for t in r.json()]
    assert "T1" in nomes and "T2" in nomes


def test_listar_treinos_filtrado_por_aluno(client):
    headers = _auth(client)
    aluno1 = _criar_aluno(client, headers, "Aluno1", "a1@test.com")
    aluno2 = _criar_aluno(client, headers, "Aluno2", "a2@test.com")
    client.post("/treinos/", json={"aluno_id": aluno1, "nome": "Treino do Aluno1"}, headers=headers)
    client.post("/treinos/", json={"aluno_id": aluno2, "nome": "Treino do Aluno2"}, headers=headers)

    r = client.get(f"/treinos/?aluno_id={aluno1}", headers=headers)
    assert r.status_code == 200
    nomes = [t["nome"] for t in r.json()]
    assert "Treino do Aluno1" in nomes
    assert "Treino do Aluno2" not in nomes


def test_obter_treino_por_id(client):
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers)
    r = client.post("/treinos/", json={"aluno_id": aluno_id, "nome": "Treino Detalhe"}, headers=headers)
    treino_id = r.json()["id"]

    r = client.get(f"/treinos/{treino_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["nome"] == "Treino Detalhe"


def test_obter_treino_inexistente_retorna_404(client):
    headers = _auth(client)
    r = client.get("/treinos/99999", headers=headers)
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Itens de treino
# ---------------------------------------------------------------------------

def test_adicionar_item_ao_treino(client):
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers)
    ex_id = _criar_exercicio(client, headers)
    r = client.post("/treinos/", json={"aluno_id": aluno_id, "nome": "Treino com Itens"}, headers=headers)
    treino_id = r.json()["id"]

    r = client.post(f"/treinos/{treino_id}/itens/", json={
        "exercicio_id": ex_id,
        "series": 4,
        "repeticoes": "10-12",
        "carga": 50.0,
        "descanso_seg": 90,
        "ordem": 1,
    }, headers=headers)
    assert r.status_code == 201
    item = r.json()
    assert item["exercicio_id"] == ex_id
    assert item["series"] == 4
    assert item["carga"] == 50.0


def test_treino_com_itens_aparece_no_detalhe(client):
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers)
    ex_id = _criar_exercicio(client, headers)
    r = client.post("/treinos/", json={"aluno_id": aluno_id, "nome": "Com Itens"}, headers=headers)
    treino_id = r.json()["id"]
    client.post(f"/treinos/{treino_id}/itens/", json={"exercicio_id": ex_id}, headers=headers)

    r = client.get(f"/treinos/{treino_id}", headers=headers)
    assert r.status_code == 200
    assert len(r.json()["itens"]) == 1
    assert r.json()["itens"][0]["exercicio_id"] == ex_id


def test_remover_item_do_treino(client):
    headers = _auth(client)
    aluno_id = _criar_aluno(client, headers)
    ex_id = _criar_exercicio(client, headers)
    r = client.post("/treinos/", json={"aluno_id": aluno_id, "nome": "Remove Item"}, headers=headers)
    treino_id = r.json()["id"]
    r = client.post(f"/treinos/{treino_id}/itens/", json={"exercicio_id": ex_id}, headers=headers)
    item_id = r.json()["id"]

    r = client.delete(f"/treinos/{treino_id}/itens/{item_id}", headers=headers)
    assert r.status_code == 204

    r = client.get(f"/treinos/{treino_id}", headers=headers)
    assert r.json()["itens"] == []


def test_adicionar_item_treino_inexistente_retorna_404(client):
    headers = _auth(client)
    r = client.post("/treinos/99999/itens/", json={"exercicio_id": 1}, headers=headers)
    assert r.status_code == 404
