import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Aluno, Conquista, ExecucaoItem, ExecucaoTreino, SugestaoProgressao, Treino, User
from app.schemas.alunos import AlunoCreate, AlunoResponse, AlunoUpdate, AnamneseData
from app.schemas.execucoes import HistoricoCargaEntry, HistoricoCargaResponse
from app.schemas.gamificacao import ConquistaResponse, GamificacaoResponse
from app.schemas.ia import StatusAlunoSugestoesResponse, SugestaoProgressaoResponse
from app.schemas.treinos import TreinoResponse
from app.services.gamificacao import CONQUISTAS_DEFINICOES

router = APIRouter()

# Convenção de dia_semana usada no campo Treino.dia_semana
_DIAS_SEMANA = {
    0: "segunda",
    1: "terca",
    2: "quarta",
    3: "quinta",
    4: "sexta",
    5: "sabado",
    6: "domingo",
}


def _get_aluno_or_404(aluno_id: int, tenant_id: int, db: Session) -> Aluno:
    aluno = db.query(Aluno).filter(
        Aluno.id == aluno_id,
        Aluno.tenant_id == tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    return aluno


@router.get("/meu-perfil", response_model=AlunoResponse)
def meu_perfil(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna o registro Aluno vinculado ao usuário logado (role=aluno)."""
    aluno = db.query(Aluno).filter(Aluno.user_id == current_user.id).first()
    if not aluno:
        # Fallback: aluno criado manualmente sem convite — busca por email + tenant
        aluno = db.query(Aluno).filter(
            Aluno.email == current_user.email,
            Aluno.tenant_id == current_user.tenant_id,
        ).first()
        if aluno:
            aluno.user_id = current_user.id  # auto-link
            db.commit()
    if not aluno:
        raise HTTPException(status_code=404, detail="Perfil de aluno não encontrado")
    return aluno


@router.get("/", response_model=list[AlunoResponse])
def listar_alunos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Aluno).filter(Aluno.tenant_id == current_user.tenant_id).all()


@router.post("/", response_model=AlunoResponse, status_code=201)
def criar_aluno(
    body: AlunoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    aluno = Aluno(
        tenant_id=current_user.tenant_id,
        personal_id=current_user.id,
        nome=body.nome,
        email=body.email,
        objetivo=body.objetivo or None,
    )
    db.add(aluno)
    db.commit()
    db.refresh(aluno)
    return aluno


@router.patch("/{aluno_id}", response_model=AlunoResponse)
def atualizar_aluno(
    aluno_id: int,
    body: AlunoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    aluno = _get_aluno_or_404(aluno_id, current_user.tenant_id, db)
    if body.nome is not None:
        aluno.nome = body.nome
    if body.email is not None:
        aluno.email = body.email
    if body.objetivo is not None:
        aluno.objetivo = body.objetivo
    db.commit()
    db.refresh(aluno)
    return aluno


@router.delete("/{aluno_id}", status_code=204)
def deletar_aluno(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    aluno = _get_aluno_or_404(aluno_id, current_user.tenant_id, db)
    db.delete(aluno)
    db.commit()


@router.get("/{aluno_id}", response_model=AlunoResponse)
def obter_aluno(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_aluno_or_404(aluno_id, current_user.tenant_id, db)


@router.get("/{aluno_id}/anamnese", response_model=AnamneseData)
def obter_anamnese(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    aluno = _get_aluno_or_404(aluno_id, current_user.tenant_id, db)
    if not aluno.anamnese:
        return AnamneseData()
    return json.loads(aluno.anamnese)


@router.put("/{aluno_id}/anamnese", response_model=AnamneseData)
def salvar_anamnese(
    aluno_id: int,
    body: AnamneseData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    aluno = _get_aluno_or_404(aluno_id, current_user.tenant_id, db)
    aluno.anamnese = body.model_dump_json()
    db.commit()
    return body


@router.get("/{aluno_id}/treino-do-dia", response_model=list[TreinoResponse])
def treino_do_dia(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna os treinos agendados para hoje (por dia_semana).
    Convenção: segunda, terca, quarta, quinta, sexta, sabado, domingo.
    """
    _get_aluno_or_404(aluno_id, current_user.tenant_id, db)

    dia_hoje = _DIAS_SEMANA[datetime.utcnow().weekday()]

    return (
        db.query(Treino)
        .options(joinedload(Treino.itens))
        .filter(
            Treino.aluno_id == aluno_id,
            Treino.tenant_id == current_user.tenant_id,
            Treino.dia_semana == dia_hoje,
        )
        .all()
    )


@router.get("/{aluno_id}/historico-carga/{exercicio_id}", response_model=HistoricoCargaResponse)
def historico_carga(
    aluno_id: int,
    exercicio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna o histórico de carga realizada por exercício (mais recente primeiro).
    Usado pelo front para gráficos e pela IA para sugerir progressão.
    """
    _get_aluno_or_404(aluno_id, current_user.tenant_id, db)

    rows = (
        db.query(ExecucaoItem, ExecucaoTreino)
        .join(ExecucaoTreino, ExecucaoItem.execucao_id == ExecucaoTreino.id)
        .filter(
            ExecucaoTreino.aluno_id == aluno_id,
            ExecucaoTreino.tenant_id == current_user.tenant_id,
            ExecucaoItem.exercicio_id == exercicio_id,
        )
        .order_by(ExecucaoTreino.data.desc())
        .limit(30)
        .all()
    )

    historico = [
        HistoricoCargaEntry(
            data=execucao.data,
            carga_realizada=item.carga_realizada,
            repeticoes_realizadas=item.repeticoes_realizadas,
            dificuldade=execucao.dificuldade,
        )
        for item, execucao in rows
    ]

    return HistoricoCargaResponse(
        exercicio_id=exercicio_id,
        aluno_id=aluno_id,
        historico=historico,
    )


@router.get("/{aluno_id}/sugestoes", response_model=StatusAlunoSugestoesResponse)
def sugestoes_aluno(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna sugestões de progressão pendentes da IA + dias sem treinar.
    Usado pelo dashboard do personal (badge 'Sugestão da IA' e alerta de estagnação).
    """
    _get_aluno_or_404(aluno_id, current_user.tenant_id, db)

    sugestoes = (
        db.query(SugestaoProgressao)
        .filter(
            SugestaoProgressao.aluno_id == aluno_id,
            SugestaoProgressao.tenant_id == current_user.tenant_id,
            SugestaoProgressao.visto == False,
        )
        .order_by(SugestaoProgressao.gerado_em.desc())
        .all()
    )

    ultima_exec = (
        db.query(ExecucaoTreino)
        .filter(ExecucaoTreino.aluno_id == aluno_id)
        .order_by(ExecucaoTreino.data.desc())
        .first()
    )

    dias_sem_treinar: int | None = None
    if ultima_exec:
        dias_sem_treinar = (datetime.utcnow() - ultima_exec.data).days

    return StatusAlunoSugestoesResponse(
        aluno_id=aluno_id,
        dias_sem_treinar=dias_sem_treinar,
        sugestoes_pendentes=sugestoes,
    )


@router.get("/{aluno_id}/gamificacao", response_model=GamificacaoResponse)
def estado_gamificacao(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna streak, recorde e conquistas desbloqueadas do aluno."""
    aluno = _get_aluno_or_404(aluno_id, current_user.tenant_id, db)

    conquistas = (
        db.query(Conquista)
        .filter(Conquista.aluno_id == aluno_id)
        .order_by(Conquista.desbloqueado_em)
        .all()
    )

    total_treinos = (
        db.query(ExecucaoTreino)
        .filter(ExecucaoTreino.aluno_id == aluno_id)
        .count()
    )

    conquistas_resp = [
        ConquistaResponse(
            id=c.id,
            codigo=c.codigo,
            descricao=CONQUISTAS_DEFINICOES.get(c.codigo, c.codigo),
            desbloqueado_em=c.desbloqueado_em,
        )
        for c in conquistas
    ]

    return GamificacaoResponse(
        aluno_id=aluno_id,
        streak_atual=aluno.streak_atual or 0,
        streak_recorde=aluno.streak_recorde or 0,
        total_treinos=total_treinos,
        conquistas=conquistas_resp,
    )
