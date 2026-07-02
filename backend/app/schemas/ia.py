from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TreinoAlternativoRequest(BaseModel):
    treino_original: dict
    equipamento_indisponivel: str


class ItemAlternativo(BaseModel):
    exercicio_original: str
    exercicio_alternativo: str
    motivo: str


class TreinoAlternativoResponse(BaseModel):
    itens: list[ItemAlternativo]
    observacoes: str = ""


class SugestaoProgressaoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercicio_id: int
    acao: str
    carga_sugerida: float | None = None
    motivo: str | None = None
    gerado_em: datetime


class StatusAlunoSugestoesResponse(BaseModel):
    aluno_id: int
    dias_sem_treinar: int | None = None
    sugestoes_pendentes: list[SugestaoProgressaoResponse]
