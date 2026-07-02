from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator


class PlanoAlunoCreate(BaseModel):
    aluno_id: int
    nome: str
    valor: float
    dia_vencimento: int = 10

    @field_validator("valor")
    @classmethod
    def valor_positivo(cls, v):
        if v <= 0:
            raise ValueError("valor deve ser positivo")
        return v

    @field_validator("dia_vencimento")
    @classmethod
    def dia_valido(cls, v):
        if not 1 <= v <= 28:
            raise ValueError("dia_vencimento deve ser entre 1 e 28")
        return v


class PlanoAlunoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    aluno_id: int
    nome: str
    valor: float
    dia_vencimento: int
    status: str
    criado_em: datetime


class CobrancaCreate(BaseModel):
    plano_id: int
    vencimento: datetime


class CobrancaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    plano_id: int
    aluno_id: int
    valor: float
    vencimento: datetime
    pago_em: datetime | None = None
    status: str
    asaas_id: str | None = None
    link_pagamento: str | None = None


class MarcarPagoRequest(BaseModel):
    pago_em: datetime | None = None  # None = agora


class ResumoFinanceiroResponse(BaseModel):
    total_alunos_com_plano: int
    receita_mensal_prevista: float
    inadimplentes: int
    valor_inadimplente: float
    proximas_cobrancas: list[CobrancaResponse]


class PersonalInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    email: str
    ativo: bool


class AdicionarPersonalRequest(BaseModel):
    email: str  # pesquisa personal por e-mail para adicionar à academia
