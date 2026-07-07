"""Chat entre personal e aluno — polling simples, sem WebSocket."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Aluno, Mensagem, User

router = APIRouter()


def _fmt_utc(dt: datetime) -> str:
    """Retorna ISO 8601 com 'Z' explícito para o browser interpretar como UTC."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.strftime('%Y-%m-%dT%H:%M:%SZ')


def _resolver_aluno_id(current_user: User, aluno_id: int, db: Session) -> Aluno:
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

    if desde_id == 0:
        # Carga inicial: retorna as 100 mensagens mais recentes em ordem cronológica
        msgs = (
            db.query(Mensagem)
            .filter(
                Mensagem.aluno_id == aluno_id,
                Mensagem.tenant_id == current_user.tenant_id,
            )
            .order_by(Mensagem.criado_em.desc())
            .limit(100)
            .all()
        )
        msgs = list(reversed(msgs))
    else:
        # Polling incremental: apenas mensagens novas após o último id visto
        msgs = (
            db.query(Mensagem)
            .filter(
                Mensagem.aluno_id == aluno_id,
                Mensagem.tenant_id == current_user.tenant_id,
                Mensagem.id > desde_id,
            )
            .order_by(Mensagem.criado_em.asc())
            .limit(50)
            .all()
        )

    # Só commita se houver mensagens não lidas para marcar
    nao_lidas = [m for m in msgs if m.remetente_id != current_user.id and not m.lido]
    if nao_lidas:
        for m in nao_lidas:
            m.lido = True
        db.commit()

    return [
        {
            "id": m.id,
            "texto": m.texto,
            "remetente_id": m.remetente_id,
            "meu": m.remetente_id == current_user.id,
            "lido": m.lido,
            "criado_em": _fmt_utc(m.criado_em),
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
        "criado_em": _fmt_utc(msg.criado_em),
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
