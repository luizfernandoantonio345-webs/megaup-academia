import hashlib
import hmac
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.deps import get_current_user, require_personal
from app.models import CheckIn, User

router = APIRouter()


def _daily_token(tenant_id: int) -> str:
    key = settings.SECRET_KEY.encode()
    msg = f"{date.today().isoformat()}:{tenant_id}".encode()
    return hmac.new(key, msg, digestmod=hashlib.sha256).hexdigest()[:16]


@router.get("/qr-data")
def qr_data(current_user: User = Depends(require_personal)):
    """Token diário para o personal exibir o QR code. O frontend monta a URL."""
    token = _daily_token(current_user.tenant_id)
    return {
        "token": token,
        "valido_ate": f"{date.today().isoformat()}T23:59:59",
    }


class CheckInBody(BaseModel):
    token: str


@router.post("/")
def fazer_checkin(
    body: CheckInBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aluno faz check-in verificando o token do dia."""
    expected = _daily_token(current_user.tenant_id)
    if not hmac.compare_digest(body.token, expected):
        raise HTTPException(status_code=400, detail="QR inválido ou expirado. Peça ao seu personal um novo QR.")

    today = date.today()
    existing = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        func.date(CheckIn.data) == today,
    ).first()
    if existing:
        return {"ok": True, "msg": "Você já fez check-in hoje! 💪", "novo": False}

    ci = CheckIn(tenant_id=current_user.tenant_id, user_id=current_user.id, data=datetime.utcnow())
    db.add(ci)
    db.commit()
    return {"ok": True, "msg": "Check-in feito! Bom treino! 💪", "novo": True}


@router.get("/meus")
def meus_checkins(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Histórico de check-ins do aluno logado."""
    rows = (
        db.query(CheckIn)
        .filter(CheckIn.user_id == current_user.id)
        .order_by(CheckIn.data.desc())
        .limit(limit)
        .all()
    )
    return [{"id": c.id, "data": c.data.isoformat()} for c in rows]
