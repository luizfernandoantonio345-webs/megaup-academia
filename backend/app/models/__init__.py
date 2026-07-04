"""
Modelos do banco — multi-tenant via tenant_id.
"""
import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, Index,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core.db import Base


class Role(str, enum.Enum):
    admin_academia = "admin_academia"
    personal = "personal"
    aluno = "aluno"


class Tenant(Base):
    """Academia (ou personal autônomo = tenant de 1 pessoa)."""
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    # Billing (plataforma GymPro)
    plan_tier = Column(String, default="trial")          # trial/free/starter/pro/elite
    trial_ends_at = Column(DateTime, nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    # Referral
    referral_code = Column(String, nullable=True, unique=True)
    referred_by = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    role = Column(Enum(Role), nullable=False)
    cref = Column(String, nullable=True)  # só personal
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)


class Aluno(Base):
    __tablename__ = "alunos"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    personal_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # login do aluno
    nome = Column(String, nullable=False)
    email = Column(String, nullable=False)
    objetivo = Column(String, nullable=True)
    anamnese = Column(Text, nullable=True)  # JSON serializado — dado sensível (LGPD)
    streak_atual = Column(Integer, default=0)
    streak_recorde = Column(Integer, default=0)
    criado_em = Column(DateTime, default=datetime.utcnow)


class Convite(Base):
    """Token de convite gerado pelo personal para vincular um aluno."""
    __tablename__ = "convites"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    personal_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    email_aluno = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    expira_em = Column(DateTime, nullable=False)
    usado = Column(Boolean, default=False)

    __table_args__ = (Index("ix_convites_token", "token"),)


class Exercicio(Base):
    __tablename__ = "exercicios"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)  # null = global
    nome = Column(String, nullable=False)
    grupo_muscular = Column(String, nullable=True)
    equipamento = Column(String, nullable=True)
    video_url = Column(String, nullable=True)


class Treino(Base):
    __tablename__ = "treinos"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    nome = Column(String, nullable=False)
    # Convenção de dia_semana: segunda, terca, quarta, quinta, sexta, sabado, domingo
    dia_semana = Column(String, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    itens = relationship("TreinoItem", back_populates="treino")


class TreinoItem(Base):
    __tablename__ = "treino_itens"
    id = Column(Integer, primary_key=True)
    treino_id = Column(Integer, ForeignKey("treinos.id"), nullable=False)
    exercicio_id = Column(Integer, ForeignKey("exercicios.id"), nullable=False)
    series = Column(Integer, default=3)
    repeticoes = Column(String, default="12")  # string p/ "8-12"
    carga = Column(Float, nullable=True)
    descanso_seg = Column(Integer, default=60)
    ordem = Column(Integer, default=0)
    treino = relationship("Treino", back_populates="itens")


class ExecucaoTreino(Base):
    """Registro de quando o aluno executou um treino."""
    __tablename__ = "execucoes"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    treino_id = Column(Integer, ForeignKey("treinos.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    data = Column(DateTime, default=datetime.utcnow)
    dificuldade = Column(String, nullable=True)  # facil / ok / dificil
    comentario = Column(Text, nullable=True)
    itens = relationship("ExecucaoItem", back_populates="execucao")


class ExecucaoItem(Base):
    """Carga e volume realizados por exercício em uma execução específica."""
    __tablename__ = "execucao_itens"
    id = Column(Integer, primary_key=True)
    execucao_id = Column(Integer, ForeignKey("execucoes.id"), nullable=False)
    # nullable: o item do treino pode ter sido deletado depois da execução
    treino_item_id = Column(Integer, ForeignKey("treino_itens.id"), nullable=True)
    exercicio_id = Column(Integer, ForeignKey("exercicios.id"), nullable=False)
    carga_realizada = Column(Float, nullable=True)
    repeticoes_realizadas = Column(String, nullable=True)
    series_realizadas = Column(Integer, nullable=True)
    execucao = relationship("ExecucaoTreino", back_populates="itens")


class SugestaoProgressao(Base):
    """
    Sugestão de progressão de carga pré-calculada pelo scheduler.
    Consultada pelo personal no dashboard (badge 'Sugestão da IA').
    """
    __tablename__ = "sugestoes_progressao"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    exercicio_id = Column(Integer, ForeignKey("exercicios.id"), nullable=False)
    acao = Column(String, nullable=False)  # aumentar / manter / reduzir
    carga_sugerida = Column(Float, nullable=True)
    motivo = Column(Text, nullable=True)
    gerado_em = Column(DateTime, default=datetime.utcnow)
    visto = Column(Boolean, default=False)


class Conquista(Base):
    """Badge desbloqueado automaticamente quando o aluno atinge um marco."""
    __tablename__ = "conquistas"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    codigo = Column(String, nullable=False)  # ex: "streak_7", "primeiro_treino"
    desbloqueado_em = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("aluno_id", "codigo", name="uq_conquista_aluno_codigo"),
    )


class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    data = Column(DateTime, default=datetime.utcnow)
    peso = Column(Float, nullable=True)
    percentual_gordura = Column(Float, nullable=True)
    medidas = Column(Text, nullable=True)  # JSON


# ---------------------------------------------------------------------------
# FASE 9 — Pagamentos e Multi-tenant Academia
# ---------------------------------------------------------------------------

class PlanoStatus(str, enum.Enum):
    ativo = "ativo"
    inativo = "inativo"
    trial = "trial"


class CobrancaStatus(str, enum.Enum):
    pendente = "pendente"
    pago = "pago"
    vencido = "vencido"
    cancelado = "cancelado"


class PlanoAluno(Base):
    """
    Plano de cobrança configurado pelo personal para um aluno.
    Ex.: 3x/semana R$250/mês.
    """
    __tablename__ = "planos_aluno"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False, unique=True)
    personal_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nome = Column(String, nullable=False)          # ex: "Plano Premium 3x"
    valor = Column(Float, nullable=False)          # R$ por mês
    dia_vencimento = Column(Integer, default=10)   # dia do mês
    status = Column(Enum(PlanoStatus), default=PlanoStatus.ativo)
    criado_em = Column(DateTime, default=datetime.utcnow)
    cobranças = relationship("Cobranca", back_populates="plano")


class Cobranca(Base):
    """
    Registro de cobrança mensal. O personal marca como pago manualmente
    ou via webhook do gateway (Asaas).
    """
    __tablename__ = "cobrancas"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    plano_id = Column(Integer, ForeignKey("planos_aluno.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    valor = Column(Float, nullable=False)
    vencimento = Column(DateTime, nullable=False)
    pago_em = Column(DateTime, nullable=True)
    status = Column(Enum(CobrancaStatus), default=CobrancaStatus.pendente)
    # Integração Asaas
    asaas_id = Column(String, nullable=True)       # ID da cobrança no Asaas
    link_pagamento = Column(String, nullable=True)  # link PIX/boleto
    plano = relationship("PlanoAluno", back_populates="cobranças")


class PersonalTenant(Base):
    """
    Associa um personal (user) a um tenant de academia.
    Permite multi-personal: vários personais sob um admin_academia.
    """
    __tablename__ = "personal_tenants"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("tenant_id", "user_id", name="uq_personal_tenant"),
    )


class ProgramaTreino(Base):
    """Programa de periodização criado pelo personal."""
    __tablename__ = "programas_treino"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    personal_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nome = Column(String, nullable=False)
    objetivo = Column(String, nullable=True)      # hipertrofia/forca/emagrecimento/condicionamento
    semanas_total = Column(Integer, default=12)
    fases = Column(Text, nullable=True)           # JSON array de fases
    descricao = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    aplicacoes = relationship("AplicacaoPrograma", back_populates="programa")


class AplicacaoPrograma(Base):
    """Vinculação de um programa a um aluno (com data de início)."""
    __tablename__ = "aplicacoes_programa"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    programa_id = Column(Integer, ForeignKey("programas_treino.id"), nullable=False)
    iniciado_em = Column(DateTime, nullable=False)
    ativo = Column(Boolean, default=True)
    programa = relationship("ProgramaTreino", back_populates="aplicacoes")


class Mensagem(Base):
    """Chat entre personal e aluno."""
    __tablename__ = "mensagens"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    remetente_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    texto = Column(Text, nullable=False)
    lido = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_mensagens_aluno", "aluno_id", "criado_em"),
    )
