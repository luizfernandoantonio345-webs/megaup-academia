"""
Serviço de billing da plataforma MegaUp.

Modelo de negócio:
  - Personal trainer paga pelo MegaUp (B2B SaaS)
  - Planos por número de alunos ativos
  - Trial gratuito de 14 dias com acesso Pro
  - Stripe para cobrança recorrente

Planos:
  trial   → 14 dias grátis, até 50 alunos
  free    → R$ 0/mês,   até 3 alunos   (trial expirado sem assinatura)
  starter → R$ 49/mês,  até 15 alunos
  pro     → R$ 129/mês, até 50 alunos
  elite   → R$ 249/mês, ilimitado
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# ── Definição de planos ────────────────────────────────────────────────────────
PLANOS: dict[str, dict] = {
    "trial":   {"label": "Trial",   "max_alunos": 50,   "preco": 0,   "preco_anual": 0},
    "free":    {"label": "Free",    "max_alunos": 3,    "preco": 0,   "preco_anual": 0},
    "starter": {"label": "Starter", "max_alunos": 15,   "preco": 49,  "preco_anual": 470},
    "pro":     {"label": "Pro",     "max_alunos": 50,   "preco": 129, "preco_anual": 1240},
    "elite":   {"label": "Elite",   "max_alunos": 9999, "preco": 249, "preco_anual": 2390},
}

TIERS_PAGOS = {"starter", "pro", "elite"}


def get_plano_efetivo(tenant) -> str:
    """Retorna o plano real do tenant, considerando expiração do trial."""
    plano = getattr(tenant, "plan_tier", None) or "trial"
    if plano == "trial":
        trial_end = getattr(tenant, "trial_ends_at", None)
        if trial_end and datetime.utcnow() > trial_end:
            return "free"
    return plano


def get_info_plano(tenant) -> dict:
    """Retorna dict com informações completas do plano atual."""
    plano = get_plano_efetivo(tenant)
    info = PLANOS.get(plano, PLANOS["free"]).copy()
    info["tier"] = plano

    trial_end = getattr(tenant, "trial_ends_at", None)
    if trial_end and getattr(tenant, "plan_tier", "trial") == "trial":
        dias_rest = (trial_end - datetime.utcnow()).days
        info["trial_dias_restantes"] = max(0, dias_rest)
        info["trial_ends_at"] = trial_end.isoformat()
    else:
        info["trial_dias_restantes"] = None
        info["trial_ends_at"] = None

    return info


def checar_limite_alunos(tenant_id: int, db: Session) -> None:
    """Lança HTTP 402 se o tenant atingiu o limite de alunos do plano."""
    from app.models import Tenant, Aluno

    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        return

    plano = get_plano_efetivo(tenant)
    limite = PLANOS.get(plano, PLANOS["free"])["max_alunos"]
    atual = db.query(Aluno).filter(Aluno.tenant_id == tenant_id).count()

    if atual >= limite:
        label = PLANOS.get(plano, PLANOS["free"])["label"]
        raise HTTPException(
            status_code=402,
            detail={
                "message": f"Limite de {limite} aluno{'s' if limite != 1 else ''} atingido no plano {label}.",
                "plano": plano,
                "limite": limite,
                "atual": atual,
                "upgrade_required": True,
            },
        )


def inicializar_trial(tenant, db: Session) -> None:
    """Configura trial de 14 dias para um tenant recém-criado."""
    from app.models import Tenant as TenantModel

    tenant.plan_tier = "trial"
    tenant.trial_ends_at = datetime.utcnow() + timedelta(days=14)
    db.commit()


# ── Stripe ────────────────────────────────────────────────────────────────────

def _stripe_disponivel() -> bool:
    from app.core.config import settings
    return bool(settings.STRIPE_SECRET_KEY)


def _get_stripe():
    import stripe
    from app.core.config import settings
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def criar_ou_obter_customer(tenant, db: Session) -> Optional[str]:
    """Cria (ou retorna) o Stripe Customer vinculado ao tenant."""
    if not _stripe_disponivel():
        return None

    existing = getattr(tenant, "stripe_customer_id", None)
    if existing:
        return existing

    stripe = _get_stripe()
    try:
        customer = stripe.Customer.create(
            name=tenant.nome,
            metadata={"tenant_id": str(tenant.id)},
        )
        tenant.stripe_customer_id = customer.id
        db.commit()
        return customer.id
    except Exception:
        logger.exception("Erro ao criar Stripe Customer para tenant_id=%s", tenant.id)
        return None


def criar_checkout_session(tenant, plano: str, db: Session) -> str:
    """Cria uma sessão de Checkout do Stripe e retorna a URL."""
    from app.core.config import settings

    if not _stripe_disponivel():
        raise HTTPException(503, "Pagamentos online não configurados. Entre em contato.")

    if plano not in TIERS_PAGOS:
        raise HTTPException(400, f"Plano inválido: {plano}")

    stripe = _get_stripe()
    customer_id = criar_ou_obter_customer(tenant, db)

    price_map = {
        "starter": settings.STRIPE_PRICE_STARTER,
        "pro":     settings.STRIPE_PRICE_PRO,
        "elite":   settings.STRIPE_PRICE_ELITE,
    }
    price_id = price_map.get(plano)

    # Se não houver price_id configurado, usa preço inline (fallback)
    line_item = (
        {"price": price_id, "quantity": 1}
        if price_id
        else {
            "price_data": {
                "currency": "brl",
                "unit_amount": PLANOS[plano]["preco"] * 100,
                "recurring": {"interval": "month"},
                "product_data": {"name": f"MegaUp {PLANOS[plano]['label']}"},
            },
            "quantity": 1,
        }
    )

    try:
        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            line_items=[line_item],
            success_url=f"{settings.APP_URL}/dashboard?billing=success&plano={plano}",
            cancel_url=f"{settings.APP_URL}/planos?canceled=1",
            metadata={"tenant_id": str(tenant.id), "plano": plano},
            allow_promotion_codes=True,
            subscription_data={"metadata": {"tenant_id": str(tenant.id), "plano": plano}},
        )
        return session.url
    except Exception:
        logger.exception("Erro ao criar Stripe Checkout para tenant_id=%s plano=%s", tenant.id, plano)
        raise HTTPException(500, "Erro ao criar sessão de pagamento.")


def criar_portal_session(tenant, db: Session) -> str:
    """Cria uma sessão no Stripe Customer Portal (gerenciar assinatura)."""
    from app.core.config import settings

    if not _stripe_disponivel():
        raise HTTPException(503, "Portal não disponível.")

    stripe = _get_stripe()
    customer_id = criar_ou_obter_customer(tenant, db)
    if not customer_id:
        raise HTTPException(404, "Sem assinatura ativa.")

    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{settings.APP_URL}/dashboard",
        )
        return session.url
    except Exception:
        logger.exception("Erro ao criar portal para tenant_id=%s", tenant.id)
        raise HTTPException(500, "Erro ao abrir portal de assinaturas.")


def processar_webhook(payload: bytes, sig_header: str, db: Session) -> None:
    """Processa eventos Stripe recebidos via webhook."""
    from app.core.config import settings
    from app.models import Tenant

    if not _stripe_disponivel():
        return

    stripe = _get_stripe()
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(400, "Webhook inválido.")

    data = event["data"]["object"]

    if event["type"] == "checkout.session.completed":
        tenant_id = int(data["metadata"].get("tenant_id", 0))
        plano = data["metadata"].get("plano", "starter")
        _ativar_plano(tenant_id, plano, data.get("subscription"), db)

    elif event["type"] in ("customer.subscription.updated", "customer.subscription.deleted"):
        sub = data
        tenant_id_str = sub.get("metadata", {}).get("tenant_id")
        if not tenant_id_str:
            return
        tenant_id = int(tenant_id_str)
        if event["type"] == "customer.subscription.deleted" or sub.get("status") in ("canceled", "unpaid"):
            plano_anterior = sub.get("metadata", {}).get("plano", "starter")
            _ativar_plano(tenant_id, "free", None, db)
            _notificar_cancelamento(tenant_id, plano_anterior, db)
        else:
            plano = sub.get("metadata", {}).get("plano", "starter")
            _ativar_plano(tenant_id, plano, sub.get("id"), db)

    elif event["type"] == "invoice.payment_failed":
        logger.warning("Pagamento falhou: %s", data.get("customer"))


def _notificar_cancelamento(tenant_id: int, plano: str, db: Session) -> None:
    from app.models import Tenant, User, Role
    from app.core.email import enviar_cancelamento_assinatura
    try:
        personal = (
            db.query(User)
            .filter(User.tenant_id == tenant_id, User.role == Role.personal, User.ativo == True)
            .first()
        )
        if personal:
            label = PLANOS.get(plano, {}).get("label", plano.capitalize())
            enviar_cancelamento_assinatura(personal.email, personal.nome, label)
    except Exception:
        logger.exception("Falha ao enviar email de cancelamento para tenant_id=%s", tenant_id)


def _ativar_plano(tenant_id: int, plano: str, subscription_id: Optional[str], db: Session):
    from app.models import Tenant

    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        return
    tenant.plan_tier = plano
    if subscription_id:
        tenant.stripe_subscription_id = subscription_id
    db.commit()
    logger.info("Tenant %s ativado no plano %s", tenant_id, plano)

