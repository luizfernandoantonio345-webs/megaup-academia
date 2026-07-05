"""
Rotas de billing da plataforma GymPro.
Personal trainer paga pelo uso da plataforma via Stripe.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Aluno, Tenant, User
from app.services.billing import (
    PLANOS,
    checar_limite_alunos,
    criar_checkout_session,
    criar_portal_session,
    get_info_plano,
    get_plano_efetivo,
    processar_webhook,
)

router = APIRouter()


def _get_tenant(current_user: User, db: Session) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    if not tenant:
        raise HTTPException(404, "Tenant não encontrado")
    return tenant


@router.get("/status")
def billing_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna status do plano atual do tenant."""
    tenant = _get_tenant(current_user, db)
    info = get_info_plano(tenant)

    alunos_atuais = db.query(Aluno).filter(Aluno.tenant_id == tenant.id).count()

    from app.services.billing import _stripe_disponivel
    return {
        **info,
        "alunos_atuais": alunos_atuais,
        "stripe_customer_id": getattr(tenant, "stripe_customer_id", None),
        "tem_assinatura": getattr(tenant, "stripe_subscription_id", None) is not None,
        "stripe_configurado": _stripe_disponivel(),
    }


@router.post("/checkout")
def criar_checkout(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cria sessão de checkout Stripe. Body: {plano: 'starter'|'pro'|'elite'}"""
    plano = body.get("plano", "")
    if plano not in {"starter", "pro", "elite"}:
        raise HTTPException(400, "Plano inválido")

    tenant = _get_tenant(current_user, db)
    url = criar_checkout_session(tenant, plano, db)
    return {"checkout_url": url}


@router.post("/portal")
def portal_assinatura(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna URL do Stripe Customer Portal para gerenciar assinatura."""
    tenant = _get_tenant(current_user, db)
    url = criar_portal_session(tenant, db)
    return {"portal_url": url}


@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Endpoint de webhook do Stripe. Não requer autenticação JWT."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    processar_webhook(payload, sig, db)
    return {"received": True}


@router.get("/planos")
def listar_planos():
    """Retorna todos os planos disponíveis (público)."""
    return [
        {
            "tier": tier,
            **info,
            "features": _features(tier),
        }
        for tier, info in PLANOS.items()
        if tier not in ("trial", "free") or tier == "free"
    ]


def _features(tier: str) -> list[str]:
    base = [
        "Treinos ilimitados por aluno",
        "Analytics de progressão de carga",
        "Gamificação (streak, conquistas)",
        "App mobile (PWA)",
        "Suporte por e-mail",
    ]
    extra = {
        "starter": [
            "Até 15 alunos",
            "Relatórios básicos",
            "Convites por link",
        ],
        "pro": [
            "Até 50 alunos",
            "Financeiro e cobranças",
            "Relatórios avançados por aluno",
            "Suporte prioritário",
        ],
        "elite": [
            "Alunos ilimitados",
            "Multi-personal (equipe)",
            "White-label (em breve)",
            "API de integração (em breve)",
            "Gerente de conta dedicado",
        ],
    }
    return (extra.get(tier, [])) + base
