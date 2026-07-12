from datetime import datetime

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, verify_refresh_token, hash_password
from app.core.deps import get_current_user
from app.core.limiter import limiter
from app.core.config import settings
from app.models import User, Tenant, Aluno, Convite, Role
from app.schemas.auth import LoginRequest, RegisterPersonalRequest, AuthResponse, UserInfo, UpdateProfileRequest
from app.schemas.convites import AceitarConviteRequest

router = APIRouter()


def _is_prod() -> bool:
    return not settings.DATABASE_URL.startswith("sqlite")


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=_is_prod(),   # Require HTTPS in production; localhost exemption in dev
        samesite="none",     # Required for cross-origin frontend ↔ backend on Render
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/auth",        # Cookie only sent to /auth/* endpoints
    )


def _auth_response(user: User, db: Session | None = None, response: Response | None = None) -> AuthResponse:
    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value,
        "tenant_id": user.tenant_id,
    })
    if response is not None:
        _set_refresh_cookie(response, create_refresh_token(user.id))

    aluno_id = None
    if user.role == Role.aluno and db is not None:
        aluno = db.query(Aluno).filter(Aluno.user_id == user.id).first()
        if not aluno:
            aluno = db.query(Aluno).filter(
                Aluno.email == user.email,
                Aluno.tenant_id == user.tenant_id,
            ).first()
            if aluno:
                aluno.user_id = user.id
                db.commit()
        if aluno:
            aluno_id = aluno.id
    return AuthResponse(
        access_token=access_token,
        user=UserInfo(
            id=user.id,
            nome=user.nome,
            email=user.email,
            role=user.role.value,
            tenant_id=user.tenant_id,
            aluno_id=aluno_id,
        ),
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "bio": getattr(current_user, "bio", None),
        "cref": getattr(current_user, "cref", None),
        "especialidades": getattr(current_user, "especialidades", None),
        "foto_url": getattr(current_user, "foto_url", None),
        "role": current_user.role.value,
    }


@router.patch("/me")
def update_me(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.nome is not None:
        current_user.nome = body.nome.strip()
    if body.bio is not None:
        current_user.bio = body.bio
    if body.cref is not None:
        current_user.cref = body.cref
    if body.especialidades is not None:
        current_user.especialidades = body.especialidades
    if body.foto_url is not None:
        current_user.foto_url = body.foto_url
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "bio": getattr(current_user, "bio", None),
        "cref": getattr(current_user, "cref", None),
        "especialidades": getattr(current_user, "especialidades", None),
        "foto_url": getattr(current_user, "foto_url", None),
    }


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, response: Response, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.ativo == True).first()
    if not user or not verify_password(body.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return _auth_response(user, db, response)


@router.post("/refresh")
def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    """Exchange a valid refresh token cookie for a new short-lived access token."""
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token ausente")
    user_id = verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado")
    user = db.query(User).filter(User.id == user_id, User.ativo == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    # Rotate refresh token on every refresh (limits damage if a token is stolen)
    _set_refresh_cookie(response, create_refresh_token(user.id))
    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value,
        "tenant_id": user.tenant_id,
    })
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response):
    """Clear the refresh token cookie."""
    response.delete_cookie(
        key="refresh_token",
        path="/auth",
        secure=_is_prod(),
        samesite="none",
        httponly=True,
    )
    return {"ok": True}


@router.post("/registrar-personal", response_model=AuthResponse, status_code=201)
@limiter.limit("5/minute")
def registrar_personal(request: Request, response: Response, body: RegisterPersonalRequest, db: Session = Depends(get_db)):
    """Cria um tenant + um personal. Para personal autônomo, tenant = ele mesmo."""
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")

    from app.services.billing import inicializar_trial
    tenant = Tenant(nome=body.nome_academia, referred_by=body.ref_code or None)
    db.add(tenant)
    db.flush()
    inicializar_trial(tenant, db)
    user = User(
        tenant_id=tenant.id,
        nome=body.nome,
        email=body.email,
        senha_hash=hash_password(body.senha),
        role=Role.personal,
        termos_aceitos=True,
        termos_aceitos_em=datetime.utcnow(),
        email_verificado=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        import uuid
        from app.core.config import settings as _s
        token = uuid.uuid4().hex
        from app.models import PasswordResetToken
        prt = PasswordResetToken(
            user_id=user.id,
            token=f"ev_{token}",
            expires_at=datetime.utcnow() + __import__('datetime').timedelta(hours=24),
        )
        db.add(prt)
        db.commit()
        link = f"{_s.APP_URL}/confirmar-email?token=ev_{token}"
        from app.core.email import enviar_verificacao_email
        enviar_verificacao_email(user.email, user.nome, link)
    except Exception:
        pass
    return _auth_response(user, response=response)


@router.get("/confirmar-email")
def confirmar_email(token: str, db: Session = Depends(get_db)):
    """Endpoint chamado quando o usuário clica no link do email de verificação."""
    from app.models import PasswordResetToken
    prt = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False,
    ).first()
    if not prt:
        raise HTTPException(400, "Link inválido ou já utilizado")
    if datetime.utcnow() > prt.expires_at:
        raise HTTPException(410, "Link expirado. Faça login e solicite um novo.")
    user = db.query(User).filter(User.id == prt.user_id).first()
    if user:
        user.email_verificado = True
    prt.used = True
    db.commit()
    return {"ok": True, "mensagem": "E-mail confirmado! Você já pode usar o MegaUp."}


@router.post("/aceitar-convite", response_model=AuthResponse, status_code=201)
@limiter.limit("10/minute")
def aceitar_convite(request: Request, response: Response, body: AceitarConviteRequest, db: Session = Depends(get_db)):
    """
    Aluno usa o token do convite para criar sua conta já vinculada ao personal.
    Retorna token de acesso (aluno já fica logado após o cadastro).
    """
    convite = db.query(Convite).filter(Convite.token == body.token).first()
    if not convite:
        raise HTTPException(status_code=404, detail="Convite não encontrado")
    if convite.usado:
        raise HTTPException(status_code=410, detail="Convite já utilizado")
    if datetime.utcnow() > convite.expira_em:
        raise HTTPException(status_code=410, detail="Convite expirado")

    if db.query(User).filter(User.email == convite.email_aluno).first():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")

    user_aluno = User(
        tenant_id=convite.tenant_id,
        nome=body.nome,
        email=convite.email_aluno,
        senha_hash=hash_password(body.senha),
        role=Role.aluno,
    )
    db.add(user_aluno)
    db.flush()

    aluno = Aluno(
        tenant_id=convite.tenant_id,
        personal_id=convite.personal_id,
        user_id=user_aluno.id,
        nome=body.nome,
        email=convite.email_aluno,
    )
    db.add(aluno)
    convite.usado = True
    db.commit()
    db.refresh(user_aluno)
    return _auth_response(user_aluno, db, response)
