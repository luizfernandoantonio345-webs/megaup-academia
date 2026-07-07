import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.config import settings
from app.core.db import engine

logger = logging.getLogger(__name__)


def _run_migrations() -> None:
    """Todas as migrações em UMA única conexão/inspect — startup rápido."""
    try:
        inspector = inspect(engine)
        tables    = set(inspector.get_table_names())
        user_cols   = {c["name"] for c in inspector.get_columns("users")}
        tenant_cols = {c["name"] for c in inspector.get_columns("tenants")}

        stmts: list[str] = []

        # ── users ──────────────────────────────────────────────────────────────
        if "bio"              not in user_cols: stmts.append("ALTER TABLE users ADD COLUMN bio TEXT")
        if "especialidades"   not in user_cols: stmts.append("ALTER TABLE users ADD COLUMN especialidades VARCHAR")
        if "foto_url"         not in user_cols: stmts.append("ALTER TABLE users ADD COLUMN foto_url VARCHAR")
        if "email_verificado"  not in user_cols: stmts.append("ALTER TABLE users ADD COLUMN email_verificado BOOLEAN DEFAULT TRUE")
        if "cref"              not in user_cols: stmts.append("ALTER TABLE users ADD COLUMN cref VARCHAR")
        if "termos_aceitos"    not in user_cols: stmts.append("ALTER TABLE users ADD COLUMN termos_aceitos BOOLEAN DEFAULT FALSE")
        if "termos_aceitos_em" not in user_cols: stmts.append("ALTER TABLE users ADD COLUMN termos_aceitos_em TIMESTAMP")

        # ── tenants ────────────────────────────────────────────────────────────
        if "plan_tier"              not in tenant_cols: stmts.append("ALTER TABLE tenants ADD COLUMN plan_tier VARCHAR DEFAULT 'trial'")
        if "trial_ends_at"          not in tenant_cols: stmts.append("ALTER TABLE tenants ADD COLUMN trial_ends_at TIMESTAMP")
        if "stripe_customer_id"     not in tenant_cols: stmts.append("ALTER TABLE tenants ADD COLUMN stripe_customer_id VARCHAR")
        if "stripe_subscription_id" not in tenant_cols: stmts.append("ALTER TABLE tenants ADD COLUMN stripe_subscription_id VARCHAR")
        if "referral_code"          not in tenant_cols: stmts.append("ALTER TABLE tenants ADD COLUMN referral_code VARCHAR UNIQUE")
        if "referred_by"            not in tenant_cols: stmts.append("ALTER TABLE tenants ADD COLUMN referred_by VARCHAR")

        # ── tables ─────────────────────────────────────────────────────────────
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

        if "mensagens" not in tables:
            stmts.append("""
                CREATE TABLE IF NOT EXISTS mensagens (
                    id SERIAL PRIMARY KEY,
                    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                    aluno_id INTEGER NOT NULL REFERENCES alunos(id),
                    remetente_id INTEGER NOT NULL REFERENCES users(id),
                    texto TEXT NOT NULL,
                    lido BOOLEAN DEFAULT FALSE,
                    criado_em TIMESTAMP DEFAULT NOW()
                )
            """)
            stmts.append("CREATE INDEX IF NOT EXISTS ix_mensagens_aluno ON mensagens(aluno_id, criado_em)")

        if "programas_treino" not in tables:
            stmts.append("""
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
            """)

        if "aplicacoes_programa" not in tables:
            stmts.append("""
                CREATE TABLE IF NOT EXISTS aplicacoes_programa (
                    id SERIAL PRIMARY KEY,
                    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                    aluno_id INTEGER NOT NULL REFERENCES alunos(id),
                    programa_id INTEGER NOT NULL REFERENCES programas_treino(id),
                    iniciado_em TIMESTAMP NOT NULL,
                    ativo BOOLEAN DEFAULT TRUE
                )
            """)

        if "sessoes" not in tables:
            stmts.append("""
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
            """)
            stmts.append("CREATE INDEX IF NOT EXISTS ix_sessoes_aluno_data ON sessoes(tenant_id, data_hora)")

        if "planos_nutricao" not in tables:
            stmts.append("""
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
            """)

        if "refeicoes" not in tables:
            stmts.append("""
                CREATE TABLE IF NOT EXISTS refeicoes (
                    id SERIAL PRIMARY KEY,
                    plano_id INTEGER NOT NULL REFERENCES planos_nutricao(id) ON DELETE CASCADE,
                    nome VARCHAR NOT NULL,
                    horario VARCHAR,
                    alimentos TEXT
                )
            """)

        if "fotos_evolucao" not in tables:
            stmts.append("""
                CREATE TABLE IF NOT EXISTS fotos_evolucao (
                    id SERIAL PRIMARY KEY,
                    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                    aluno_id INTEGER NOT NULL REFERENCES alunos(id),
                    data TIMESTAMP DEFAULT NOW(),
                    tipo VARCHAR DEFAULT 'frente',
                    foto_base64 TEXT NOT NULL,
                    peso REAL,
                    observacao TEXT
                )
            """)
            stmts.append("CREATE INDEX IF NOT EXISTS ix_fotos_aluno_data ON fotos_evolucao(aluno_id, data DESC)")

        if "push_subscriptions" not in tables:
            stmts.append("""
                CREATE TABLE IF NOT EXISTS push_subscriptions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
                    endpoint TEXT NOT NULL,
                    p256dh TEXT NOT NULL,
                    auth TEXT NOT NULL,
                    criado_em TIMESTAMP DEFAULT NOW(),
                    UNIQUE(user_id, endpoint)
                )
            """)

        # ── indexes (always included — CREATE INDEX IF NOT EXISTS is idempotent) ──
        idx_stmts = [
            # users
            "CREATE INDEX IF NOT EXISTS ix_users_tenant_id        ON users(tenant_id)",
            "CREATE INDEX IF NOT EXISTS ix_users_email_ativo       ON users(email, ativo)",
            # alunos
            "CREATE INDEX IF NOT EXISTS ix_alunos_tenant_id        ON alunos(tenant_id)",
            "CREATE INDEX IF NOT EXISTS ix_alunos_personal_id      ON alunos(personal_id)",
            "CREATE INDEX IF NOT EXISTS ix_alunos_user_id          ON alunos(user_id)",
            # treinos
            "CREATE INDEX IF NOT EXISTS ix_treinos_aluno_id        ON treinos(aluno_id)",
            "CREATE INDEX IF NOT EXISTS ix_treinos_aluno_dia       ON treinos(aluno_id, dia_semana)",
            "CREATE INDEX IF NOT EXISTS ix_treinos_tenant_id       ON treinos(tenant_id)",
            # treino_itens
            "CREATE INDEX IF NOT EXISTS ix_treino_itens_treino_id   ON treino_itens(treino_id)",
            "CREATE INDEX IF NOT EXISTS ix_treino_itens_exercicio_id ON treino_itens(exercicio_id)",
            # execucoes (tabela mais crítica — é a hot path de leitura)
            "CREATE INDEX IF NOT EXISTS ix_execucoes_aluno_id      ON execucoes(aluno_id)",
            "CREATE INDEX IF NOT EXISTS ix_execucoes_aluno_data    ON execucoes(aluno_id, data DESC)",
            "CREATE INDEX IF NOT EXISTS ix_execucoes_tenant_data   ON execucoes(tenant_id, data DESC)",
            # execucao_itens
            "CREATE INDEX IF NOT EXISTS ix_execucao_itens_execucao_id  ON execucao_itens(execucao_id)",
            "CREATE INDEX IF NOT EXISTS ix_execucao_itens_exercicio_id ON execucao_itens(exercicio_id)",
            # sugestoes_progressao
            "CREATE INDEX IF NOT EXISTS ix_sugestoes_aluno_visto   ON sugestoes_progressao(aluno_id, visto)",
            "CREATE INDEX IF NOT EXISTS ix_sugestoes_tenant_id     ON sugestoes_progressao(tenant_id)",
            # conquistas
            "CREATE INDEX IF NOT EXISTS ix_conquistas_aluno_id     ON conquistas(aluno_id)",
            # cobrancas
            "CREATE INDEX IF NOT EXISTS ix_cobrancas_tenant_status ON cobrancas(tenant_id, status)",
            "CREATE INDEX IF NOT EXISTS ix_cobrancas_aluno_id      ON cobrancas(aluno_id)",
            "CREATE INDEX IF NOT EXISTS ix_cobrancas_vencimento    ON cobrancas(tenant_id, vencimento)",
        ]

        if not stmts and not idx_stmts:
            logger.info("migrations: schema up-to-date, nothing to run")
            return

        with engine.connect() as conn:
            for stmt in stmts:
                conn.execute(text(stmt))
            # Tenants without trial_ends_at get 14 days from now
            conn.execute(text(
                "UPDATE tenants SET trial_ends_at = NOW() + INTERVAL '14 days' "
                "WHERE trial_ends_at IS NULL"
            ))
            # Indexes — always attempt (IF NOT EXISTS makes them idempotent)
            for idx in idx_stmts:
                conn.execute(text(idx))
            conn.commit()

        logger.info("migrations: ran %d DDL statement(s) + %d index(es)", len(stmts), len(idx_stmts))

    except Exception as exc:
        logger.warning("migrations failed (non-fatal): %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _run_migrations()
    if settings.ENABLE_SCHEDULER:
        from apscheduler.schedulers.background import BackgroundScheduler
        from app.ai.scheduler import tarefa_progressao, tarefa_lembretes_pagamento

        scheduler = BackgroundScheduler()
        scheduler.add_job(tarefa_progressao, "interval", hours=1, id="progressao")
        scheduler.add_job(tarefa_lembretes_pagamento, "interval", hours=24, id="lembretes_pagamento")
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
    # Rotas cujos dados mudam raramente — pode ser revalidado em background
    _CACHEABLE = {"/exercicios/", "/ping", "/health"}

    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
        # Cache-Control: authenticated GET respostas ficam private, revalidam após 5 min
        if request.method == "GET" and response.status_code == 200:
            path = request.url.path
            if any(path.startswith(c) for c in self._CACHEABLE):
                response.headers["Cache-Control"] = "private, max-age=300, stale-while-revalidate=60"
            else:
                response.headers.setdefault("Cache-Control", "private, no-store")
        return response

app.add_middleware(SecurityHeadersMiddleware)

from fastapi.middleware.gzip import GZipMiddleware  # noqa: E402
app.add_middleware(GZipMiddleware, minimum_size=500)

from app.api.routes import auth, alunos, treinos, ia, convites, exercicios  # noqa: E402
from app.api.routes import pagamentos, academia, billing, chat, avaliacoes, periodizacao, referral, analytics, agenda, nutricao, notificacoes, public  # noqa: E402
from app.api.routes import fotos, push  # noqa: E402

app.include_router(auth.router,         prefix="/auth",         tags=["auth"])
app.include_router(convites.router,     prefix="/convites",     tags=["convites"])
app.include_router(alunos.router,       prefix="/alunos",       tags=["alunos"])
app.include_router(treinos.router,      prefix="/treinos",      tags=["treinos"])
app.include_router(exercicios.router,   prefix="/exercicios",   tags=["exercicios"])
app.include_router(ia.router,           prefix="/ia",           tags=["ia"])
app.include_router(pagamentos.router,   prefix="/pagamentos",   tags=["pagamentos"])
app.include_router(academia.router,     prefix="/academia",     tags=["academia"])
app.include_router(billing.router,      prefix="/billing",      tags=["billing"])
app.include_router(chat.router,         prefix="/chat",         tags=["chat"])
app.include_router(avaliacoes.router,   prefix="/alunos",       tags=["avaliacoes"])
app.include_router(periodizacao.router, prefix="/periodizacao", tags=["periodizacao"])
app.include_router(referral.router,     prefix="/referral",     tags=["referral"])
app.include_router(analytics.router,   prefix="/analytics",    tags=["analytics"])
app.include_router(agenda.router,       prefix="/agenda",       tags=["agenda"])
app.include_router(nutricao.router,     prefix="/nutricao",     tags=["nutricao"])
app.include_router(notificacoes.router, prefix="/notificacoes", tags=["notificacoes"])
app.include_router(public.router,       prefix="/public",       tags=["public"])
app.include_router(fotos.router,        prefix="/alunos",       tags=["fotos"])
app.include_router(push.router,         prefix="/push",         tags=["push"])


@app.get("/ping", include_in_schema=False)
def ping():
    """Lightweight wake-up endpoint — no DB call, instant response."""
    return {"ok": True}


@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail=f"Database unavailable: {e}")
