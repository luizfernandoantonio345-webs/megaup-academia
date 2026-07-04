from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    senha: str


class RegisterPersonalRequest(BaseModel):
    nome: str
    email: str
    senha: str
    nome_academia: str
    ref_code: str | None = None


class UserInfo(BaseModel):
    id: int
    nome: str
    email: str
    role: str
    tenant_id: int
    aluno_id: int | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
