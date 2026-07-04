import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.api.deps import get_current_user
from app.models import Tenant, User

router = APIRouter()


def _get_or_create_code(tenant: Tenant, db: Session) -> str:
    if not tenant.referral_code:
        tenant.referral_code = uuid.uuid4().hex[:10].upper()
        db.commit()
        db.refresh(tenant)
    return tenant.referral_code


@router.get("/status")
def referral_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    code = _get_or_create_code(tenant, db)

    indicados = db.query(Tenant).filter(Tenant.referred_by == code).count()
    return {
        "referral_code": code,
        "referral_link": f"https://fitsaas-frontend.onrender.com/registrar?ref={code}",
        "total_indicados": indicados,
        "recompensa_descricao": "1 mês grátis no plano Starter para cada 3 indicações convertidas",
    }
