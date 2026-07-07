from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Render entrega "postgres://" mas SQLAlchemy 2 exige "postgresql://"
_db_url = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    _db_url,
    pool_pre_ping=True,      # descarta conexões mortas antes de usar
    pool_size=10,            # conexões mantidas abertas no pool
    max_overflow=20,         # conexões extras além do pool_size (pico de carga)
    pool_recycle=1800,       # recicla conexões a cada 30 min (evita timeout do PG)
    pool_timeout=30,         # aguarda até 30s por uma conexão disponível
    echo=False,              # nunca logar SQL em produção
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
