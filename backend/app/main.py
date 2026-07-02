from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
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
from app.api.routes import pagamentos, academia  # noqa: E402

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(convites.router, prefix="/convites", tags=["convites"])
app.include_router(alunos.router, prefix="/alunos", tags=["alunos"])
app.include_router(treinos.router, prefix="/treinos", tags=["treinos"])
app.include_router(exercicios.router, prefix="/exercicios", tags=["exercicios"])
app.include_router(ia.router, prefix="/ia", tags=["ia"])
app.include_router(pagamentos.router, prefix="/pagamentos", tags=["pagamentos"])
app.include_router(academia.router, prefix="/academia", tags=["academia"])


@app.get("/health")
def health():
    return {"status": "ok"}
