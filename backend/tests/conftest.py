import os
os.environ["TESTING"] = "1"  # desativa rate limiting antes de qualquer import do app

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.db import Base, get_db
from app.main import app

# StaticPool garante que create_all e a session usam a mesma conexão in-memory
_ENGINE_KWARGS = {
    "connect_args": {"check_same_thread": False},
    "poolclass": StaticPool,
}


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:", **_ENGINE_KWARGS)
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(autocommit=False, autoflush=False, bind=engine)()
    try:
        yield session
    finally:
        session.close()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
