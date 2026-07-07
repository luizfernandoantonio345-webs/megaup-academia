from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_password, create_access_token, hash_password, get_current_user
from app.core.limiter import limiter
from app.models import User, Tenant, Aluno, Convite, Role
from app.schemas.auth import LoginRequest, RegisterPersonalRequest, AuthResponse, UserInfo, UpdateProfileRequest
from app.schemas.convites import AceitarConviteRequest

router = APIRouter()


def _auth_response(user: User, db: Session | None = None) -> AuthResponse:
    token = create_access_token({
        "sub": str(user.id),
        "role": user.role.value,
        "tenant_id": user.tenant_id,
    })
    aluno_id = None
    if user.role == Role.aluno and db is not None:
        aluno = db.query(Aluno).filter(Aluno.user_id == user.id).first()
        if not aluno:
            # Fallback: aluno criado manualmente (sem convite) — busca por email + tenant
            aluno = db.query(Aluno).filter(
                Aluno.email == user.email,
                Aluno.tenant_id == user.tenant_id,
            ).first()
            if aluno:
                aluno.user_id = user.id  # auto-link para próximos logins
                db.commit()
        if aluno:
            aluno_id = aluno.id
    return AuthResponse(
        access_token=token,
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
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.ativo == True).first()
    if not user or not verify_password(body.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return _auth_response(user, db)


@router.post("/registrar-personal", response_model=AuthResponse, status_code=201)
@limiter.limit("5/minute")
def registrar_personal(request: Request, body: RegisterPersonalRequest, db: Session = Depends(get_db)):
    """Cria um tenant + um personal. Para personal autônomo, tenant = ele mesmo."""
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")

    from app.services.billing import inicializar_trial
    from app.core.email import enviar_boas_vindas
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
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Marca como não verificado e envia email de confirmação
    user.email_verificado = False
    db.commit()

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
        from app.core.email import enviar_verificacao_email, enviar_boas_vindas
        enviar_verificacao_email(user.email, user.nome, link)
    except Exception:
        pass
    return _auth_response(user)


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
    return {"ok": True, "mensagem": "E-mail confirmado! Você já pode usar o GymPro."}


@router.post("/aceitar-convite", response_model=AuthResponse, status_code=201)
@limiter.limit("10/minute")
def aceitar_convite(request: Request, body: AceitarConviteRequest, db: Session = Depends(get_db)):
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
    return _auth_response(user_aluno)
