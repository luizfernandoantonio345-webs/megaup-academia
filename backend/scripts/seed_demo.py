"""
Script de seed de dados de demonstração.

Cria:
  - 1 personal trainer (demo@fitsaas.com / demo1234)
  - 3 alunos com treinos completos e execuções históricas
  - Exercícios globais (não vinculados a tenant)
  - Execuções suficientes para IA gerar sugestões

Uso:
  cd backend
  python scripts/seed_demo.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta
from passlib.context import CryptContext
from app.core.db import Base, SessionLocal
from app.models import (
    Tenant, User, Role, Aluno, Exercicio, Treino, TreinoItem,
    ExecucaoTreino, ExecucaoItem,
)
from sqlalchemy import create_engine
from app.core.config import settings

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_senha(s): return pwd_ctx.hash(s)

def seed():
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("🌱 Iniciando seed de demonstração...")

    # Tenant + personal
    tenant = Tenant(nome="Academia Demo FitSaaS")
    db.add(tenant); db.flush()

    personal = User(
        tenant_id=tenant.id,
        nome="João Demo",
        email="demo@fitsaas.com",
        senha_hash=hash_senha("demo1234"),
        role=Role.personal,
    )
    db.add(personal); db.flush()
    print(f"  ✓ Personal criado: demo@fitsaas.com / demo1234 (tenant_id={tenant.id})")

    # Exercícios globais
    exercicios_data = [
        ("Supino Reto com Barra", "Peito", "barra"),
        ("Supino Inclinado com Halteres", "Peito", "halteres"),
        ("Crucifixo", "Peito", "halteres"),
        ("Agachamento Livre", "Pernas", "barra"),
        ("Leg Press 45°", "Pernas", "máquina"),
        ("Cadeira Extensora", "Pernas", "máquina"),
        ("Puxada Frente", "Costas", "polia"),
        ("Remada Curvada", "Costas", "barra"),
        ("Desenvolvimento com Halteres", "Ombros", "halteres"),
        ("Elevação Lateral", "Ombros", "halteres"),
        ("Rosca Direta", "Bíceps", "barra"),
        ("Tríceps Testa", "Tríceps", "barra"),
        ("Panturrilha em Pé", "Pernas", "máquina"),
        ("Abdominal Crunch", "Core", "peso corporal"),
        ("Prancha", "Core", "peso corporal"),
    ]
    exercicios = []
    for nome, grupo, equip in exercicios_data:
        e = Exercicio(nome=nome, grupo_muscular=grupo, equipamento=equip)
        db.add(e); exercicios.append(e)
    db.flush()
    print(f"  ✓ {len(exercicios)} exercícios globais criados")

    # Helper
    ex_id = lambda nome: next(e.id for e in exercicios if e.nome == nome)

    # --- Aluno 1: Carlos (treino de peito + pernas, 5 semanas de histórico)
    carlos_user = User(
        tenant_id=tenant.id, nome="Carlos Silva",
        email="carlos@demo.com", senha_hash=hash_senha("aluno123"), role=Role.aluno,
    )
    db.add(carlos_user); db.flush()

    carlos = Aluno(
        tenant_id=tenant.id, personal_id=personal.id, user_id=carlos_user.id,
        nome="Carlos Silva", email="carlos@demo.com",
        objetivo="Ganho de massa muscular",
        streak_atual=5, streak_recorde=12,
    )
    db.add(carlos); db.flush()

    treino_a = Treino(tenant_id=tenant.id, aluno_id=carlos.id, nome="Treino A — Peito/Tríceps", dia_semana="segunda")
    treino_b = Treino(tenant_id=tenant.id, aluno_id=carlos.id, nome="Treino B — Costas/Bíceps", dia_semana="quarta")
    treino_c = Treino(tenant_id=tenant.id, aluno_id=carlos.id, nome="Treino C — Pernas", dia_semana="sexta")
    db.add_all([treino_a, treino_b, treino_c]); db.flush()

    itens_a = [
        TreinoItem(treino_id=treino_a.id, exercicio_id=ex_id("Supino Reto com Barra"), series=4, repeticoes="10", carga=60.0, ordem=1),
        TreinoItem(treino_id=treino_a.id, exercicio_id=ex_id("Crucifixo"), series=3, repeticoes="12", carga=14.0, ordem=2),
        TreinoItem(treino_id=treino_a.id, exercicio_id=ex_id("Tríceps Testa"), series=3, repeticoes="12", carga=30.0, ordem=3),
    ]
    itens_b = [
        TreinoItem(treino_id=treino_b.id, exercicio_id=ex_id("Puxada Frente"), series=4, repeticoes="10", carga=50.0, ordem=1),
        TreinoItem(treino_id=treino_b.id, exercicio_id=ex_id("Remada Curvada"), series=3, repeticoes="12", carga=40.0, ordem=2),
        TreinoItem(treino_id=treino_b.id, exercicio_id=ex_id("Rosca Direta"), series=3, repeticoes="12", carga=25.0, ordem=3),
    ]
    itens_c = [
        TreinoItem(treino_id=treino_c.id, exercicio_id=ex_id("Agachamento Livre"), series=4, repeticoes="12", carga=80.0, ordem=1),
        TreinoItem(treino_id=treino_c.id, exercicio_id=ex_id("Leg Press 45°"), series=3, repeticoes="15", carga=120.0, ordem=2),
        TreinoItem(treino_id=treino_c.id, exercicio_id=ex_id("Panturrilha em Pé"), series=4, repeticoes="20", carga=60.0, ordem=3),
    ]
    db.add_all(itens_a + itens_b + itens_c); db.flush()

    # Histórico: 5 semanas de execuções (seg, qua, sex)
    base_date = datetime.utcnow() - timedelta(days=35)
    cargas_supino = [55, 57.5, 57.5, 60, 60]
    for semana in range(5):
        delta = semana * 7
        # Segunda - Treino A
        exec_a = ExecucaoTreino(
            tenant_id=tenant.id, treino_id=treino_a.id, aluno_id=carlos.id,
            data=base_date + timedelta(days=delta),
            dificuldade="ok" if semana < 3 else "facil",
        )
        db.add(exec_a); db.flush()
        db.add(ExecucaoItem(execucao_id=exec_a.id, exercicio_id=ex_id("Supino Reto com Barra"),
                            carga_realizada=cargas_supino[semana], repeticoes_realizadas="10", series_realizadas=4))

        # Quarta - Treino B
        exec_b = ExecucaoTreino(
            tenant_id=tenant.id, treino_id=treino_b.id, aluno_id=carlos.id,
            data=base_date + timedelta(days=delta+2), dificuldade="ok",
        )
        db.add(exec_b); db.flush()
        db.add(ExecucaoItem(execucao_id=exec_b.id, exercicio_id=ex_id("Puxada Frente"),
                            carga_realizada=45+semana*2.5, repeticoes_realizadas="10", series_realizadas=4))

        # Sexta - Treino C
        exec_c = ExecucaoTreino(
            tenant_id=tenant.id, treino_id=treino_c.id, aluno_id=carlos.id,
            data=base_date + timedelta(days=delta+4), dificuldade="facil" if semana == 4 else "ok",
        )
        db.add(exec_c); db.flush()
        db.add(ExecucaoItem(execucao_id=exec_c.id, exercicio_id=ex_id("Agachamento Livre"),
                            carga_realizada=75+semana*2, repeticoes_realizadas="12", series_realizadas=4))

    carlos.streak_atual = 5; carlos.streak_recorde = 12

    # --- Aluno 2: Ana (foco feminino)
    ana = Aluno(
        tenant_id=tenant.id, personal_id=personal.id,
        nome="Ana Oliveira", email="ana@demo.com",
        objetivo="Emagrecimento e definição",
    )
    db.add(ana); db.flush()

    treino_ana = Treino(tenant_id=tenant.id, aluno_id=ana.id, nome="Full Body", dia_semana="terca")
    db.add(treino_ana); db.flush()
    db.add_all([
        TreinoItem(treino_id=treino_ana.id, exercicio_id=ex_id("Agachamento Livre"), series=3, repeticoes="15", carga=30.0, ordem=1),
        TreinoItem(treino_id=treino_ana.id, exercicio_id=ex_id("Supino Inclinado com Halteres"), series=3, repeticoes="12", carga=10.0, ordem=2),
        TreinoItem(treino_id=treino_ana.id, exercicio_id=ex_id("Abdominal Crunch"), series=3, repeticoes="20", carga=None, ordem=3),
    ])

    # --- Aluno 3: Rafael (iniciante, 1 semana)
    rafael = Aluno(
        tenant_id=tenant.id, personal_id=personal.id,
        nome="Rafael Mendes", email="rafael@demo.com",
        objetivo="Saúde e bem-estar",
    )
    db.add(rafael); db.flush()

    treino_rafael = Treino(tenant_id=tenant.id, aluno_id=rafael.id, nome="Iniciante A", dia_semana="segunda")
    db.add(treino_rafael); db.flush()
    db.add_all([
        TreinoItem(treino_id=treino_rafael.id, exercicio_id=ex_id("Supino Reto com Barra"), series=3, repeticoes="10", carga=40.0, ordem=1),
        TreinoItem(treino_id=treino_rafael.id, exercicio_id=ex_id("Agachamento Livre"), series=3, repeticoes="12", carga=40.0, ordem=2),
        TreinoItem(treino_id=treino_rafael.id, exercicio_id=ex_id("Prancha"), series=3, repeticoes="30s", carga=None, ordem=3),
    ])

    db.commit()
    print(f"  ✓ Alunos criados: Carlos Silva, Ana Oliveira, Rafael Mendes")
    print("\n✅ Seed concluído com sucesso!")
    print("\n📝 Credenciais de acesso:")
    print("   Personal: demo@fitsaas.com / demo1234")
    print("   Aluno:    carlos@demo.com / aluno123")
    db.close()

if __name__ == "__main__":
    seed()
