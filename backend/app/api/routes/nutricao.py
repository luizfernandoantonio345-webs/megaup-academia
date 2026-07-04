"""
Sprint G — Nutrição
Prefix: /nutricao
"""
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.api.deps import get_current_user
from app.models import PlanoNutricao, Refeicao, Aluno, User, Role

router = APIRouter()


class AlimentoSchema(BaseModel):
    nome: str
    qtd: str          # "100g" / "2 fatias"
    kcal: Optional[int] = None
    prot: Optional[float] = None
    carbo: Optional[float] = None
    gord: Optional[float] = None


class RefeicaoSchema(BaseModel):
    nome: str
    horario: Optional[str] = None
    alimentos: List[AlimentoSchema] = []


class PlanoCreate(BaseModel):
    aluno_id: int
    nome: str = "Plano Alimentar"
    objetivo_kcal: Optional[int] = None
    objetivo_proteina: Optional[int] = None
    objetivo_carbo: Optional[int] = None
    objetivo_gordura: Optional[int] = None
    observacoes: Optional[str] = None
    refeicoes: List[RefeicaoSchema] = []


class RefeicaoAdd(BaseModel):
    nome: str
    horario: Optional[str] = None
    alimentos: List[AlimentoSchema] = []


def _plano_dict(p: PlanoNutricao):
    refeicoes = []
    for r in sorted(p.refeicoes, key=lambda x: x.id):
        alimentos = []
        try:
            alimentos = json.loads(r.alimentos or "[]")
        except Exception:
            pass
        refeicoes.append({
            "id": r.id,
            "nome": r.nome,
            "horario": r.horario,
            "alimentos": alimentos,
        })
    total_kcal = sum(
        sum(a.get("kcal", 0) or 0 for a in r["alimentos"])
        for r in refeicoes
    )
    return {
        "id": p.id,
        "aluno_id": p.aluno_id,
        "nome": p.nome,
        "objetivo_kcal": p.objetivo_kcal,
        "objetivo_proteina": p.objetivo_proteina,
        "objetivo_carbo": p.objetivo_carbo,
        "objetivo_gordura": p.objetivo_gordura,
        "observacoes": p.observacoes,
        "total_kcal_prescrito": total_kcal,
        "refeicoes": refeicoes,
        "criado_em": p.criado_em.isoformat(),
    }


@router.get("/aluno/{aluno_id}")
def plano_do_aluno(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Aluno pode ver seu próprio plano
    if current_user.role == Role.aluno:
        from app.models import Aluno as AlunoModel
        aluno = db.query(AlunoModel).filter(
            AlunoModel.user_id == current_user.id,
            AlunoModel.id == aluno_id,
        ).first()
        if not aluno:
            raise HTTPException(403, "Acesso negado")
    else:
        aluno = db.query(Aluno).filter(
            Aluno.id == aluno_id,
            Aluno.tenant_id == current_user.tenant_id,
        ).first()
        if not aluno:
            raise HTTPException(404, "Aluno não encontrado")

    plano = db.query(PlanoNutricao).filter(PlanoNutricao.aluno_id == aluno_id).first()
    if not plano:
        return None
    return _plano_dict(plano)


@router.post("/", status_code=201)
def criar_plano(
    body: PlanoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    aluno = db.query(Aluno).filter(
        Aluno.id == body.aluno_id,
        Aluno.tenant_id == current_user.tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")

    # Remove plano anterior se existir
    antigo = db.query(PlanoNutricao).filter(PlanoNutricao.aluno_id == body.aluno_id).first()
    if antigo:
        db.delete(antigo)
        db.flush()

    plano = PlanoNutricao(
        tenant_id=current_user.tenant_id,
        aluno_id=body.aluno_id,
        nome=body.nome,
        objetivo_kcal=body.objetivo_kcal,
        objetivo_proteina=body.objetivo_proteina,
        objetivo_carbo=body.objetivo_carbo,
        objetivo_gordura=body.objetivo_gordura,
        observacoes=body.observacoes,
    )
    db.add(plano)
    db.flush()

    for ref in body.refeicoes:
        db.add(Refeicao(
            plano_id=plano.id,
            nome=ref.nome,
            horario=ref.horario,
            alimentos=json.dumps([a.dict() for a in ref.alimentos], ensure_ascii=False),
        ))
    db.commit()
    db.refresh(plano)
    return _plano_dict(plano)


@router.post("/{plano_id}/refeicoes", status_code=201)
def adicionar_refeicao(
    plano_id: int,
    body: RefeicaoAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plano = db.query(PlanoNutricao).filter(
        PlanoNutricao.id == plano_id,
        PlanoNutricao.tenant_id == current_user.tenant_id,
    ).first()
    if not plano:
        raise HTTPException(404, "Plano não encontrado")
    ref = Refeicao(
        plano_id=plano_id,
        nome=body.nome,
        horario=body.horario,
        alimentos=json.dumps([a.dict() for a in body.alimentos], ensure_ascii=False),
    )
    db.add(ref)
    db.commit()
    return {"ok": True}


@router.put("/{plano_id}/refeicoes/{ref_id}")
def atualizar_refeicao(
    plano_id: int,
    ref_id: int,
    body: RefeicaoAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ref = db.query(Refeicao).filter(Refeicao.id == ref_id, Refeicao.plano_id == plano_id).first()
    if not ref:
        raise HTTPException(404, "Refeição não encontrada")
    ref.nome = body.nome
    ref.horario = body.horario
    ref.alimentos = json.dumps([a.dict() for a in body.alimentos], ensure_ascii=False)
    db.commit()
    return {"ok": True}


@router.delete("/{plano_id}/refeicoes/{ref_id}", status_code=204)
def remover_refeicao(
    plano_id: int,
    ref_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ref = db.query(Refeicao).filter(Refeicao.id == ref_id, Refeicao.plano_id == plano_id).first()
    if not ref:
        raise HTTPException(404, "Refeição não encontrada")
    db.delete(ref)
    db.commit()


@router.delete("/{plano_id}", status_code=204)
def deletar_plano(
    plano_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plano = db.query(PlanoNutricao).filter(
        PlanoNutricao.id == plano_id,
        PlanoNutricao.tenant_id == current_user.tenant_id,
    ).first()
    if not plano:
        raise HTTPException(404, "Plano não encontrado")
    db.delete(plano)
    db.commit()
