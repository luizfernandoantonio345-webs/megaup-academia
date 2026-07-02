from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TreinoCreate(BaseModel):
    aluno_id: int
    nome: str
    dia_semana: str = ""


class TreinoItemCreate(BaseModel):
    exercicio_id: int
    series: int = 3
    repeticoes: str = "12"
    carga: float | None = None
    descanso_seg: int = 60
    ordem: int = 0


class TreinoItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercicio_id: int
    series: int
    repeticoes: str
    carga: float | None = None
    descanso_seg: int
    ordem: int


class TreinoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    aluno_id: int
    nome: str
    dia_semana: str | None = None
    criado_em: datetime
    itens: list[TreinoItemResponse] = []
