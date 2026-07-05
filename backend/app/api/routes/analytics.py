"""
Sprint E — Analytics & Relatórios
GET /analytics/resumo         → métricas gerais do tenant
GET /analytics/aluno/{id}     → dados completos para relatório PDF do aluno
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.api.deps import get_current_user
from app.models import (
    Aluno, ExecucaoTreino, ExecucaoItem, Exercicio,
    Cobranca, CobrancaStatus, Conquista, Avaliacao, Treino, User
)

router = APIRouter()


def _tenant_id(user: User) -> int:
    return user.tenant_id


@router.get("/resumo")
def resumo(
    dias: int = Query(7, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tid = _tenant_id(current_user)
    agora = datetime.utcnow()
    periodo = agora - timedelta(days=dias)
    inicio_mes = agora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_alunos = db.query(func.count(Aluno.id)).filter(Aluno.tenant_id == tid).scalar() or 0

    ativos_ids = (
        db.query(ExecucaoTreino.aluno_id)
        .filter(ExecucaoTreino.tenant_id == tid, ExecucaoTreino.data >= periodo)
        .distinct()
        .subquery()
    )
    alunos_ativos = db.query(func.count()).select_from(ativos_ids).scalar() or 0
    alunos_inativos = max(0, total_alunos - alunos_ativos)

    treinos_periodo = (
        db.query(func.count(ExecucaoTreino.id))
        .filter(ExecucaoTreino.tenant_id == tid, ExecucaoTreino.data >= periodo)
        .scalar() or 0
    )

    receita_mes = (
        db.query(func.coalesce(func.sum(Cobranca.valor), 0))
        .filter(
            Cobranca.tenant_id == tid,
            Cobranca.status == CobrancaStatus.pago,
            Cobranca.pago_em >= inicio_mes,
        )
        .scalar() or 0.0
    )

    rows = (
        db.query(
            func.date(ExecucaoTreino.data).label("dia"),
            func.count(ExecucaoTreino.id).label("total"),
        )
        .filter(ExecucaoTreino.tenant_id == tid, ExecucaoTreino.data >= periodo)
        .group_by(func.date(ExecucaoTreino.data))
        .order_by(func.date(ExecucaoTreino.data))
        .all()
    )
    treinos_por_dia = [{"dia": str(r.dia), "total": r.total} for r in rows]

    obj_rows = (
        db.query(Aluno.objetivo, func.count(Aluno.id).label("n"))
        .filter(Aluno.tenant_id == tid)
        .group_by(Aluno.objetivo)
        .all()
    )
    por_objetivo = [{"objetivo": r.objetivo or "Não definido", "n": r.n} for r in obj_rows]

    top_streak = (
        db.query(Aluno.nome, Aluno.streak_atual, Aluno.streak_recorde)
        .filter(Aluno.tenant_id == tid, Aluno.streak_atual > 0)
        .order_by(Aluno.streak_atual.desc())
        .limit(5)
        .all()
    )

    top_exercicios = (
        db.query(Exercicio.nome, func.count(ExecucaoItem.id).label("n"))
        .join(ExecucaoItem, ExecucaoItem.exercicio_id == Exercicio.id)
        .join(ExecucaoTreino, ExecucaoTreino.id == ExecucaoItem.execucao_id)
        .filter(ExecucaoTreino.tenant_id == tid, ExecucaoTreino.data >= periodo)
        .group_by(Exercicio.nome)
        .order_by(func.count(ExecucaoItem.id).desc())
        .limit(8)
        .all()
    )

    return {
        "total_alunos": total_alunos,
        "alunos_ativos_7d": alunos_ativos,
        "alunos_inativos_7d": alunos_inativos,
        "treinos_semana": treinos_periodo,
        "receita_mes": float(receita_mes),
        "treinos_por_dia": treinos_por_dia,
        "por_objetivo": por_objetivo,
        "top_streak": [{"nome": r.nome, "streak_atual": r.streak_atual, "streak_recorde": r.streak_recorde} for r in top_streak],
        "top_exercicios": [{"nome": r.nome, "n": r.n} for r in top_exercicios],
    }


@router.get("/aluno/{aluno_id}")
def relatorio_aluno(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tid = _tenant_id(current_user)
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id, Aluno.tenant_id == tid).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")

    agora = datetime.utcnow()
    trinta_dias = agora - timedelta(days=30)
    noventa_dias = agora - timedelta(days=90)

    # Frequência últimos 30 dias
    execucoes_30d = (
        db.query(ExecucaoTreino)
        .filter(ExecucaoTreino.aluno_id == aluno_id, ExecucaoTreino.data >= trinta_dias)
        .order_by(ExecucaoTreino.data.desc())
        .all()
    )
    frequencia_30d = len(execucoes_30d)

    # Treinos totais
    total_treinos = db.query(func.count(ExecucaoTreino.id)).filter(ExecucaoTreino.aluno_id == aluno_id).scalar() or 0

    # Avaliações físicas
    avaliacoes = (
        db.query(Avaliacao)
        .filter(Avaliacao.aluno_id == aluno_id)
        .order_by(Avaliacao.data.asc())
        .all()
    )
    avaliacoes_list = [
        {
            "data": av.data.strftime("%d/%m/%Y"),
            "peso": av.peso,
            "percentual_gordura": av.percentual_gordura,
            "medidas": av.medidas,
        }
        for av in avaliacoes
    ]

    # Progresso por exercício (primeira vs última carga)
    ex_rows = (
        db.query(
            Exercicio.nome,
            Exercicio.grupo_muscular,
            func.min(ExecucaoItem.carga_realizada).label("carga_inicial"),
            func.max(ExecucaoItem.carga_realizada).label("carga_maxima"),
            func.count(ExecucaoItem.id).label("execucoes"),
        )
        .join(ExecucaoItem, ExecucaoItem.exercicio_id == Exercicio.id)
        .join(ExecucaoTreino, ExecucaoTreino.id == ExecucaoItem.execucao_id)
        .filter(
            ExecucaoTreino.aluno_id == aluno_id,
            ExecucaoTreino.data >= noventa_dias,
            ExecucaoItem.carga_realizada.isnot(None),
        )
        .group_by(Exercicio.nome, Exercicio.grupo_muscular)
        .order_by(func.count(ExecucaoItem.id).desc())
        .limit(10)
        .all()
    )
    progresso_exercicios = [
        {
            "nome": r.nome,
            "grupo": r.grupo_muscular,
            "carga_inicial": float(r.carga_inicial) if r.carga_inicial else None,
            "carga_maxima": float(r.carga_maxima) if r.carga_maxima else None,
            "evolucao_pct": round(((r.carga_maxima - r.carga_inicial) / r.carga_inicial * 100), 1)
            if r.carga_inicial and r.carga_inicial > 0 else None,
            "execucoes": r.execucoes,
        }
        for r in ex_rows
    ]

    # Conquistas
    conquistas = (
        db.query(Conquista)
        .filter(Conquista.aluno_id == aluno_id)
        .order_by(Conquista.desbloqueado_em.desc())
        .all()
    )
    conquistas_list = [
        {"codigo": c.codigo, "data": c.desbloqueado_em.strftime("%d/%m/%Y")}
        for c in conquistas
    ]

    # Personal responsável
    personal = db.query(User).filter(User.id == aluno.personal_id).first()

    return {
        "aluno": {
            "id": aluno.id,
            "nome": aluno.nome,
            "email": aluno.email,
            "objetivo": aluno.objetivo,
            "streak_atual": aluno.streak_atual,
            "streak_recorde": aluno.streak_recorde,
            "membro_desde": aluno.criado_em.strftime("%d/%m/%Y"),
        },
        "personal": personal.nome if personal else "—",
        "periodo": {
            "inicio": trinta_dias.strftime("%d/%m/%Y"),
            "fim": agora.strftime("%d/%m/%Y"),
        },
        "resumo": {
            "frequencia_30d": frequencia_30d,
            "total_treinos": total_treinos,
            "conquistas_total": len(conquistas_list),
        },
        "avaliacoes": avaliacoes_list,
        "progresso_exercicios": progresso_exercicios,
        "conquistas": conquistas_list,
        "gerado_em": agora.strftime("%d/%m/%Y às %H:%M"),
    }
