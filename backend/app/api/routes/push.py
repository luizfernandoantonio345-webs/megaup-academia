"""Web Push notifications via VAPID — subscribe, unsubscribe, send."""
import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import PushSubscription, User

router = APIRouter()
logger = logging.getLogger(__name__)


class SubscribeBody(BaseModel):
    endpoint: str
    p256dh: str
    auth: str


@router.get("/vapid-public-key")
def get_vapid_public_key():
    """Retorna a chave pública VAPID para o frontend assinar subscriptions."""
    key = getattr(settings, "VAPID_PUBLIC_KEY", "")
    if not key:
        raise HTTPException(503, "Push notifications não configurado (VAPID_PUBLIC_KEY ausente)")
    return {"public_key": key}


@router.post("/subscribe", status_code=201)
def subscribe(
    body: SubscribeBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra ou atualiza subscription de push do usuário atual."""
    existing = db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.endpoint == body.endpoint,
    ).first()

    if existing:
        existing.p256dh = body.p256dh
        existing.auth = body.auth
    else:
        db.add(PushSubscription(
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            endpoint=body.endpoint,
            p256dh=body.p256dh,
            auth=body.auth,
        ))

    db.commit()
    return {"ok": True}


@router.delete("/subscribe")
def unsubscribe(
    body: SubscribeBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove subscription de push."""
    db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.endpoint == body.endpoint,
    ).delete()
    db.commit()
    return {"ok": True}


def _enviar_push_para_subscription(sub: PushSubscription, titulo: str, corpo: str, url: str = "/") -> bool:
    """
    Tenta enviar push notification para uma subscription.
    Retorna False se a subscription expirou (410/404 da plataforma).
    Requer pywebpush e variáveis VAPID_PRIVATE_KEY + VAPID_PUBLIC_KEY.
    """
    vapid_private = getattr(settings, "VAPID_PRIVATE_KEY", "")
    vapid_public = getattr(settings, "VAPID_PUBLIC_KEY", "")
    if not vapid_private or not vapid_public:
        return False
    try:
        from pywebpush import webpush, WebPushException  # type: ignore
        webpush(
            subscription_info={
                "endpoint": sub.endpoint,
                "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
            },
            data=json.dumps({"titulo": titulo, "corpo": corpo, "url": url}),
            vapid_private_key=vapid_private,
            vapid_claims={"sub": f"mailto:{settings.EMAIL_FROM or 'noreply@gympro.app'}"},
        )
        return True
    except Exception as exc:
        err = str(exc)
        if "410" in err or "404" in err:
            return False   # subscription expirada — pode ser removida
        logger.warning("Push falhou para endpoint=%s: %s", sub.endpoint[:40], exc)
        return False
