from fastapi import APIRouter, Depends

from app.ai.prescricao import gerar_treino_alternativo, sugerir_ajuste_carga
from app.core.deps import get_current_user
from app.models import User
from app.schemas.ia import TreinoAlternativoRequest, TreinoAlternativoResponse

router = APIRouter()


@router.post("/sugerir-carga")
def rota_sugerir_carga(
    historico: list[dict],
    current_user: User = Depends(get_current_user),
):
    """
    Recebe histórico de execuções de um exercício e retorna sugestão de carga da IA.
    Body: [{"data": "2025-01-01", "carga": 20, "dificuldade": "facil"}, ...]
    """
    return sugerir_ajuste_carga(historico)


@router.post("/treino-alternativo", response_model=TreinoAlternativoResponse)
def rota_treino_alternativo(
    body: TreinoAlternativoRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Gera substituições de exercícios quando um equipamento está indisponível.
    """
    return gerar_treino_alternativo(body.treino_original, body.equipamento_indisponivel)
