from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

_db_url = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
_is_sqlite = _db_url.startswith("sqlite")

if _is_sqlite:
    engine = create_engine(
        _db_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    _connect_args: dict = {"connect_timeout": 10}
    # Neon (and most managed PostgreSQL) requires SSL — add if not already in URL
    if "sslmode" not in _db_url:
        _connect_args["sslmode"] = "require"
    engine = create_engine(
        _db_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
        pool_timeout=15,
        connect_args=_connect_args,
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
