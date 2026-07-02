"""Testes de FASE 2: CRUD de alunos e anamnese."""

PERSONAL = {
    "nome": "Trainer CRUD",
    "email": "crud@academia.com",
    "senha": "pass1234",
    "nome_academia": "Academia CRUD",
}


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_criar_aluno(client):
    headers = _auth(client)
    r = client.post("/alunos/", json={"nome": "João", "email": "joao@test.com", "objetivo": "Hipertrofia"},
                    headers=headers)
    assert r.status_code == 201
    data = r.json()
    assert data["nome"] == "João"
    assert data["email"] == "joao@test.com"
    assert data["objetivo"] == "Hipertrofia"
    assert "id" in data
    assert "tenant_id" in data


def test_listar_alunos(client):
    headers = _auth(client)
    client.post("/alunos/", json={"nome": "A1", "email": "a1@test.com"}, headers=headers)
    client.post("/alunos/", json={"nome": "A2", "email": "a2@test.com"}, headers=headers)

    r = client.get("/alunos/", headers=headers)
    assert r.status_code == 200
    nomes = [a["nome"] for a in r.json()]
    assert "A1" in nomes
    assert "A2" in nomes


def test_obter_aluno_por_id(client):
    headers = _auth(client)
    r = client.post("/alunos/", json={"nome": "Maria", "email": "maria@test.com"}, headers=headers)
    aluno_id = r.json()["id"]

    r = client.get(f"/alunos/{aluno_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["nome"] == "Maria"


def test_obter_aluno_inexistente_retorna_404(client):
    headers = _auth(client)
    r = client.get("/alunos/99999", headers=headers)
    assert r.status_code == 404


def test_anamnese_vazia_retorna_defaults(client):
    headers = _auth(client)
    r = client.post("/alunos/", json={"nome": "Sem Anamnese", "email": "sem@test.com"}, headers=headers)
    aluno_id = r.json()["id"]

    r = client.get(f"/alunos/{aluno_id}/anamnese", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["objetivo"] == ""
    assert data["restricoes"] == []


def test_salvar_e_recuperar_anamnese(client):
    headers = _auth(client)
    r = client.post("/alunos/", json={"nome": "Com Anamnese", "email": "com@test.com"}, headers=headers)
    aluno_id = r.json()["id"]

    anamnese = {
        "objetivo": "emagrecimento",
        "historico_medico": "hipertensão controlada",
        "restricoes": ["joelho direito"],
        "medicamentos": ["losartana"],
        "nivel_atividade": "sedentario",
        "lesoes": [],
        "observacoes": "prefere manhã",
    }
    r = client.put(f"/alunos/{aluno_id}/anamnese", json=anamnese, headers=headers)
    assert r.status_code == 200

    r = client.get(f"/alunos/{aluno_id}/anamnese", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["objetivo"] == "emagrecimento"
    assert data["restricoes"] == ["joelho direito"]
    assert data["medicamentos"] == ["losartana"]


def test_anamnese_aluno_inexistente_retorna_404(client):
    headers = _auth(client)
    r = client.get("/alunos/99999/anamnese", headers=headers)
    assert r.status_code == 404
