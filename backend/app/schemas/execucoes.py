from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ExecucaoItemInput(BaseModel):
    exercicio_id: int
    treino_item_id: int | None = None
    carga_realizada: float | None = None
    repeticoes_realizadas: str | None = None
    series_realizadas: int | None = None


class ExecucaoCreate(BaseModel):
    dificuldade: str  # facil / ok / dificil
    comentario: str = ""
    itens: list[ExecucaoItemInput] = []


class ExecucaoItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercicio_id: int
    treino_item_id: int | None = None
    carga_realizada: float | None = None
    repeticoes_realizadas: str | None = None
    series_realizadas: int | None = None


class ExecucaoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    treino_id: int
    aluno_id: int
    data: datetime
    dificuldade: str | None = None
    comentario: str | None = None
    itens: list[ExecucaoItemResponse] = []


class HistoricoCargaEntry(BaseModel):
    data: datetime
    carga_realizada: float | None = None
    repeticoes_realizadas: str | None = None
    dificuldade: str | None = None


class HistoricoCargaResponse(BaseModel):
    exercicio_id: int
    aluno_id: int
    historico: list[HistoricoCargaEntry]
