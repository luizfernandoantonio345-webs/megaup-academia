from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Render entrega "postgres://" mas SQLAlchemy 2 exige "postgresql://"
_db_url = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    _db_url,
    pool_pre_ping=True,           # descarta conexões mortas antes de usar
    pool_size=5,                  # Render free: max_connections=97; 5 ativas é suficiente
    max_overflow=10,              # pico: até 15 conexões simultâneas
    pool_recycle=300,             # recicla a cada 5 min (Render fecha idle > 10 min)
    pool_timeout=10,              # falha rápido se não há conexão disponível
    connect_args={"connect_timeout": 5},  # timeout de TCP ao conectar
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
