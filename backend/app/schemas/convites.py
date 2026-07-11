from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


class ConviteRequest(BaseModel):
    email_aluno: EmailStr


class ConviteResponse(BaseModel):
    token: str
    link_convite: str
    expira_em: datetime


class ConviteInfoResponse(BaseModel):
    email_aluno: str
    nome_personal: str
    nome_academia: str
    expira_em: datetime


class AceitarConviteRequest(BaseModel):
    token: str
    nome: str
    senha: str

    @field_validator("senha")
    @classmethod
    def senha_forte(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("A senha deve ter pelo menos 8 caracteres")
        if v.isdigit():
            raise ValueError("A senha não pode ser somente números")
        return v

    @field_validator("nome")
    @classmethod
    def nome_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Nome muito curto")
        if len(v) > 120:
            raise ValueError("Nome muito longo")
        return v
