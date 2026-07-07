from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Exercicio, User
from app.schemas.exercicios import ExercicioCreate, ExercicioResponse
from app.data.exercicios_library import BIBLIOTECA_GLOBAL

router = APIRouter()


class ExercicioUpdate(BaseModel):
    nome: Optional[str] = None
    grupo_muscular: Optional[str] = None
    equipamento: Optional[str] = None
    video_url: Optional[str] = None


@router.get("/", response_model=list[ExercicioResponse])
def listar_exercicios(
    skip: int = 0,
    limit: int = 200,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna exercícios globais (tenant_id=NULL) + customizados do tenant."""
    limit = min(limit, 500)
    return (
        db.query(Exercicio)
        .filter(
            or_(Exercicio.tenant_id == None, Exercicio.tenant_id == current_user.tenant_id)
        )
        .order_by(Exercicio.nome)
        .offset(skip)
        .limit(limit)
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


@router.post("/seed-global", status_code=200)
def seed_biblioteca_global(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Importa biblioteca global de 100+ exercícios (idempotente — skip duplicatas)."""
    existentes = {e.nome for e in db.query(Exercicio).filter(Exercicio.tenant_id == None).all()}
    criados = 0
    for item in BIBLIOTECA_GLOBAL:
        if item["nome"] not in existentes:
            db.add(Exercicio(
                tenant_id=None,
                nome=item["nome"],
                grupo_muscular=item.get("grupo_muscular"),
                equipamento=item.get("equipamento"),
                video_url=item.get("video_url"),
            ))
            criados += 1
    db.commit()
    return {"criados": criados, "total_biblioteca": len(BIBLIOTECA_GLOBAL)}


@router.put("/{exercicio_id}", response_model=ExercicioResponse)
def atualizar_exercicio(
    exercicio_id: int,
    body: ExercicioUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Atualiza exercício customizado do tenant. Exercícios globais (tenant_id=NULL) são somente-leitura."""
    ex = db.query(Exercicio).filter(
        Exercicio.id == exercicio_id,
        Exercicio.tenant_id == current_user.tenant_id,
    ).first()
    if not ex:
        raise HTTPException(404, "Exercício não encontrado ou não editável")
    if body.nome is not None:
        ex.nome = body.nome
    if body.grupo_muscular is not None:
        ex.grupo_muscular = body.grupo_muscular or None
    if body.equipamento is not None:
        ex.equipamento = body.equipamento or None
    if body.video_url is not None:
        ex.video_url = body.video_url or None
    db.commit()
    db.refresh(ex)
    return ex


@router.delete("/{exercicio_id}", status_code=204)
def deletar_exercicio(
    exercicio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove exercício customizado do tenant."""
    ex = db.query(Exercicio).filter(
        Exercicio.id == exercicio_id,
        Exercicio.tenant_id == current_user.tenant_id,
    ).first()
    if not ex:
        raise HTTPException(404, "Exercício não encontrado")
    db.delete(ex)
    db.commit()
