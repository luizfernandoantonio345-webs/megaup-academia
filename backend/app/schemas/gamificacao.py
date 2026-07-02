from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ConquistaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    codigo: str
    descricao: str
    desbloqueado_em: datetime


class GamificacaoResponse(BaseModel):
    aluno_id: int
    streak_atual: int
    streak_recorde: int
    total_treinos: int
    conquistas: list[ConquistaResponse]
