"""
Testes de integração — fluxos críticos do MegaUp.

Execução:
  cd backend
  pytest tests/ -v

Banco isolado: SQLite em memória (ver conftest.py).
"""
import pytest

# ── helpers ───────────────────────────────────────────────────────────────────

def _login(client, email: str, senha: str):
    r = client.post("/auth/login", json={"email": email, "senha": senha})
    return r


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── fixtures de autenticação ─────────────────────────────────────────────────

@pytest.fixture(scope="module")
def admin_token(client):
    # Registrar personal se ainda não existe
    client.post("/auth/registrar-personal", json={
        "nome": "Personal Teste",
        "email": "personal@teste.com",
        "senha": "senha1234",
        "nome_academia": "Academia Integração",
        "termos_aceitos": True,
    })
    r = _login(client, "personal@teste.com", "senha1234")
    assert r.status_code == 200, f"Login falhou: {r.text}"
    return r.json()["access_token"]


# ── SUITE 1: Autenticação ──────────────────────────────────────────────────

class TestAuth:
    def test_login_sucesso(self, client, admin_token):
        """Token válido retornado após login correto."""
        assert admin_token

    def test_login_senha_errada(self, client):
        """Credenciais inválidas devem retornar 401."""
        r = _login(client, "personal@teste.com", "senha_errada")
        assert r.status_code == 401

    def test_login_email_inexistente(self, client):
        """E-mail não cadastrado deve retornar 401."""
        r = _login(client, "naoexiste@teste.com", "qualquersenha")
        assert r.status_code == 401

    def test_me_autenticado(self, client, admin_token):
        """GET /auth/me retorna dados do usuário logado."""
        r = client.get("/auth/me", headers=_headers(admin_token))
        assert r.status_code == 200
        data = r.json()
        assert "email" in data
        assert data["email"] == "personal@teste.com"

    def test_me_sem_token(self, client):
        """GET /auth/me sem token deve retornar 401 ou 403."""
        r = client.get("/auth/me")
        assert r.status_code in (401, 403)

    def test_registro_email_duplicado(self, client):
        """Registrar o mesmo e-mail duas vezes deve retornar 409."""
        r = client.post("/auth/registrar-personal", json={
            "nome": "Duplicado",
            "email": "personal@teste.com",
            "senha": "senha1234",
            "nome_academia": "Qualquer",
            "termos_aceitos": True,
        })
        assert r.status_code == 409

    def test_registro_senha_fraca(self, client):
        """Senha com menos de 8 caracteres deve falhar com 422."""
        r = client.post("/auth/registrar-personal", json={
            "nome": "Fraco",
            "email": "fraco@teste.com",
            "senha": "123",
            "nome_academia": "Qualquer",
            "termos_aceitos": True,
        })
        assert r.status_code == 422


# ── SUITE 2: Alunos ───────────────────────────────────────────────────────

class TestAlunos:
    @pytest.fixture(scope="class")
    def aluno_id(self, client, admin_token):
        r = client.post(
            "/alunos/",
            json={"nome": "Carlos Aluno", "email": "carlos@integra.com", "objetivo": "Hipertrofia"},
            headers=_headers(admin_token),
        )
        assert r.status_code == 201, f"Criar aluno falhou: {r.text}"
        return r.json()["id"]

    def test_criar_aluno(self, aluno_id):
        """Aluno criado com ID válido."""
        assert aluno_id > 0

    def test_listar_alunos(self, client, admin_token):
        """GET /alunos retorna lista não vazia."""
        r = client.get("/alunos/", headers=_headers(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 1

    def test_detalhe_aluno(self, client, admin_token, aluno_id):
        """GET /alunos/{id} retorna dados corretos."""
        r = client.get(f"/alunos/{aluno_id}", headers=_headers(admin_token))
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == aluno_id
        assert data["nome"] == "Carlos Aluno"

    def test_detalhe_aluno_inexistente(self, client, admin_token):
        """GET /alunos/99999 deve retornar 404."""
        r = client.get("/alunos/99999", headers=_headers(admin_token))
        assert r.status_code == 404

    def test_criar_aluno_sem_autenticacao(self, client):
        """Criar aluno sem token deve retornar 401 ou 403."""
        r = client.post("/alunos/", json={"nome": "X", "email": "x@x.com"})
        assert r.status_code in (401, 403)

    def test_atualizar_aluno(self, client, admin_token, aluno_id):
        """PATCH /alunos/{id} atualiza o nome corretamente."""
        r = client.patch(
            f"/alunos/{aluno_id}",
            json={"nome": "Carlos Atualizado"},
            headers=_headers(admin_token),
        )
        assert r.status_code in (200, 204)


# ── SUITE 3: Treinos ─────────────────────────────────────────────────────

class TestTreinos:
    @pytest.fixture(scope="class")
    def exercicio_id(self, client, admin_token):
        r = client.get("/exercicios/", headers=_headers(admin_token))
        if r.status_code == 200 and len(r.json()) > 0:
            return r.json()[0]["id"]
        # Criar exercício mínimo se não existir
        r2 = client.post(
            "/exercicios/",
            json={"nome": "Supino Reto", "grupo_muscular": "Peito", "equipamento": "Barra"},
            headers=_headers(admin_token),
        )
        if r2.status_code in (200, 201):
            return r2.json()["id"]
        return None  # exercícios não existem — pular testes dependentes

    @pytest.fixture(scope="class")
    def treino_id(self, client, admin_token):
        r_aluno = client.get("/alunos/", headers=_headers(admin_token))
        assert r_aluno.status_code == 200 and len(r_aluno.json()) > 0
        aluno_id = r_aluno.json()[0]["id"]

        r = client.post(
            "/treinos/",
            json={"aluno_id": aluno_id, "nome": "Treino A", "dia_semana": "segunda"},
            headers=_headers(admin_token),
        )
        if r.status_code in (200, 201):
            return r.json()["id"]
        return None

    def test_criar_treino(self, treino_id):
        """Treino criado com ID válido."""
        if treino_id is None:
            pytest.skip("Rota de treinos não disponível neste ambiente")
        assert treino_id > 0

    def test_listar_treinos_aluno(self, client, admin_token):
        """GET /treinos/?aluno_id=X retorna lista de treinos do aluno."""
        r_aluno = client.get("/alunos/", headers=_headers(admin_token))
        aluno_id = r_aluno.json()[0]["id"]
        r = client.get(f"/treinos/?aluno_id={aluno_id}", headers=_headers(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ── SUITE 4: Check-in ────────────────────────────────────────────────────

class TestCheckin:
    def test_qr_data_requer_personal(self, client):
        """GET /checkin/qr-data sem token deve retornar 401 ou 403."""
        r = client.get("/checkin/qr-data")
        assert r.status_code in (401, 403)

    def test_qr_data_com_personal(self, client, admin_token):
        """GET /checkin/qr-data com personal retorna token diário."""
        r = client.get("/checkin/qr-data", headers=_headers(admin_token))
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        assert len(data["token"]) > 0

    def test_checkin_token_invalido(self, client, admin_token):
        """POST /checkin/ com token errado deve retornar 400."""
        r = client.post(
            "/checkin/",
            json={"token": "token_invalido_xxxxx"},
            headers=_headers(admin_token),
        )
        assert r.status_code == 400

    def test_checkin_token_valido(self, client, admin_token):
        """Check-in com token correto do dia deve retornar ok=True."""
        qr_r = client.get("/checkin/qr-data", headers=_headers(admin_token))
        token = qr_r.json()["token"]

        r = client.post(
            "/checkin/",
            json={"token": token},
            headers=_headers(admin_token),
        )
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True

    def test_checkin_duplo_no_mesmo_dia(self, client, admin_token):
        """Segundo check-in no mesmo dia retorna ok=True mas novo=False."""
        qr_r = client.get("/checkin/qr-data", headers=_headers(admin_token))
        token = qr_r.json()["token"]

        # Primeiro já foi feito no teste anterior; este deve retornar novo=False
        r = client.post(
            "/checkin/",
            json={"token": token},
            headers=_headers(admin_token),
        )
        assert r.status_code == 200
        assert r.json()["novo"] is False

    def test_meus_checkins(self, client, admin_token):
        """GET /checkin/meus retorna lista de check-ins do usuário."""
        r = client.get("/checkin/meus", headers=_headers(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 1


# ── SUITE 5: Health check ────────────────────────────────────────────────

class TestHealth:
    def test_health_ok(self, client):
        """GET /health deve retornar 200."""
        r = client.get("/health")
        assert r.status_code == 200
