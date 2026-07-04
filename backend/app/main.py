from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.config import settings
from app.core.db import engine


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
from app.api.routes import pagamentos, academia, billing  # noqa: E402

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(convites.router, prefix="/convites", tags=["convites"])
app.include_router(alunos.router, prefix="/alunos", tags=["alunos"])
app.include_router(treinos.router, prefix="/treinos", tags=["treinos"])
app.include_router(exercicios.router, prefix="/exercicios", tags=["exercicios"])
app.include_router(ia.router, prefix="/ia", tags=["ia"])
app.include_router(pagamentos.router, prefix="/pagamentos", tags=["pagamentos"])
app.include_router(academia.router, prefix="/academia", tags=["academia"])
app.include_router(billing.router, prefix="/billing", tags=["billing"])


@app.get("/health")
def health():
    return {"status": "ok"}
