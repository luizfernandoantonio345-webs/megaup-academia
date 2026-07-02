from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AlunoCreate(BaseModel):
    nome: str
    email: str
    objetivo: str = ""


class AlunoUpdate(BaseModel):
    nome: str | None = None
    email: str | None = None
    objetivo: str | None = None


class AnamneseData(BaseModel):
    objetivo: str = ""
    historico_medico: str = ""
    restricoes: list[str] = []
    medicamentos: list[str] = []
    nivel_atividade: str = ""  # sedentario / ativo / muito_ativo
    lesoes: list[str] = []
    observacoes: str = ""


class AlunoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    personal_id: int
    nome: str
    email: str
    objetivo: str | None = None
    criado_em: datetime
