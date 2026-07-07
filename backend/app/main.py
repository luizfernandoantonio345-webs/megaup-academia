from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.config import settings
from app.core.db import engine


def _sprint_j_migration():
    """Password reset tokens + colunas de perfil público no user."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        user_cols = {c["name"] for c in inspector.get_columns("users")}
        stmts = []
        if "bio" not in user_cols:
            stmts.append("ALTER TABLE users ADD COLUMN bio TEXT")
        if "especialidades" not in user_cols:
            stmts.append("ALTER TABLE users ADD COLUMN especialidades VARCHAR")
        if "foto_url" not in user_cols:
            stmts.append("ALTER TABLE users ADD COLUMN foto_url VARCHAR")
        if "password_reset_tokens" not in tables:
            stmts.append("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    token VARCHAR UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    criado_em TIMESTAMP DEFAULT NOW()
                )
            """)
        if stmts:
            with engine.connect() as conn:
                for s in stmts:
                    conn.execute(text(s))
                conn.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("sprint_j_migration: %s", exc)


def _sprint_g_migration():
    """Cria tabelas de nutrição se não existirem."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        with engine.connect() as conn:
            if "planos_nutricao" not in tables:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS planos_nutricao (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                        aluno_id INTEGER NOT NULL REFERENCES alunos(id),
                        nome VARCHAR NOT NULL DEFAULT 'Plano Alimentar',
                        objetivo_kcal INTEGER,
                        objetivo_proteina INTEGER,
                        objetivo_carbo INTEGER,
                        objetivo_gordura INTEGER,
                        observacoes TEXT,
                        criado_em TIMESTAMP DEFAULT NOW()
                    )
                """))
            if "refeicoes" not in tables:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS refeicoes (
                        id SERIAL PRIMARY KEY,
                        plano_id INTEGER NOT NULL REFERENCES planos_nutricao(id) ON DELETE CASCADE,
                        nome VARCHAR NOT NULL,
                        horario VARCHAR,
                        alimentos TEXT
                    )
                """))
            conn.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("sprint_g_migration: %s", exc)


def _sprint_f_migration():
    """Cria tabela sessoes se não existir."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if "sessoes" not in tables:
            with engine.connect() as conn:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS sessoes (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                        personal_id INTEGER NOT NULL REFERENCES users(id),
                        aluno_id INTEGER NOT NULL REFERENCES alunos(id),
                        data_hora TIMESTAMP NOT NULL,
                        duracao_min INTEGER DEFAULT 60,
                        tipo VARCHAR DEFAULT 'presencial',
                        status VARCHAR DEFAULT 'agendada',
                        notas TEXT,
                        criado_em TIMESTAMP DEFAULT NOW()
                    )
                """))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_sessoes_aluno_data ON sessoes(tenant_id, data_hora)"))
                conn.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("sprint_f_migration: %s", exc)


def _sprint_d_migration():
    """Adiciona colunas de referral ao tenant se não existirem."""
    try:
        inspector = inspect(engine)
        cols = {c["name"] for c in inspector.get_columns("tenants")}
        stmts = []
        if "referral_code" not in cols:
            stmts.append("ALTER TABLE tenants ADD COLUMN referral_code VARCHAR UNIQUE")
        if "referred_by" not in cols:
            stmts.append("ALTER TABLE tenants ADD COLUMN referred_by VARCHAR")
        if stmts:
            with engine.connect() as conn:
                for s in stmts:
                    conn.execute(text(s))
                conn.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("sprint_d_migration: %s", exc)


def _sprint_c_migration():
    """Cria tabelas de periodização se não existirem."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        with engine.connect() as conn:
            if "programas_treino" not in tables:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS programas_treino (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                        personal_id INTEGER NOT NULL REFERENCES users(id),
                        nome VARCHAR NOT NULL,
                        objetivo VARCHAR,
                        semanas_total INTEGER DEFAULT 12,
                        fases TEXT,
                        descricao TEXT,
                        criado_em TIMESTAMP DEFAULT NOW()
                    )
                """))
            if "aplicacoes_programa" not in tables:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS aplicacoes_programa (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                        aluno_id INTEGER NOT NULL REFERENCES alunos(id),
                        programa_id INTEGER NOT NULL REFERENCES programas_treino(id),
                        iniciado_em TIMESTAMP NOT NULL,
                        ativo BOOLEAN DEFAULT TRUE
                    )
                """))
            conn.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("sprint_c_migration: %s", exc)


def _sprint_b_migration():
    """Cria tabela mensagens se não existir."""
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if "mensagens" not in tables:
            with engine.connect() as conn:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS mensagens (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                        aluno_id INTEGER NOT NULL REFERENCES alunos(id),
                        remetente_id INTEGER NOT NULL REFERENCES users(id),
                        texto TEXT NOT NULL,
                        lido BOOLEAN DEFAULT FALSE,
                        criado_em TIMESTAMP DEFAULT NOW()
                    )
                """))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_mensagens_aluno ON mensagens(aluno_id, criado_em)"))
                conn.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("sprint_b_migration: %s", exc)


def _billing_migration():
    """Adiciona colunas de billing ao tenant se não existirem (sem Alembic)."""
    try:
        inspector = inspect(engine)
        cols = {c["name"] for c in inspector.get_columns("tenants")}
        stmts = []
        if "plan_tier" not in cols:
            stmts.append("ALTER TABLE tenants ADD COLUMN plan_tier VARCHAR DEFAULT 'trial'")
        if "trial_ends_at" not in cols:
            stmts.append("ALTER TABLE tenants ADD COLUMN trial_ends_at TIMESTAMP")
        if "stripe_customer_id" not in cols:
            stmts.append("ALTER TABLE tenants ADD COLUMN stripe_customer_id VARCHAR")
        if "stripe_subscription_id" not in cols:
            stmts.append("ALTER TABLE tenants ADD COLUMN stripe_subscription_id VARCHAR")
        if stmts:
            with engine.connect() as conn:
                for s in stmts:
                    conn.execute(text(s))
                # Tenants sem trial_ends_at recebem 14 dias a partir de agora
                conn.execute(text(
                    "UPDATE tenants SET trial_ends_at = NOW() + INTERVAL '14 days' "
                    "WHERE trial_ends_at IS NULL"
                ))
                conn.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("billing_migration: %s", exc)


def _email_verificacao_migration():
    """Adiciona coluna email_verificado ao users se não existir."""
    try:
        inspector = inspect(engine)
        cols = {c["name"] for c in inspector.get_columns("users")}
        if "email_verificado" not in cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN email_verificado BOOLEAN DEFAULT TRUE"))
                conn.commit()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("email_verificacao_migration: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _billing_migration()
    _email_verificacao_migration()
    _sprint_b_migration()
    _sprint_c_migration()
    _sprint_d_migration()
    _sprint_f_migration()
    _sprint_g_migration()
    _sprint_j_migration()
    if settings.ENABLE_SCHEDULER:
        from apscheduler.schedulers.background import BackgroundScheduler
        from app.ai.scheduler import tarefa_progressao

        scheduler = BackgroundScheduler()
        scheduler.add_job(tarefa_progressao, "interval", hours=1, id="progressao")
        scheduler.start()
        yield
        scheduler.shutdown(wait=False)
    else:
        yield


app = FastAPI(title="FitSaaS API", version="0.1.0", lifespan=lifespan)

# ── Rate limiting ─────────────────────────────────────────────────────────────
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ─────────────────────────────────────────────────────────────────────
_ALLOWED_ORIGINS = [
    "https://fitsaas-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


# ── Security headers ──────────────────────────────────────────────────────────
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

from app.api.routes import auth, alunos, treinos, ia, convites, exercicios  # noqa: E402
from app.api.routes import pagamentos, academia, billing, chat, avaliacoes, periodizacao, referral, analytics, agenda, nutricao, notificacoes, public  # noqa: E402

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(convites.router, prefix="/convites", tags=["convites"])
app.include_router(alunos.router, prefix="/alunos", tags=["alunos"])
app.include_router(treinos.router, prefix="/treinos", tags=["treinos"])
app.include_router(exercicios.router, prefix="/exercicios", tags=["exercicios"])
app.include_router(ia.router, prefix="/ia", tags=["ia"])
app.include_router(pagamentos.router, prefix="/pagamentos", tags=["pagamentos"])
app.include_router(academia.router, prefix="/academia", tags=["academia"])
app.include_router(billing.router, prefix="/billing", tags=["billing"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(avaliacoes.router, prefix="/alunos", tags=["avaliacoes"])
app.include_router(periodizacao.router, prefix="/periodizacao", tags=["periodizacao"])
app.include_router(referral.router, prefix="/referral", tags=["referral"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(agenda.router, prefix="/agenda", tags=["agenda"])
app.include_router(nutricao.router, prefix="/nutricao", tags=["nutricao"])
app.include_router(notificacoes.router, prefix="/notificacoes", tags=["notificacoes"])
app.include_router(public.router, prefix="/public", tags=["public"])


@app.get("/health")
def health():
    try:
        from app.core.db import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail=f"Database unavailable: {e}")
