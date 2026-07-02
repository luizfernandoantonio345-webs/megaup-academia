"""
Lógica de gamificação: streak de treinos e conquistas (badges).

Conquistas disponíveis:
  primeiro_treino  — primeiro treino registrado
  streak_7         — 7 dias consecutivos treinando
  streak_30        — 30 dias consecutivos treinando
  treinos_10       — 10 treinos completados
  treinos_50       — 50 treinos completados

Regra de streak: dias de calendário (UTC) com ao menos 1 execução.
O streak é considerado vivo se a última execução foi hoje ou ontem.
"""
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Aluno, Conquista, ExecucaoTreino

CONQUISTAS_DEFINICOES: dict[str, str] = {
    "primeiro_treino": "Primeiro treino registrado",
    "streak_7": "7 dias seguidos treinando",
    "streak_30": "30 dias seguidos treinando",
    "treinos_10": "10 treinos completados",
    "treinos_50": "50 treinos completados",
}


def calcular_streak(aluno_id: int, db: Session) -> int:
    """Retorna o streak atual em dias consecutivos."""
    rows = (
        db.query(ExecucaoTreino.data)
        .filter(ExecucaoTreino.aluno_id == aluno_id)
        .all()
    )
    if not rows:
        return 0

    dias = sorted({r.data.date() for r in rows}, reverse=True)
    hoje = datetime.utcnow().date()

    if dias[0] < hoje - timedelta(days=1):
        return 0

    streak = 1
    for i in range(1, len(dias)):
        if dias[i - 1] - dias[i] == timedelta(days=1):
            streak += 1
        else:
            break
    return streak


def _desbloquear_conquistas(aluno: Aluno, total_treinos: int, db: Session) -> list[Conquista]:
    """Verifica e persiste conquistas ainda não desbloqueadas. Retorna as novas."""
    candidatos: list[str] = []
    if total_treinos >= 1:
        candidatos.append("primeiro_treino")
    if (aluno.streak_atual or 0) >= 7:
        candidatos.append("streak_7")
    if (aluno.streak_atual or 0) >= 30:
        candidatos.append("streak_30")
    if total_treinos >= 10:
        candidatos.append("treinos_10")
    if total_treinos >= 50:
        candidatos.append("treinos_50")

    ja_tem = {
        c.codigo
        for c in db.query(Conquista.codigo)
        .filter(Conquista.aluno_id == aluno.id)
        .all()
    }

    novas: list[Conquista] = []
    for codigo in candidatos:
        if codigo not in ja_tem:
            c = Conquista(tenant_id=aluno.tenant_id, aluno_id=aluno.id, codigo=codigo)
            db.add(c)
            novas.append(c)

    return novas


def atualizar_gamificacao(aluno: Aluno, db: Session) -> list[Conquista]:
    """
    Recalcula streak, atualiza recorde e desbloqueia conquistas.
    Deve ser chamado após cada execução de treino (antes do commit final).
    Retorna a lista de conquistas recém-desbloqueadas.
    """
    novo_streak = calcular_streak(aluno.id, db)
    aluno.streak_atual = novo_streak
    if novo_streak > (aluno.streak_recorde or 0):
        aluno.streak_recorde = novo_streak

    total_treinos = (
        db.query(ExecucaoTreino)
        .filter(ExecucaoTreino.aluno_id == aluno.id)
        .count()
    )

    return _desbloquear_conquistas(aluno, total_treinos, db)
