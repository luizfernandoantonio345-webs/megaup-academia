"""
Sprint H — Notificações & Retenção
Prefix: /notificacoes
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.api.deps import get_current_user
from app.models import Aluno, ExecucaoTreino, Mensagem, User

router = APIRouter()


@router.get("/alunos-inativos")
def alunos_inativos(
    dias: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna alunos sem treino registrado nos últimos N dias."""
    tid = current_user.tenant_id
    corte = datetime.utcnow() - timedelta(days=dias)

    # IDs dos alunos que treinaram dentro do período
    ativos_ids = (
        db.query(ExecucaoTreino.aluno_id)
        .filter(ExecucaoTreino.tenant_id == tid, ExecucaoTreino.data >= corte)
        .distinct()
        .subquery()
    )

    inativos = (
        db.query(Aluno)
        .filter(
            Aluno.tenant_id == tid,
            ~Aluno.id.in_(ativos_ids),
        )
        .order_by(Aluno.nome)
        .all()
    )

    resultado = []
    for a in inativos:
        ultimo = (
            db.query(func.max(ExecucaoTreino.data))
            .filter(ExecucaoTreino.aluno_id == a.id)
            .scalar()
        )
        resultado.append({
            "id": a.id,
            "nome": a.nome,
            "email": a.email,
            "streak_atual": a.streak_atual,
            "ultimo_treino": ultimo.strftime("%d/%m/%Y") if ultimo else None,
            "dias_inativo": (datetime.utcnow() - ultimo).days if ultimo else None,
        })

    return {
        "total": len(resultado),
        "dias_corte": dias,
        "alunos": resultado,
    }


@router.post("/nudge/{aluno_id}")
def enviar_nudge(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Envia uma mensagem de incentivo via chat ao aluno inativo."""
    aluno = db.query(Aluno).filter(
        Aluno.id == aluno_id,
        Aluno.tenant_id == current_user.tenant_id,
    ).first()
    if not aluno:
        from fastapi import HTTPException
        raise HTTPException(404, "Aluno não encontrado")

    texto = (
        f"Oi {aluno.nome.split()[0]}! 👋 "
        "Percebi que faz um tempo que você não registra um treino. "
        "Qualquer dúvida ou dificuldade, estou aqui para ajudar. Bora voltar! 💪"
    )
    msg = Mensagem(
        tenant_id=current_user.tenant_id,
        aluno_id=aluno_id,
        remetente_id=current_user.id,
        texto=texto,
        lido=False,
    )
    db.add(msg)
    db.commit()
    return {"ok": True, "mensagem": texto}


@router.get("/resumo")
def resumo_notificacoes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Contagens para o bell icon no header."""
    tid = current_user.tenant_id
    corte_7 = datetime.utcnow() - timedelta(days=7)

    ativos_ids = (
        db.query(ExecucaoTreino.aluno_id)
        .filter(ExecucaoTreino.tenant_id == tid, ExecucaoTreino.data >= corte_7)
        .distinct()
        .subquery()
    )
    inativos = (
        db.query(func.count(Aluno.id))
        .filter(Aluno.tenant_id == tid, ~Aluno.id.in_(ativos_ids))
        .scalar() or 0
    )
    return {"alunos_inativos": inativos}
