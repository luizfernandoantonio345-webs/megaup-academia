from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.models import User, Tenant, Aluno, Convite, Role
from app.schemas.auth import LoginRequest, RegisterPersonalRequest, AuthResponse, UserInfo
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


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.ativo == True).first()
    if not user or not verify_password(body.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return _auth_response(user, db)


@router.post("/registrar-personal", response_model=AuthResponse, status_code=201)
def registrar_personal(body: RegisterPersonalRequest, db: Session = Depends(get_db)):
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
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _auth_response(user)


@router.post("/aceitar-convite", response_model=AuthResponse, status_code=201)
def aceitar_convite(body: AceitarConviteRequest, db: Session = Depends(get_db)):
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
