from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.deps import get_current_user, require_personal
from app.models import Aluno, ExecucaoItem, ExecucaoTreino, Treino, TreinoItem, User
from app.services.gamificacao import atualizar_gamificacao
from app.schemas.execucoes import ExecucaoCreate, ExecucaoResponse
from app.schemas.treinos import (
    TreinoCreate,
    TreinoItemCreate,
    TreinoItemResponse,
    TreinoResponse,
)

router = APIRouter()


def _get_treino_or_404(treino_id: int, tenant_id: int, db: Session) -> Treino:
    treino = db.query(Treino).filter(
        Treino.id == treino_id,
        Treino.tenant_id == tenant_id,
    ).first()
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    return treino


@router.get("/", response_model=list[TreinoResponse])
def listar_treinos(
    aluno_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    limit = min(limit, 200)
    q = (
        db.query(Treino)
        .options(joinedload(Treino.itens))
        .filter(Treino.tenant_id == current_user.tenant_id)
    )
    if aluno_id is not None:
        q = q.filter(Treino.aluno_id == aluno_id)
    return q.offset(skip).limit(limit).all()


@router.post("/", response_model=TreinoResponse, status_code=201)
def criar_treino(
    body: TreinoCreate,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    aluno = db.query(Aluno).filter(
        Aluno.id == body.aluno_id,
        Aluno.tenant_id == current_user.tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    treino = Treino(
        tenant_id=current_user.tenant_id,
        aluno_id=body.aluno_id,
        nome=body.nome,
        dia_semana=body.dia_semana or None,
    )
    db.add(treino)
    db.commit()
    db.refresh(treino)
    return treino


@router.get("/{treino_id}", response_model=TreinoResponse)
def obter_treino(
    treino_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    treino = (
        db.query(Treino)
        .options(joinedload(Treino.itens))
        .filter(Treino.id == treino_id, Treino.tenant_id == current_user.tenant_id)
        .first()
    )
    if not treino:
        raise HTTPException(status_code=404, detail="Treino não encontrado")
    return treino


@router.post("/{treino_id}/itens/", response_model=TreinoItemResponse, status_code=201)
def adicionar_item(
    treino_id: int,
    body: TreinoItemCreate,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    _get_treino_or_404(treino_id, current_user.tenant_id, db)
    item = TreinoItem(
        treino_id=treino_id,
        exercicio_id=body.exercicio_id,
        series=body.series,
        repeticoes=body.repeticoes,
        carga=body.carga,
        descanso_seg=body.descanso_seg,
        ordem=body.ordem,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{treino_id}/itens/{item_id}", status_code=204)
def remover_item(
    treino_id: int,
    item_id: int,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    _get_treino_or_404(treino_id, current_user.tenant_id, db)
    item = db.query(TreinoItem).filter(
        TreinoItem.id == item_id,
        TreinoItem.treino_id == treino_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    db.delete(item)
    db.commit()


@router.post("/{treino_id}/executar", response_model=ExecucaoResponse, status_code=201)
def registrar_execucao(
    treino_id: int,
    body: ExecucaoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Registra a execução de um treino com dificuldade geral e cargas realizadas
    por exercício. Os itens alimentam o histórico de carga e a IA de progressão.
    """
    treino = _get_treino_or_404(treino_id, current_user.tenant_id, db)

    ex = ExecucaoTreino(
        tenant_id=current_user.tenant_id,
        treino_id=treino_id,
        aluno_id=treino.aluno_id,
        dificuldade=body.dificuldade,
        comentario=body.comentario,
    )
    db.add(ex)
    db.flush()

    for item_input in body.itens:
        db.add(ExecucaoItem(
            execucao_id=ex.id,
            treino_item_id=item_input.treino_item_id,
            exercicio_id=item_input.exercicio_id,
            carga_realizada=item_input.carga_realizada,
            repeticoes_realizadas=item_input.repeticoes_realizadas,
            series_realizadas=item_input.series_realizadas,
        ))

    db.flush()  # garante ex.id para os itens

    aluno = db.query(Aluno).filter(Aluno.id == treino.aluno_id).first()
    atualizar_gamificacao(aluno, db)

    db.commit()
    db.refresh(ex)
    return ex


class DuplicarTreinoBody(BaseModel):
    aluno_id: Optional[int] = None   # se None, duplica para o mesmo aluno
    nome: Optional[str] = None       # se None, usa "Cópia de {original}"
    dia_semana: Optional[str] = None


@router.post("/{treino_id}/duplicar", response_model=TreinoResponse, status_code=201)
def duplicar_treino(
    treino_id: int,
    body: DuplicarTreinoBody,
    current_user: User = Depends(require_personal),
    db: Session = Depends(get_db),
):
    """Cria uma cópia do treino (e todos os seus itens) opcionalmente para outro aluno."""
    original = (
        db.query(Treino)
        .options(joinedload(Treino.itens))
        .filter(Treino.id == treino_id, Treino.tenant_id == current_user.tenant_id)
        .first()
    )
    if not original:
        raise HTTPException(404, "Treino não encontrado")

    aluno_id = body.aluno_id or original.aluno_id
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id, Aluno.tenant_id == current_user.tenant_id).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")

    copia = Treino(
        tenant_id=current_user.tenant_id,
        aluno_id=aluno_id,
        nome=body.nome or f"Cópia de {original.nome}",
        dia_semana=body.dia_semana if body.dia_semana is not None else original.dia_semana,
    )
    db.add(copia)
    db.flush()

    for item in original.itens:
        db.add(TreinoItem(
            treino_id=copia.id,
            exercicio_id=item.exercicio_id,
            series=item.series,
            repeticoes=item.repeticoes,
            carga=item.carga,
            descanso_seg=item.descanso_seg,
            ordem=item.ordem,
        ))

    db.commit()
    db.refresh(copia)
    return db.query(Treino).options(joinedload(Treino.itens)).filter(Treino.id == copia.id).first()
