"""
Testes de FASE 4: camada de IA com mocks.

Cobre:
- sugerir_ajuste_carga: resposta válida, JSON inválido, ação inválida, IA indisponível
- gerar_treino_alternativo: resposta válida, IA indisponível
- Endpoints /ia/sugerir-carga e /ia/treino-alternativo
- Endpoint GET /alunos/{id}/sugestoes com SugestaoProgressao
- tarefa_progressao: resiliência com DB mockado
"""
import json
from unittest.mock import MagicMock, patch

import pytest

from app.ai.prescricao import gerar_treino_alternativo, sugerir_ajuste_carga

PERSONAL = {
    "nome": "IA Trainer",
    "email": "ia@academia.com",
    "senha": "pass1234",
    "nome_academia": "Academia IA",
}

HISTORICO_VALIDO = [
    {"data": "2025-01-01", "carga": 20.0, "dificuldade": "facil"},
    {"data": "2025-01-03", "carga": 20.0, "dificuldade": "facil"},
    {"data": "2025-01-05", "carga": 20.0, "dificuldade": "facil"},
]


def _auth(client):
    client.post("/auth/registrar-personal", json=PERSONAL)
    r = client.post("/auth/login", json={"email": PERSONAL["email"], "senha": PERSONAL["senha"]})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _mock_claude(texto: str):
    """Cria mock de resposta do Anthropic."""
    msg = MagicMock()
    msg.content = [MagicMock(text=texto)]
    return msg


# ---------------------------------------------------------------------------
# sugerir_ajuste_carga — testes unitários
# ---------------------------------------------------------------------------

def test_sugerir_ajuste_carga_retorna_aumentar():
    resposta = '{"acao": "aumentar", "carga_sugerida": 22.5, "motivo": "Três treinos fáceis"}'
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(resposta)
        resultado = sugerir_ajuste_carga(HISTORICO_VALIDO)

    assert resultado["acao"] == "aumentar"
    assert resultado["carga_sugerida"] == 22.5
    assert isinstance(resultado["motivo"], str)


def test_sugerir_ajuste_carga_retorna_manter():
    resposta = '{"acao": "manter", "carga_sugerida": null, "motivo": "Progresso estável"}'
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(resposta)
        resultado = sugerir_ajuste_carga(HISTORICO_VALIDO)

    assert resultado["acao"] == "manter"
    assert resultado["carga_sugerida"] is None


def test_sugerir_ajuste_carga_fallback_ia_indisponivel():
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.side_effect = Exception("Connection refused")
        resultado = sugerir_ajuste_carga(HISTORICO_VALIDO)

    assert resultado["acao"] == "manter"
    assert resultado["carga_sugerida"] is None
    assert resultado["motivo"] != ""


def test_sugerir_ajuste_carga_fallback_json_invalido():
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude("Não sou um JSON válido!")
        resultado = sugerir_ajuste_carga(HISTORICO_VALIDO)

    assert resultado["acao"] == "manter"


def test_sugerir_ajuste_carga_fallback_acao_invalida():
    """Pydantic deve rejeitar ação fora do Literal."""
    resposta = '{"acao": "explodir", "carga_sugerida": 50, "motivo": "teste"}'
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(resposta)
        resultado = sugerir_ajuste_carga(HISTORICO_VALIDO)

    assert resultado["acao"] == "manter"


def test_sugerir_ajuste_carga_aceita_markdown_fence():
    """IA às vezes envolve a saída em ```json ... ```."""
    resposta = '```json\n{"acao": "reduzir", "carga_sugerida": 15.0, "motivo": "Muito difícil"}\n```'
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(resposta)
        resultado = sugerir_ajuste_carga(HISTORICO_VALIDO)

    assert resultado["acao"] == "reduzir"
    assert resultado["carga_sugerida"] == 15.0


# ---------------------------------------------------------------------------
# gerar_treino_alternativo — testes unitários
# ---------------------------------------------------------------------------

TREINO_ORIGINAL = {
    "nome": "Treino A",
    "itens": [
        {"exercicio": "Supino com barra", "equipamento": "barra"},
        {"exercicio": "Agachamento livre", "equipamento": "barra"},
    ],
}


def test_gerar_treino_alternativo_retorna_substitutos():
    resposta = json.dumps({
        "itens": [
            {
                "exercicio_original": "Supino com barra",
                "exercicio_alternativo": "Supino com halteres",
                "motivo": "Mesmo grupamento, sem barra",
            }
        ],
        "observacoes": "Ajuste de carga recomendado",
    })
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(resposta)
        resultado = gerar_treino_alternativo(TREINO_ORIGINAL, "barra")

    assert len(resultado["itens"]) == 1
    assert resultado["itens"][0]["exercicio_alternativo"] == "Supino com halteres"
    assert resultado["observacoes"] != ""


def test_gerar_treino_alternativo_fallback_ia_indisponivel():
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.side_effect = Exception("Timeout")
        resultado = gerar_treino_alternativo(TREINO_ORIGINAL, "barra")

    assert resultado["itens"] == []
    assert resultado["observacoes"] != ""


def test_gerar_treino_alternativo_fallback_json_invalido():
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude("Aqui vai o treino alternativo!")
        resultado = gerar_treino_alternativo(TREINO_ORIGINAL, "barra")

    assert resultado["itens"] == []


# ---------------------------------------------------------------------------
# Endpoints /ia/
# ---------------------------------------------------------------------------

def test_endpoint_sugerir_carga_requer_auth(client):
    r = client.post("/ia/sugerir-carga", json=[])
    assert r.status_code == 403


def test_endpoint_sugerir_carga_com_auth(client):
    headers = _auth(client)
    resposta = '{"acao": "manter", "carga_sugerida": 20.0, "motivo": "Estável"}'
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(resposta)
        r = client.post("/ia/sugerir-carga", json=HISTORICO_VALIDO, headers=headers)

    assert r.status_code == 200
    assert r.json()["acao"] == "manter"


def test_endpoint_sugerir_carga_fallback_quando_ia_falha(client):
    """Endpoint deve retornar 200 com fallback mesmo quando IA está fora."""
    headers = _auth(client)
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.side_effect = Exception("IA fora do ar")
        r = client.post("/ia/sugerir-carga", json=HISTORICO_VALIDO, headers=headers)

    assert r.status_code == 200
    assert r.json()["acao"] == "manter"


def test_endpoint_treino_alternativo(client):
    headers = _auth(client)
    resposta = json.dumps({
        "itens": [{"exercicio_original": "X", "exercicio_alternativo": "Y", "motivo": "Z"}],
        "observacoes": "ok",
    })
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.return_value = _mock_claude(resposta)
        r = client.post("/ia/treino-alternativo", json={
            "treino_original": TREINO_ORIGINAL,
            "equipamento_indisponivel": "barra",
        }, headers=headers)

    assert r.status_code == 200
    assert len(r.json()["itens"]) == 1


def test_endpoint_treino_alternativo_fallback(client):
    headers = _auth(client)
    with patch("app.ai.prescricao.client") as mock_client:
        mock_client.messages.create.side_effect = Exception("Timeout")
        r = client.post("/ia/treino-alternativo", json={
            "treino_original": TREINO_ORIGINAL,
            "equipamento_indisponivel": "barra",
        }, headers=headers)

    assert r.status_code == 200
    assert r.json()["itens"] == []


# ---------------------------------------------------------------------------
# GET /alunos/{id}/sugestoes
# ---------------------------------------------------------------------------

def test_sugestoes_aluno_vazio(client):
    headers = _auth(client)
    r = client.post("/alunos/", json={"nome": "Aluno IA", "email": "ia@aluno.com"},
                    headers=headers)
    aluno_id = r.json()["id"]

    r = client.get(f"/alunos/{aluno_id}/sugestoes", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["aluno_id"] == aluno_id
    assert data["dias_sem_treinar"] is None
    assert data["sugestoes_pendentes"] == []


def test_sugestoes_aluno_dias_sem_treinar(client):
    headers = _auth(client)
    r = client.post("/alunos/", json={"nome": "Ativo", "email": "ativo@aluno.com"},
                    headers=headers)
    aluno_id = r.json()["id"]

    r_ex = client.post("/exercicios/", json={"nome": "Leg Press"}, headers=headers)
    ex_id = r_ex.json()["id"]

    r_t = client.post("/treinos/", json={"aluno_id": aluno_id, "nome": "Perna"}, headers=headers)
    treino_id = r_t.json()["id"]

    client.post(f"/treinos/{treino_id}/executar", json={
        "dificuldade": "ok",
        "itens": [{"exercicio_id": ex_id, "carga_realizada": 80.0}],
    }, headers=headers)

    r = client.get(f"/alunos/{aluno_id}/sugestoes", headers=headers)
    assert r.status_code == 200
    assert r.json()["dias_sem_treinar"] == 0  # executou hoje


def test_sugestoes_aluno_outro_tenant_retorna_404(client):
    hA = _auth(client)
    client.post("/auth/registrar-personal", json={
        "nome": "B", "email": "b@ia.com", "senha": "pass1234", "nome_academia": "B"
    })
    hB = {"Authorization": "Bearer " + client.post("/auth/login", json={
        "email": "b@ia.com", "senha": "pass1234",
    }).json()["access_token"]}

    r = client.post("/alunos/", json={"nome": "Aluno A", "email": "a@aluno.com"}, headers=hA)
    aluno_id = r.json()["id"]

    r = client.get(f"/alunos/{aluno_id}/sugestoes", headers=hB)
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# tarefa_progressao — resiliência
# ---------------------------------------------------------------------------

def test_tarefa_progressao_nao_lanca_excecao_com_db_mockado():
    """A tarefa deve absorver qualquer erro silenciosamente."""
    with patch("app.ai.scheduler.SessionLocal") as mock_sl:
        mock_db = MagicMock()
        mock_sl.return_value = mock_db
        mock_db.query.return_value.filter.return_value.all.return_value = []

        from app.ai.scheduler import tarefa_progressao
        tarefa_progressao()  # Não deve lançar exceção


def test_tarefa_progressao_resiliente_quando_ia_falha():
    """Erro de IA numa sugestão específica não deve cancelar as demais."""
    from app.ai.scheduler import tarefa_progressao

    with patch("app.ai.scheduler.SessionLocal") as mock_sl, \
         patch("app.ai.scheduler.sugerir_ajuste_carga", side_effect=Exception("IA fora")):
        mock_db = MagicMock()
        mock_sl.return_value = mock_db
        mock_db.query.return_value.filter.return_value.all.return_value = []

        tarefa_progressao()  # Não deve lançar exceção
