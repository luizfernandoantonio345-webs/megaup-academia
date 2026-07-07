from pydantic import BaseModel, EmailStr, field_validator


class LoginRequest(BaseModel):
    email: str
    senha: str


class RegisterPersonalRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    nome_academia: str
    ref_code: str | None = None
    termos_aceitos: bool = False

    @field_validator("termos_aceitos")
    @classmethod
    def deve_aceitar_termos(cls, v: bool) -> bool:
        if not v:
            raise ValueError("É obrigatório aceitar os Termos de Uso e a Política de Privacidade")
        return v

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
        return v


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
