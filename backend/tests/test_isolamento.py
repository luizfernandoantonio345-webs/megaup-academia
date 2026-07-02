"""
Testes de isolamento multi-tenant (FASE 2 — critério obrigatório).

Prova que um personal/tenant não enxerga NADA dos dados de outro tenant:
  - listagem de alunos retorna vazia para o tenant errado
  - GET por ID retorna 404 (não revela existência)
  - treinos idem
  - não é possível criar treino para aluno de outro tenant
  - não é possível adicionar item a treino de outro tenant
"""

PERSONAL_A = {
    "nome": "Personal A",
    "email": "persona@teste.com",
    "senha": "passA1234",
    "nome_academia": "Academia A",
}
PERSONAL_B = {
    "nome": "Personal B",
    "email": "personalb@teste.com",
    "senha": "passB1234",
    "nome_academia": "Academia B",
}


def _registrar_e_logar(client, payload):
    client.post("/auth/registrar-personal", json=payload)
    r = client.post("/auth/login", json={"email": payload["email"], "senha": payload["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _criar_aluno(client, headers, nome="Aluno", email="aluno@test.com"):
    r = client.post("/alunos/", json={"nome": nome, "email": email}, headers=headers)
    assert r.status_code == 201
    return r.json()["id"]


def _criar_exercicio(client, headers, nome="Supino"):
    r = client.post("/exercicios/", json={"nome": nome}, headers=headers)
    assert r.status_code == 201
    return r.json()["id"]


def _criar_treino(client, headers, aluno_id, nome="Treino"):
    r = client.post("/treinos/", json={"aluno_id": aluno_id, "nome": nome}, headers=headers)
    assert r.status_code == 201
    return r.json()["id"]


# ---------------------------------------------------------------------------
# Isolamento de alunos
# ---------------------------------------------------------------------------

def test_listagem_alunos_so_retorna_do_proprio_tenant(client):
    hA = _registrar_e_logar(client, PERSONAL_A)
    hB = _registrar_e_logar(client, PERSONAL_B)

    _criar_aluno(client, hA, "Aluno de A", "alunoA@test.com")

    r = client.get("/alunos/", headers=hB)
    assert r.status_code == 200
    assert r.json() == [], "Tenant B não deve ver alunos do tenant A"


def test_obter_aluno_de_outro_tenant_retorna_404(client):
    hA = _registrar_e_logar(client, PERSONAL_A)
    hB = _registrar_e_logar(client, PERSONAL_B)

    aluno_id_de_A = _criar_aluno(client, hA, "Aluno de A", "alunoA2@test.com")

    r = client.get(f"/alunos/{aluno_id_de_A}", headers=hB)
    assert r.status_code == 404, "Tenant B não deve descobrir que o aluno existe"


def test_anamnese_aluno_de_outro_tenant_retorna_404(client):
    hA = _registrar_e_logar(client, PERSONAL_A)
    hB = _registrar_e_logar(client, PERSONAL_B)

    aluno_id = _criar_aluno(client, hA, "Aluno A3", "a3@test.com")
    client.put(f"/alunos/{aluno_id}/anamnese",
               json={"objetivo": "segredo"}, headers=hA)

    r = client.get(f"/alunos/{aluno_id}/anamnese", headers=hB)
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Isolamento de treinos
# ---------------------------------------------------------------------------

def test_listagem_treinos_so_retorna_do_proprio_tenant(client):
    hA = _registrar_e_logar(client, PERSONAL_A)
    hB = _registrar_e_logar(client, PERSONAL_B)

    aluno_id_A = _criar_aluno(client, hA, "Aluno de A", "alunoA4@test.com")
    _criar_treino(client, hA, aluno_id_A, "Treino de A")

    r = client.get("/treinos/", headers=hB)
    assert r.status_code == 200
    assert r.json() == [], "Tenant B não deve ver treinos do tenant A"


def test_obter_treino_de_outro_tenant_retorna_404(client):
    hA = _registrar_e_logar(client, PERSONAL_A)
    hB = _registrar_e_logar(client, PERSONAL_B)

    aluno_id_A = _criar_aluno(client, hA, "Aluno de A", "alunoA5@test.com")
    treino_id = _criar_treino(client, hA, aluno_id_A)

    r = client.get(f"/treinos/{treino_id}", headers=hB)
    assert r.status_code == 404


def test_criar_treino_para_aluno_de_outro_tenant_retorna_404(client):
    hA = _registrar_e_logar(client, PERSONAL_A)
    hB = _registrar_e_logar(client, PERSONAL_B)

    aluno_id_A = _criar_aluno(client, hA, "Aluno de A", "alunoA6@test.com")

    r = client.post("/treinos/", json={"aluno_id": aluno_id_A, "nome": "Invasão"},
                    headers=hB)
    assert r.status_code == 404, "Tenant B não pode criar treino para aluno do tenant A"


def test_adicionar_item_a_treino_de_outro_tenant_retorna_404(client):
    hA = _registrar_e_logar(client, PERSONAL_A)
    hB = _registrar_e_logar(client, PERSONAL_B)

    aluno_id_A = _criar_aluno(client, hA, "Aluno de A", "alunoA7@test.com")
    treino_id_A = _criar_treino(client, hA, aluno_id_A)
    ex_id_B = _criar_exercicio(client, hB, "Agachamento B")

    r = client.post(f"/treinos/{treino_id_A}/itens/",
                    json={"exercicio_id": ex_id_B}, headers=hB)
    assert r.status_code == 404, "Tenant B não pode adicionar item ao treino do tenant A"


# ---------------------------------------------------------------------------
# Exercícios: tenant não vê exercícios customizados de outro tenant
# ---------------------------------------------------------------------------

def test_exercicio_customizado_de_outro_tenant_nao_aparece(client):
    hA = _registrar_e_logar(client, PERSONAL_A)
    hB = _registrar_e_logar(client, PERSONAL_B)

    client.post("/exercicios/", json={"nome": "Exercício Secreto de A"}, headers=hA)

    r = client.get("/exercicios/", headers=hB)
    nomes = [e["nome"] for e in r.json()]
    assert "Exercício Secreto de A" not in nomes
