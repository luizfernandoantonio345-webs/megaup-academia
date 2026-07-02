from pydantic import BaseModel, ConfigDict


class ExercicioCreate(BaseModel):
    nome: str
    grupo_muscular: str = ""
    equipamento: str = ""
    video_url: str = ""


class ExercicioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int | None = None
    nome: str
    grupo_muscular: str | None = None
    equipamento: str | None = None
    video_url: str | None = None
