"""
Sprint F — Agenda & Sessões
Prefix: /agenda
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.api.deps import get_current_user
from app.models import Sessao, User, Aluno

router = APIRouter()


class SessaoCreate(BaseModel):
    aluno_id: int
    data_hora: datetime
    duracao_min: int = 60
    tipo: str = "presencial"
    notas: Optional[str] = None


class SessaoUpdate(BaseModel):
    status: Optional[str] = None
    data_hora: Optional[datetime] = None
    duracao_min: Optional[int] = None
    notas: Optional[str] = None


def _sessao_dict(s: Sessao, aluno_nome: str = "—"):
    return {
        "id": s.id,
        "aluno_id": s.aluno_id,
        "aluno_nome": aluno_nome,
        "data_hora": s.data_hora.isoformat(),
        "duracao_min": s.duracao_min,
        "tipo": s.tipo,
        "status": s.status,
        "notas": s.notas,
        "criado_em": s.criado_em.isoformat(),
    }


@router.get("/")
def listar_sessoes(
    mes: Optional[int] = None,
    ano: Optional[int] = None,
    aluno_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Sessao).filter(Sessao.tenant_id == current_user.tenant_id)
    if aluno_id:
        q = q.filter(Sessao.aluno_id == aluno_id)
    if mes and ano:
        from sqlalchemy import extract
        q = q.filter(
            extract("month", Sessao.data_hora) == mes,
            extract("year", Sessao.data_hora) == ano,
        )
    sessoes = q.order_by(Sessao.data_hora).all()

    # Carrega todos os alunos referenciados em 1 query (evita N+1)
    aluno_ids = {s.aluno_id for s in sessoes}
    alunos_map = {}
    if aluno_ids:
        rows = db.query(Aluno.id, Aluno.nome).filter(Aluno.id.in_(aluno_ids)).all()
        alunos_map = {r.id: r.nome for r in rows}

    return [_sessao_dict(s, alunos_map.get(s.aluno_id, "—")) for s in sessoes]


@router.post("/", status_code=201)
def criar_sessao(
    body: SessaoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    aluno = db.query(Aluno).filter(
        Aluno.id == body.aluno_id,
        Aluno.tenant_id == current_user.tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")
    s = Sessao(
        tenant_id=current_user.tenant_id,
        personal_id=current_user.id,
        aluno_id=body.aluno_id,
        data_hora=body.data_hora,
        duracao_min=body.duracao_min,
        tipo=body.tipo,
        notas=body.notas,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _sessao_dict(s, aluno.nome)


@router.patch("/{sessao_id}")
def atualizar_sessao(
    sessao_id: int,
    body: SessaoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = db.query(Sessao).filter(
        Sessao.id == sessao_id,
        Sessao.tenant_id == current_user.tenant_id,
    ).first()
    if not s:
        raise HTTPException(404, "Sessão não encontrada")
    if body.status is not None:
        s.status = body.status
    if body.data_hora is not None:
        s.data_hora = body.data_hora
    if body.duracao_min is not None:
        s.duracao_min = body.duracao_min
    if body.notas is not None:
        s.notas = body.notas
    db.commit()
    db.refresh(s)
    aluno = db.query(Aluno).filter(Aluno.id == s.aluno_id).first()
    return _sessao_dict(s, aluno.nome if aluno else "—")


@router.delete("/{sessao_id}", status_code=204)
def cancelar_sessao(
    sessao_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = db.query(Sessao).filter(
        Sessao.id == sessao_id,
        Sessao.tenant_id == current_user.tenant_id,
    ).first()
    if not s:
        raise HTTPException(404, "Sessão não encontrada")
    db.delete(s)
    db.commit()
