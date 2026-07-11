from pydantic import BaseModel, EmailStr, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

    @field_validator("email", mode="before")
    @classmethod
    def normalizar_email(cls, v: str) -> str:
        return v.strip().lower()


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


class UpdateProfileRequest(BaseModel):
    nome: str | None = None
    bio: str | None = None
    cref: str | None = None
    especialidades: str | None = None
    foto_url: str | None = None

    @field_validator("foto_url")
    @classmethod
    def validar_foto_url(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not (v.startswith("https://") or v.startswith("/")):
            raise ValueError("foto_url deve usar HTTPS ou ser um caminho relativo")
        if len(v) > 512:
            raise ValueError("URL muito longa (máx. 512 caracteres)")
        return v

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Nome muito curto")
        if len(v) > 120:
            raise ValueError("Nome muito longo")
        return v

    @field_validator("bio")
    @classmethod
    def validar_bio(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 1000:
            raise ValueError("Bio muito longa (máx. 1000 caracteres)")
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
