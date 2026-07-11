from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator


class TreinoAlternativoRequest(BaseModel):
    treino_original: dict
    equipamento_indisponivel: str


class GerarTreinoRequest(BaseModel):
    objetivo: str = "hipertrofia"
    nivel: str = "intermediario"
    dias_por_semana: int = 3
    equipamentos: list[str] = []
    restricoes: str = ""

    @field_validator("dias_por_semana")
    @classmethod
    def validar_dias(cls, v: int) -> int:
        if not 2 <= v <= 6:
            raise ValueError("dias_por_semana deve ser entre 2 e 6")
        return v


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
