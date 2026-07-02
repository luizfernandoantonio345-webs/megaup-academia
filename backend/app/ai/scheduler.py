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

        execucoes = (
            db.query(ExecucaoTreino)
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
