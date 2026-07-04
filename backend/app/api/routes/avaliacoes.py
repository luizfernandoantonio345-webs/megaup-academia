"""Avaliações físicas do aluno — peso, % gordura, medidas."""
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Aluno, Avaliacao, User

router = APIRouter()


def _get_aluno(aluno_id: int, tenant_id: int, db: Session) -> Aluno:
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id, Aluno.tenant_id == tenant_id).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")
    return aluno


class AvaliacaoCreate(BaseModel):
    peso: Optional[float] = None
    percentual_gordura: Optional[float] = None
    medidas: Optional[dict] = None  # {cintura, quadril, braco, perna, peito, ...}
    data: Optional[str] = None      # ISO date string; defaults to now


class AvaliacaoResponse(BaseModel):
    id: int
    aluno_id: int
    data: str
    peso: Optional[float]
    percentual_gordura: Optional[float]
    medidas: Optional[dict]

    class Config:
        from_attributes = True


def _serialize(av: Avaliacao) -> dict:
    return {
        "id": av.id,
        "aluno_id": av.aluno_id,
        "data": av.data.isoformat() if av.data else None,
        "peso": av.peso,
        "percentual_gordura": av.percentual_gordura,
        "medidas": json.loads(av.medidas) if av.medidas else None,
    }


@router.get("/{aluno_id}/avaliacoes")
def listar_avaliacoes(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_aluno(aluno_id, current_user.tenant_id, db)
    avs = (
        db.query(Avaliacao)
        .filter(Avaliacao.aluno_id == aluno_id, Avaliacao.tenant_id == current_user.tenant_id)
        .order_by(Avaliacao.data.asc())
        .all()
    )
    return [_serialize(a) for a in avs]


@router.post("/{aluno_id}/avaliacoes", status_code=201)
def criar_avaliacao(
    aluno_id: int,
    body: AvaliacaoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_aluno(aluno_id, current_user.tenant_id, db)

    data_av = datetime.utcnow()
    if body.data:
        try:
            data_av = datetime.fromisoformat(body.data)
        except ValueError:
            pass

    av = Avaliacao(
        tenant_id=current_user.tenant_id,
        aluno_id=aluno_id,
        data=data_av,
        peso=body.peso,
        percentual_gordura=body.percentual_gordura,
        medidas=json.dumps(body.medidas) if body.medidas else None,
    )
    db.add(av)
    db.commit()
    db.refresh(av)
    return _serialize(av)


@router.delete("/{aluno_id}/avaliacoes/{av_id}", status_code=204)
def deletar_avaliacao(
    aluno_id: int,
    av_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_aluno(aluno_id, current_user.tenant_id, db)
    av = db.query(Avaliacao).filter(
        Avaliacao.id == av_id,
        Avaliacao.aluno_id == aluno_id,
        Avaliacao.tenant_id == current_user.tenant_id,
    ).first()
    if not av:
        raise HTTPException(404, "Avaliação não encontrada")
    db.delete(av)
    db.commit()
