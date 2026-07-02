"""
FASE 9 — Pagamentos.

Endpoints:
  POST   /pagamentos/planos/            personal cria plano para aluno
  GET    /pagamentos/planos/            lista planos do tenant
  DELETE /pagamentos/planos/{id}        inativa plano
  POST   /pagamentos/cobrancas/         gera cobrança (com integração Asaas opcional)
  GET    /pagamentos/cobrancas/         lista cobranças do tenant
  PATCH  /pagamentos/cobrancas/{id}/pagar  marca como pago
  GET    /pagamentos/resumo             resumo financeiro do tenant
  POST   /pagamentos/webhook/asaas      webhook do Asaas (pós-pagamento automático)
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Aluno, Cobranca, CobrancaStatus, PlanoAluno, PlanoStatus, User
from app.schemas.pagamentos import (
    CobrancaCreate,
    CobrancaResponse,
    MarcarPagoRequest,
    PlanoAlunoCreate,
    PlanoAlunoResponse,
    ResumoFinanceiroResponse,
)
from app.services.asaas import criar_cobranca_pix

router = APIRouter()


def _assert_personal(user: User):
    if user.role.value not in ("personal", "admin_academia"):
        raise HTTPException(403, "Apenas personais podem gerenciar pagamentos")


def _get_plano(plano_id: int, tenant_id: int, db: Session) -> PlanoAluno:
    plano = db.query(PlanoAluno).filter(
        PlanoAluno.id == plano_id,
        PlanoAluno.tenant_id == tenant_id,
    ).first()
    if not plano:
        raise HTTPException(404, "Plano não encontrado")
    return plano


# ---------------------------------------------------------------------------
# Planos
# ---------------------------------------------------------------------------

@router.post("/planos/", response_model=PlanoAlunoResponse, status_code=201)
def criar_plano(
    payload: PlanoAlunoCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_personal(user)

    aluno = db.query(Aluno).filter(
        Aluno.id == payload.aluno_id,
        Aluno.tenant_id == user.tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")

    existente = db.query(PlanoAluno).filter(
        PlanoAluno.aluno_id == payload.aluno_id,
        PlanoAluno.status == PlanoStatus.ativo,
    ).first()
    if existente:
        raise HTTPException(409, "Aluno já possui plano ativo")

    plano = PlanoAluno(
        tenant_id=user.tenant_id,
        aluno_id=payload.aluno_id,
        personal_id=user.id,
        nome=payload.nome,
        valor=payload.valor,
        dia_vencimento=payload.dia_vencimento,
        status=PlanoStatus.ativo,
    )
    db.add(plano)
    db.commit()
    db.refresh(plano)
    return plano


@router.get("/planos/", response_model=list[PlanoAlunoResponse])
def listar_planos(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_personal(user)
    planos = db.query(PlanoAluno).filter(PlanoAluno.tenant_id == user.tenant_id).all()
    return planos


@router.delete("/planos/{plano_id}", status_code=204)
def inativar_plano(
    plano_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_personal(user)
    plano = _get_plano(plano_id, user.tenant_id, db)
    plano.status = PlanoStatus.inativo
    db.commit()


# ---------------------------------------------------------------------------
# Cobranças
# ---------------------------------------------------------------------------

@router.post("/cobrancas/", response_model=CobrancaResponse, status_code=201)
def criar_cobranca(
    payload: CobrancaCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_personal(user)
    plano = _get_plano(payload.plano_id, user.tenant_id, db)

    aluno = db.query(Aluno).filter(Aluno.id == plano.aluno_id).first()

    resultado_asaas = criar_cobranca_pix(
        nome_aluno=aluno.nome,
        email_aluno=aluno.email,
        cpf_aluno=None,
        valor=plano.valor,
        vencimento=payload.vencimento,
    )

    cobranca = Cobranca(
        tenant_id=user.tenant_id,
        plano_id=plano.id,
        aluno_id=aluno.id,
        valor=plano.valor,
        vencimento=payload.vencimento,
        status=CobrancaStatus.pendente,
        asaas_id=resultado_asaas.get("asaas_id"),
        link_pagamento=resultado_asaas.get("link_pagamento"),
    )
    db.add(cobranca)
    db.commit()
    db.refresh(cobranca)
    return cobranca


@router.get("/cobrancas/", response_model=list[CobrancaResponse])
def listar_cobrancas(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_personal(user)
    return db.query(Cobranca).filter(Cobranca.tenant_id == user.tenant_id).all()


@router.patch("/cobrancas/{cobranca_id}/pagar", response_model=CobrancaResponse)
def marcar_pago(
    cobranca_id: int,
    payload: MarcarPagoRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_personal(user)
    cobranca = db.query(Cobranca).filter(
        Cobranca.id == cobranca_id,
        Cobranca.tenant_id == user.tenant_id,
    ).first()
    if not cobranca:
        raise HTTPException(404, "Cobrança não encontrada")
    if cobranca.status == CobrancaStatus.pago:
        raise HTTPException(409, "Cobrança já está paga")

    cobranca.pago_em = payload.pago_em or datetime.utcnow()
    cobranca.status = CobrancaStatus.pago
    db.commit()
    db.refresh(cobranca)
    return cobranca


# ---------------------------------------------------------------------------
# Resumo financeiro
# ---------------------------------------------------------------------------

@router.get("/resumo", response_model=ResumoFinanceiroResponse)
def resumo_financeiro(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_personal(user)

    planos_ativos = db.query(PlanoAluno).filter(
        PlanoAluno.tenant_id == user.tenant_id,
        PlanoAluno.status == PlanoStatus.ativo,
    ).all()

    receita = sum(p.valor for p in planos_ativos)

    agora = datetime.utcnow()
    vencidas = db.query(Cobranca).filter(
        Cobranca.tenant_id == user.tenant_id,
        Cobranca.status == CobrancaStatus.pendente,
        Cobranca.vencimento < agora,
    ).all()

    proximas = (
        db.query(Cobranca)
        .filter(
            Cobranca.tenant_id == user.tenant_id,
            Cobranca.status == CobrancaStatus.pendente,
            Cobranca.vencimento >= agora,
        )
        .order_by(Cobranca.vencimento)
        .limit(10)
        .all()
    )

    return ResumoFinanceiroResponse(
        total_alunos_com_plano=len(planos_ativos),
        receita_mensal_prevista=receita,
        inadimplentes=len(vencidas),
        valor_inadimplente=sum(c.valor for c in vencidas),
        proximas_cobrancas=proximas,
    )


# ---------------------------------------------------------------------------
# Webhook Asaas
# ---------------------------------------------------------------------------

@router.post("/webhook/asaas", status_code=200)
async def webhook_asaas(request: Request, db: Session = Depends(get_db)):
    """
    Recebe notificação de pagamento do Asaas e marca cobrança como paga.
    Produção: validar assinatura HMAC (header asaas-access-token) antes de processar.
    """
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(400, "Body inválido")

    event = data.get("event", "")
    payment = data.get("payment", {})
    asaas_id = payment.get("id")

    if event not in ("PAYMENT_RECEIVED", "PAYMENT_CONFIRMED") or not asaas_id:
        return {"ok": True, "processado": False}

    cobranca = db.query(Cobranca).filter(Cobranca.asaas_id == asaas_id).first()
    if cobranca and cobranca.status != CobrancaStatus.pago:
        cobranca.pago_em = datetime.utcnow()
        cobranca.status = CobrancaStatus.pago
        db.commit()

    return {"ok": True, "processado": bool(cobranca)}
