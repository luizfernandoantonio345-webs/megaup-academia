"""Chat entre personal e aluno — polling simples, sem WebSocket."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Aluno, Mensagem, User

router = APIRouter()


def _resolver_aluno_id(current_user: User, aluno_id: int, db: Session) -> Aluno:
    """Personal acessa por aluno_id; aluno acessa pelo próprio perfil."""
    aluno = db.query(Aluno).filter(
        Aluno.id == aluno_id,
        Aluno.tenant_id == current_user.tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")
    return aluno


@router.get("/{aluno_id}")
def listar_mensagens(
    aluno_id: int,
    desde_id: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _resolver_aluno_id(current_user, aluno_id, db)

    msgs = (
        db.query(Mensagem)
        .filter(
            Mensagem.aluno_id == aluno_id,
            Mensagem.tenant_id == current_user.tenant_id,
            Mensagem.id > desde_id,
        )
        .order_by(Mensagem.criado_em.asc())
        .limit(100)
        .all()
    )

    # Marcar como lido as mensagens que não são do remetente atual
    for m in msgs:
        if m.remetente_id != current_user.id and not m.lido:
            m.lido = True
    db.commit()

    return [
        {
            "id": m.id,
            "texto": m.texto,
            "remetente_id": m.remetente_id,
            "meu": m.remetente_id == current_user.id,
            "lido": m.lido,
            "criado_em": m.criado_em.isoformat(),
        }
        for m in msgs
    ]


class EnviarBody(BaseModel):
    texto: str


@router.post("/{aluno_id}", status_code=201)
def enviar_mensagem(
    aluno_id: int,
    body: EnviarBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _resolver_aluno_id(current_user, aluno_id, db)
    texto = body.texto.strip()
    if not texto:
        raise HTTPException(400, "Mensagem vazia")
    if len(texto) > 2000:
        raise HTTPException(400, "Mensagem muito longa")

    msg = Mensagem(
        tenant_id=current_user.tenant_id,
        aluno_id=aluno_id,
        remetente_id=current_user.id,
        texto=texto,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "texto": msg.texto,
        "remetente_id": msg.remetente_id,
        "meu": True,
        "lido": False,
        "criado_em": msg.criado_em.isoformat(),
    }


@router.get("/{aluno_id}/nao-lidas")
def nao_lidas(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _resolver_aluno_id(current_user, aluno_id, db)
    count = (
        db.query(Mensagem)
        .filter(
            Mensagem.aluno_id == aluno_id,
            Mensagem.tenant_id == current_user.tenant_id,
            Mensagem.remetente_id != current_user.id,
            Mensagem.lido == False,
        )
        .count()
    )
    return {"nao_lidas": count}
