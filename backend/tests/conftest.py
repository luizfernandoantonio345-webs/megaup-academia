"""Fixtures de teste — banco SQLite em arquivo temporário, app isolado."""
import os
import builtins
import tempfile
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ── Starlette/slowapi lê .env com encoding do SO (cp1252 no Windows),
#    mas nosso .env usa UTF-8. Patch para forçar UTF-8 em arquivos .env.
_real_open = builtins.open

def _open_utf8(*args, **kwargs):
    path = str(args[0]) if args else ""
    mode = args[1] if len(args) > 1 else "r"
    if path.endswith(".env") and "b" not in str(mode):
        kwargs.setdefault("encoding", "utf-8")
    return _real_open(*args, **kwargs)

builtins.open = _open_utf8

# ── Env vars devem ser setadas ANTES de qualquer import do app
_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_db_file.close()
TEST_DB_URL = f"sqlite:///{_db_file.name}"

os.environ["DATABASE_URL"] = TEST_DB_URL
os.environ["SECRET_KEY"] = "test-secret-key-32chars-xxxxxxxxxxxx"
os.environ["TESTING"] = "1"
os.environ["ENABLE_SCHEDULER"] = "0"

# ── Agora importamos o app — usa os env vars acima
from app.core.db import Base, get_db, engine as _app_engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def test_engine():
    """Engine compartilhada com o app (mesmo arquivo SQLite)."""
    # O engine do app já está apontando para TEST_DB_URL
    # Criamos as tabelas nele
    Base.metadata.create_all(bind=_app_engine)
    yield _app_engine
    Base.metadata.drop_all(bind=_app_engine)
    try:
        os.unlink(_db_file.name)
    except OSError:
        pass


@pytest.fixture(scope="session")
def session_factory(test_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session")
def client(test_engine, session_factory):
    def override_db():
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()
