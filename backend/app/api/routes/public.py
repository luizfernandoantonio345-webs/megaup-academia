"""
Rotas públicas (sem autenticação):
  POST /public/esqueci-senha
  POST /public/redefinir-senha
  GET  /public/p/{referral_code}   → perfil público do personal
Rotas autenticadas:
  PATCH /public/perfil             → atualizar bio/especialidades
"""
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.config import settings
from app.core.security import hash_password
from app.core.limiter import limiter
from app.core.email import enviar_reset_senha
from app.models import User, PasswordResetToken, Tenant, Aluno, ExecucaoTreino
from app.api.deps import get_current_user

router = APIRouter()


# ── Password Reset ────────────────────────────────────────────────────────────

class EsqueciSenhaRequest(BaseModel):
    email: str


class RedefinirSenhaRequest(BaseModel):
    token: str
    nova_senha: str


@router.post("/esqueci-senha")
@limiter.limit("5/hour")
def esqueci_senha(request: Request, body: EsqueciSenhaRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.ativo == True).first()
    # Sempre retorna 200 para não vazar existência de email
    if not user:
        return {"ok": True, "dev_info": None}

    # Invalida tokens anteriores
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False,
    ).update({"used": True})

    token = uuid.uuid4().hex
    prt = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1),
    )
    db.add(prt)
    db.commit()

    link = f"{settings.APP_URL}/redefinir-senha?token={token}"
    enviar_reset_senha(user.email, user.nome, link)

    # Só retorna o link em dev local (sem nenhum provedor de email configurado)
    email_configurado = bool(settings.RESEND_API_KEY or settings.SMTP_HOST)
    dev_info = link if not email_configurado else None
    return {"ok": True, "dev_info": dev_info}


@router.post("/redefinir-senha")
def redefinir_senha(body: RedefinirSenhaRequest, db: Session = Depends(get_db)):
    prt = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == body.token,
        PasswordResetToken.used == False,
    ).first()
    if not prt:
        raise HTTPException(400, "Token inválido ou já utilizado")
    if datetime.utcnow() > prt.expires_at:
        raise HTTPException(410, "Token expirado. Solicite um novo.")
    if len(body.nova_senha) < 6:
        raise HTTPException(422, "A senha deve ter pelo menos 6 caracteres")

    user = db.query(User).filter(User.id == prt.user_id).first()
    user.senha_hash = hash_password(body.nova_senha)
    prt.used = True
    db.commit()
    return {"ok": True}


# ── Perfil Público ────────────────────────────────────────────────────────────

@router.get("/p/{referral_code}")
def perfil_publico(referral_code: str, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.referral_code == referral_code).first()
    if not tenant:
        raise HTTPException(404, "Perfil não encontrado")

    personal = db.query(User).filter(
        User.tenant_id == tenant.id,
        User.role == "personal",
        User.ativo == True,
    ).first()
    if not personal:
        raise HTTPException(404, "Personal não encontrado")

    total_alunos = db.query(Aluno).filter(Aluno.tenant_id == tenant.id).count()
    total_treinos = db.query(ExecucaoTreino).filter(ExecucaoTreino.tenant_id == tenant.id).count()

    return {
        "nome": personal.nome,
        "bio": personal.bio,
        "especialidades": personal.especialidades,
        "foto_url": personal.foto_url,
        "cref": personal.cref,
        "academia": tenant.nome,
        "referral_code": referral_code,
        "stats": {
            "total_alunos": total_alunos,
            "total_treinos": total_treinos,
        },
        "registro_link": f"{settings.APP_URL}/registrar?ref={referral_code}",
    }


# ── Atualizar perfil público (autenticado) ────────────────────────────────────

class PerfilUpdate(BaseModel):
    bio: Optional[str] = None
    especialidades: Optional[str] = None
    foto_url: Optional[str] = None

    @staticmethod
    def _validar_url(v: Optional[str]) -> Optional[str]:
        if v is not None and v != "" and not v.startswith(("https://", "http://")):
            raise ValueError("foto_url deve ser uma URL válida (https://...)")
        return v

    def model_post_init(self, __context):
        self.foto_url = self._validar_url(self.foto_url)


@router.patch("/perfil")
def atualizar_perfil(
    body: PerfilUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.bio is not None:
        current_user.bio = body.bio[:1000]  # limita tamanho
    if body.especialidades is not None:
        current_user.especialidades = body.especialidades[:500]
    if body.foto_url is not None:
        current_user.foto_url = body.foto_url
    db.commit()
    return {
        "bio": current_user.bio,
        "especialidades": current_user.especialidades,
        "foto_url": current_user.foto_url,
    }
