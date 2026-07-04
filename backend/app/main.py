from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.config import settings
from app.core.db import engine


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


@asynccontextmanager
async def lifespan(app: FastAPI):
    _billing_migration()
    _sprint_b_migration()
    _sprint_c_migration()
    _sprint_d_migration()
    _sprint_f_migration()
    _sprint_g_migration()
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restringir em produção
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routes import auth, alunos, treinos, ia, convites, exercicios  # noqa: E402
from app.api.routes import pagamentos, academia, billing, chat, avaliacoes, periodizacao, referral, analytics, agenda, nutricao, notificacoes  # noqa: E402

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


@app.get("/health")
def health():
    return {"status": "ok"}
