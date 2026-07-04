"""Periodização — programas de treino estruturados com fases."""
import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import AplicacaoPrograma, Aluno, ProgramaTreino, User

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────────

class FaseSchema(BaseModel):
    nome: str
    semanas: int
    objetivo: str               # hipertrofia / forca / potencia / deload
    series_por_exercicio: int   # ex: 4
    repeticoes: str             # ex: "8-12" ou "3-5"
    intensidade_pct: int        # % do 1RM ex: 70
    descanso_seg: int           # ex: 90
    descricao: Optional[str] = None


class ProgramaCreate(BaseModel):
    nome: str
    objetivo: Optional[str] = None
    descricao: Optional[str] = None
    fases: list[FaseSchema]


class AplicarPrograma(BaseModel):
    aluno_id: int
    programa_id: int
    iniciado_em: Optional[str] = None  # ISO date; padrão hoje


# ── Helpers ────────────────────────────────────────────────────────────────────

def _serialize_programa(p: ProgramaTreino) -> dict:
    fases = json.loads(p.fases) if p.fases else []
    semanas_total = sum(f.get("semanas", 0) for f in fases)
    return {
        "id": p.id,
        "nome": p.nome,
        "objetivo": p.objetivo,
        "descricao": p.descricao,
        "semanas_total": semanas_total,
        "fases": fases,
        "criado_em": p.criado_em.isoformat(),
    }


def _semana_atual(iniciado_em: datetime) -> int:
    delta = datetime.utcnow() - iniciado_em
    return max(1, delta.days // 7 + 1)


# ── Rotas ──────────────────────────────────────────────────────────────────────

@router.get("/")
def listar_programas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    programas = (
        db.query(ProgramaTreino)
        .filter(ProgramaTreino.tenant_id == current_user.tenant_id)
        .order_by(ProgramaTreino.criado_em.desc())
        .all()
    )
    return [_serialize_programa(p) for p in programas]


@router.post("/", status_code=201)
def criar_programa(
    body: ProgramaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fases = [f.model_dump() for f in body.fases]
    semanas_total = sum(f["semanas"] for f in fases)
    p = ProgramaTreino(
        tenant_id=current_user.tenant_id,
        personal_id=current_user.id,
        nome=body.nome,
        objetivo=body.objetivo,
        descricao=body.descricao,
        semanas_total=semanas_total,
        fases=json.dumps(fases),
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return _serialize_programa(p)


@router.delete("/{programa_id}", status_code=204)
def deletar_programa(
    programa_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    p = db.query(ProgramaTreino).filter(
        ProgramaTreino.id == programa_id,
        ProgramaTreino.tenant_id == current_user.tenant_id,
    ).first()
    if not p:
        raise HTTPException(404, "Programa não encontrado")
    db.delete(p)
    db.commit()


@router.post("/aplicar", status_code=201)
def aplicar_programa(
    body: AplicarPrograma,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    aluno = db.query(Aluno).filter(
        Aluno.id == body.aluno_id,
        Aluno.tenant_id == current_user.tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")

    programa = db.query(ProgramaTreino).filter(
        ProgramaTreino.id == body.programa_id,
        ProgramaTreino.tenant_id == current_user.tenant_id,
    ).first()
    if not programa:
        raise HTTPException(404, "Programa não encontrado")

    # Desativa aplicações anteriores do aluno
    db.query(AplicacaoPrograma).filter(
        AplicacaoPrograma.aluno_id == body.aluno_id,
        AplicacaoPrograma.tenant_id == current_user.tenant_id,
        AplicacaoPrograma.ativo == True,
    ).update({"ativo": False})

    iniciado_em = datetime.utcnow()
    if body.iniciado_em:
        try:
            iniciado_em = datetime.fromisoformat(body.iniciado_em)
        except ValueError:
            pass

    ap = AplicacaoPrograma(
        tenant_id=current_user.tenant_id,
        aluno_id=body.aluno_id,
        programa_id=body.programa_id,
        iniciado_em=iniciado_em,
        ativo=True,
    )
    db.add(ap)
    db.commit()
    db.refresh(ap)

    fases = json.loads(programa.fases) if programa.fases else []
    semana = _semana_atual(iniciado_em)
    semanas_acum = 0
    fase_atual = None
    for f in fases:
        semanas_acum += f.get("semanas", 0)
        if semana <= semanas_acum:
            fase_atual = f
            break

    return {
        "id": ap.id,
        "aluno_id": body.aluno_id,
        "programa_id": body.programa_id,
        "iniciado_em": iniciado_em.isoformat(),
        "semana_atual": semana,
        "fase_atual": fase_atual,
    }


@router.get("/aluno/{aluno_id}")
def programa_do_aluno(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ap = (
        db.query(AplicacaoPrograma)
        .filter(
            AplicacaoPrograma.aluno_id == aluno_id,
            AplicacaoPrograma.tenant_id == current_user.tenant_id,
            AplicacaoPrograma.ativo == True,
        )
        .order_by(AplicacaoPrograma.iniciado_em.desc())
        .first()
    )
    if not ap:
        return None

    programa = db.query(ProgramaTreino).filter(ProgramaTreino.id == ap.programa_id).first()
    fases = json.loads(programa.fases) if programa.fases else []
    semana = _semana_atual(ap.iniciado_em)
    semanas_acum = 0
    fase_atual = None
    semana_na_fase = semana
    for f in fases:
        if semana <= semanas_acum + f.get("semanas", 0):
            fase_atual = f
            semana_na_fase = semana - semanas_acum
            break
        semanas_acum += f.get("semanas", 0)

    semanas_total = sum(f.get("semanas", 0) for f in fases)

    return {
        "aplicacao_id": ap.id,
        "programa": _serialize_programa(programa),
        "iniciado_em": ap.iniciado_em.isoformat(),
        "semana_atual": semana,
        "semana_na_fase": semana_na_fase,
        "fase_atual": fase_atual,
        "progresso_pct": min(100, round((semana / semanas_total) * 100)) if semanas_total else 0,
        "concluido": semana > semanas_total,
    }
