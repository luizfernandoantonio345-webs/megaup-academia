import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.email import enviar_convite
from app.models import Convite, Tenant, User, Role
from app.schemas.convites import ConviteRequest, ConviteResponse, ConviteInfoResponse

router = APIRouter()

_EXPIRACAO_DIAS = 7


@router.post("/", response_model=ConviteResponse, status_code=201)
def gerar_convite(
    body: ConviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (Role.personal, Role.admin_academia):
        raise HTTPException(status_code=403, detail="Apenas personals podem convidar alunos")

    expira_em = datetime.utcnow() + timedelta(days=_EXPIRACAO_DIAS)
    token = secrets.token_urlsafe(32)

    convite = Convite(
        tenant_id=current_user.tenant_id,
        personal_id=current_user.id,
        email_aluno=body.email_aluno,
        token=token,
        expira_em=expira_em,
    )
    db.add(convite)
    db.commit()

    link = f"{settings.FRONTEND_BASE_URL}/registro?convite={token}"

    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    enviar_convite(
        email_aluno=body.email_aluno,
        nome_personal=current_user.nome,
        nome_academia=tenant.nome if tenant else "Academia",
        link=link,
    )

    return ConviteResponse(
        token=token,
        link_convite=link,
        expira_em=expira_em,
    )


@router.get("/{token}", response_model=ConviteInfoResponse)
def info_convite(token: str, db: Session = Depends(get_db)):
    """Endpoint público — o frontend consulta antes de mostrar o formulário de cadastro."""
    convite = db.query(Convite).filter(Convite.token == token).first()
    if not convite:
        raise HTTPException(status_code=404, detail="Convite não encontrado")
    if convite.usado:
        raise HTTPException(status_code=410, detail="Convite já utilizado")
    if datetime.utcnow() > convite.expira_em:
        raise HTTPException(status_code=410, detail="Convite expirado")

    personal = db.query(User).filter(User.id == convite.personal_id).first()
    from app.models import Tenant
    tenant = db.query(Tenant).filter(Tenant.id == convite.tenant_id).first()

    return ConviteInfoResponse(
        email_aluno=convite.email_aluno,
        nome_personal=personal.nome,
        nome_academia=tenant.nome,
        expira_em=convite.expira_em,
    )
