from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Exercicio, User
from app.schemas.exercicios import ExercicioCreate, ExercicioResponse

router = APIRouter()


@router.get("/", response_model=list[ExercicioResponse])
def listar_exercicios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna exercícios globais (tenant_id=NULL) + customizados do tenant."""
    return (
        db.query(Exercicio)
        .filter(
            or_(Exercicio.tenant_id == None, Exercicio.tenant_id == current_user.tenant_id)
        )
        .order_by(Exercicio.nome)
        .all()
    )


@router.post("/", response_model=ExercicioResponse, status_code=201)
def criar_exercicio(
    body: ExercicioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cria exercício customizado para o tenant do personal."""
    ex = Exercicio(
        tenant_id=current_user.tenant_id,
        nome=body.nome,
        grupo_muscular=body.grupo_muscular or None,
        equipamento=body.equipamento or None,
        video_url=body.video_url or None,
    )
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex
