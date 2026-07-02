from pydantic import BaseModel
from datetime import datetime


class ConviteRequest(BaseModel):
    email_aluno: str


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
