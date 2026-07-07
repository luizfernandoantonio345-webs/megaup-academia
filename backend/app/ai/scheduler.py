"""
Tarefa assíncrona executada pelo APScheduler a cada hora.
Pré-calcula sugestões de progressão de carga com base nas execuções recentes.

Design de robustez:
- Toda exceção é capturada e logada; o scheduler nunca derruba a aplicação
- Cada sugestão individual é commitada separadamente (falha em uma não cancela as outras)
- Usa SessionLocal diretamente (não é um request FastAPI)
"""
import logging
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import joinedload

from app.core.db import SessionLocal
from app.models import ExecucaoTreino, SugestaoProgressao
from app.ai.prescricao import sugerir_ajuste_carga

logger = logging.getLogger(__name__)


def tarefa_progressao() -> None:
    """
    Varre execuções dos últimos 7 dias, agrupa por (tenant, aluno, exercício)
    e atualiza/cria sugestões de progressão de carga em SugestaoProgressao.
    Exige ao menos 3 execuções do mesmo exercício para gerar sugestão.
    """

    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=7)

        # joinedload evita N+1: carrega execucoes + itens em 2 queries em vez de 1+N
        execucoes = (
            db.query(ExecucaoTreino)
            .options(joinedload(ExecucaoTreino.itens))
            .filter(ExecucaoTreino.data >= cutoff)
            .all()
        )

        # Agrupa histórico por (tenant_id, aluno_id, exercicio_id)
        historicos: dict = defaultdict(list)
        for ex in execucoes:
            for item in ex.itens:
                key = (ex.tenant_id, ex.aluno_id, item.exercicio_id)
                historicos[key].append({
                    "data": ex.data.isoformat(),
                    "carga": item.carga_realizada,
                    "dificuldade": ex.dificuldade,
                })

        for (tenant_id, aluno_id, exercicio_id), historico in historicos.items():
            if len(historico) < 3:
                continue  # histórico insuficiente

            try:
                sugestao = sugerir_ajuste_carga(historico)

                existente = db.query(SugestaoProgressao).filter(
                    SugestaoProgressao.aluno_id == aluno_id,
                    SugestaoProgressao.exercicio_id == exercicio_id,
                    SugestaoProgressao.visto == False,
                ).first()

                if existente:
                    existente.acao = sugestao["acao"]
                    existente.carga_sugerida = sugestao.get("carga_sugerida")
                    existente.motivo = sugestao.get("motivo", "")
                    existente.gerado_em = datetime.utcnow()
                else:
                    db.add(SugestaoProgressao(
                        tenant_id=tenant_id,
                        aluno_id=aluno_id,
                        exercicio_id=exercicio_id,
                        acao=sugestao["acao"],
                        carga_sugerida=sugestao.get("carga_sugerida"),
                        motivo=sugestao.get("motivo", ""),
                    ))

                db.commit()

            except Exception:
                db.rollback()
                logger.exception(
                    "Erro ao calcular sugestão: aluno_id=%s exercicio_id=%s",
                    aluno_id,
                    exercicio_id,
                )

    except Exception:
        logger.exception("Falha geral em tarefa_progressao")
    finally:
        db.close()


def tarefa_lembretes_pagamento() -> None:
    """
    Verifica cobranças vencidas há 1–3 dias e envia e-mail de lembrete ao aluno.
    Executada diariamente via APScheduler.
    """
    from app.models import Cobranca, CobrancaStatus, Aluno, User
    from app.core.email import enviar_lembrete_pagamento

    db = SessionLocal()
    try:
        hoje = datetime.utcnow().date()
        inicio = hoje - timedelta(days=3)
        fim = hoje - timedelta(days=1)

        cobrancas = (
            db.query(Cobranca)
            .filter(
                Cobranca.status == CobrancaStatus.pendente,
                func.date(Cobranca.vencimento) >= inicio,
                func.date(Cobranca.vencimento) <= fim,
            )
            .all()
        )

        for c in cobrancas:
            try:
                aluno = db.query(Aluno).filter(Aluno.id == c.aluno_id).first()
                personal = db.query(User).filter(User.id == aluno.personal_id).first() if aluno else None
                if aluno and aluno.email and personal:
                    enviar_lembrete_pagamento(
                        aluno_nome=aluno.nome,
                        aluno_email=aluno.email,
                        personal_nome=personal.nome,
                        valor=c.valor,
                        vencimento=c.vencimento,
                    )
            except Exception:
                logger.exception("Erro ao enviar lembrete para cobranca_id=%s", c.id)

    except Exception:
        logger.exception("Falha geral em tarefa_lembretes_pagamento")
    finally:
        db.close()
