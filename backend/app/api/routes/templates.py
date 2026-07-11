"""
Templates de treino reutilizáveis.
POST /templates/from-treino/{treino_id}  → salva treino existente como template
POST /templates/{id}/aplicar             → copia template para um aluno (cria treino)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from app.core.db import get_db
from app.core.deps import require_personal
from app.models import (
    Aluno, Exercicio, TemplateTreino, TemplateTreinoItem,
    Treino, TreinoItem, User,
)

router = APIRouter()


# ── Pydantic schemas (inline — small enough to not need a separate file) ──────

class TemplateCreate(BaseModel):
    nome: str
    objetivo: str | None = None
    dia_semana: str | None = None
    descricao: str | None = None


class TemplateItemCreate(BaseModel):
    exercicio_id: int
    series: int = 3
    repeticoes: str = "12"
    carga: float | None = None
    descanso_seg: int = 60
    ordem: int = 0


class AplicarTemplateRequest(BaseModel):
    aluno_id: int
    dia_semana: str | None = None  # override the template's dia_semana
    nome: str | None = None        # override the template's name


def _template_dict(t: TemplateTreino) -> dict:
    return {
        "id": t.id,
        "nome": t.nome,
        "objetivo": t.objetivo,
        "dia_semana": t.dia_semana,
        "descricao": t.descricao,
        "criado_em": t.criado_em.isoformat() if t.criado_em else None,
        "n_exercicios": len(t.itens),
        "itens": [
            {
                "id": i.id,
                "exercicio_id": i.exercicio_id,
                "series": i.series,
                "repeticoes": i.repeticoes,
                "carga": i.carga,
                "descanso_seg": i.descanso_seg,
                "ordem": i.ordem,
            }
            for i in sorted(t.itens, key=lambda x: x.ordem)
        ],
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/")
def listar_templates(
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    templates = (
        db.query(TemplateTreino)
        .options(joinedload(TemplateTreino.itens))
        .filter(TemplateTreino.tenant_id == current_user.tenant_id)
        .order_by(TemplateTreino.criado_em.desc())
        .all()
    )
    return [_template_dict(t) for t in templates]


@router.post("/", status_code=201)
def criar_template(
    body: TemplateCreate,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    t = TemplateTreino(
        tenant_id=current_user.tenant_id,
        personal_id=current_user.id,
        nome=body.nome,
        objetivo=body.objetivo,
        dia_semana=body.dia_semana,
        descricao=body.descricao,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return _template_dict(t)


@router.get("/{template_id}")
def obter_template(
    template_id: int,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    t = (
        db.query(TemplateTreino)
        .options(joinedload(TemplateTreino.itens))
        .filter(TemplateTreino.id == template_id, TemplateTreino.tenant_id == current_user.tenant_id)
        .first()
    )
    if not t:
        raise HTTPException(404, "Template não encontrado")
    return _template_dict(t)


@router.delete("/{template_id}", status_code=204)
def deletar_template(
    template_id: int,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    t = db.query(TemplateTreino).filter(
        TemplateTreino.id == template_id,
        TemplateTreino.tenant_id == current_user.tenant_id,
    ).first()
    if not t:
        raise HTTPException(404, "Template não encontrado")
    db.delete(t)
    db.commit()


@router.post("/{template_id}/itens/", status_code=201)
def adicionar_item_template(
    template_id: int,
    body: TemplateItemCreate,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    t = db.query(TemplateTreino).filter(
        TemplateTreino.id == template_id,
        TemplateTreino.tenant_id == current_user.tenant_id,
    ).first()
    if not t:
        raise HTTPException(404, "Template não encontrado")
    item = TemplateTreinoItem(
        template_id=template_id,
        exercicio_id=body.exercicio_id,
        series=body.series,
        repeticoes=body.repeticoes,
        carga=body.carga,
        descanso_seg=body.descanso_seg,
        ordem=body.ordem,
    )
    db.add(item)
    db.commit()
    return {"id": item.id, "template_id": template_id}


@router.delete("/{template_id}/itens/{item_id}", status_code=204)
def remover_item_template(
    template_id: int,
    item_id: int,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    db.query(TemplateTreinoItem).filter(
        TemplateTreinoItem.id == item_id,
        TemplateTreinoItem.template_id == template_id,
    ).delete()
    db.commit()


@router.post("/from-treino/{treino_id}", status_code=201)
def criar_template_from_treino(
    treino_id: int,
    body: TemplateCreate,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    """Salva um treino existente como template reutilizável."""
    treino = (
        db.query(Treino)
        .options(joinedload(Treino.itens))
        .filter(Treino.id == treino_id, Treino.tenant_id == current_user.tenant_id)
        .first()
    )
    if not treino:
        raise HTTPException(404, "Treino não encontrado")

    t = TemplateTreino(
        tenant_id=current_user.tenant_id,
        personal_id=current_user.id,
        nome=body.nome or treino.nome,
        objetivo=body.objetivo,
        dia_semana=body.dia_semana or treino.dia_semana,
        descricao=body.descricao,
    )
    db.add(t)
    db.flush()

    for idx, item in enumerate(sorted(treino.itens, key=lambda x: x.ordem)):
        db.add(TemplateTreinoItem(
            template_id=t.id,
            exercicio_id=item.exercicio_id,
            series=item.series,
            repeticoes=item.repeticoes,
            carga=item.carga,
            descanso_seg=item.descanso_seg,
            ordem=idx,
        ))

    db.commit()
    db.refresh(t)
    return _template_dict(t)


@router.post("/{template_id}/aplicar", status_code=201)
def aplicar_template(
    template_id: int,
    body: AplicarTemplateRequest,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    """Aplica o template a um aluno — cria um novo treino com todos os itens copiados."""
    t = (
        db.query(TemplateTreino)
        .options(joinedload(TemplateTreino.itens))
        .filter(TemplateTreino.id == template_id, TemplateTreino.tenant_id == current_user.tenant_id)
        .first()
    )
    if not t:
        raise HTTPException(404, "Template não encontrado")

    aluno = db.query(Aluno).filter(
        Aluno.id == body.aluno_id,
        Aluno.tenant_id == current_user.tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")

    treino = Treino(
        tenant_id=current_user.tenant_id,
        aluno_id=body.aluno_id,
        nome=body.nome or t.nome,
        dia_semana=body.dia_semana or t.dia_semana,
    )
    db.add(treino)
    db.flush()

    for item in sorted(t.itens, key=lambda x: x.ordem):
        db.add(TreinoItem(
            treino_id=treino.id,
            exercicio_id=item.exercicio_id,
            series=item.series,
            repeticoes=item.repeticoes,
            carga=item.carga,
            descanso_seg=item.descanso_seg,
            ordem=item.ordem,
        ))

    db.commit()
    db.refresh(treino)
    return {"treino_id": treino.id, "aluno_id": aluno.id, "nome": treino.nome}
