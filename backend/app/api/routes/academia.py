"""
FASE 9 — Multi-tenant Academia.

Um admin_academia pode gerenciar múltiplos personais dentro do mesmo tenant.

Endpoints:
  GET  /academia/personais/             lista personais do tenant
  POST /academia/personais/             vincula personal existente ao tenant
  DELETE /academia/personais/{user_id}  remove (inativa) personal do tenant
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import PersonalTenant, Role, User
from app.schemas.pagamentos import AdicionarPersonalRequest, PersonalInfo

router = APIRouter()


def _assert_admin(user: User):
    if user.role != Role.admin_academia:
        raise HTTPException(403, "Apenas admin_academia pode gerenciar personais")


@router.get("/personais/", response_model=list[PersonalInfo])
def listar_personais(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_admin(user)
    vinculos = (
        db.query(PersonalTenant)
        .filter(
            PersonalTenant.tenant_id == user.tenant_id,
            PersonalTenant.ativo == True,  # noqa: E712
        )
        .all()
    )
    result = []
    for v in vinculos:
        u = db.query(User).filter(User.id == v.user_id).first()
        if u:
            result.append(PersonalInfo(id=u.id, nome=u.nome, email=u.email, ativo=v.ativo))
    return result


@router.post("/personais/", response_model=PersonalInfo, status_code=201)
def adicionar_personal(
    payload: AdicionarPersonalRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_admin(user)

    personal = db.query(User).filter(
        User.email == payload.email,
        User.role == Role.personal,
    ).first()
    if not personal:
        raise HTTPException(404, "Personal não encontrado com esse e-mail")

    existente = db.query(PersonalTenant).filter(
        PersonalTenant.tenant_id == user.tenant_id,
        PersonalTenant.user_id == personal.id,
    ).first()

    if existente:
        if existente.ativo:
            raise HTTPException(409, "Personal já vinculado a esta academia")
        existente.ativo = True
        db.commit()
    else:
        vinculo = PersonalTenant(
            tenant_id=user.tenant_id,
            user_id=personal.id,
            ativo=True,
        )
        db.add(vinculo)
        db.commit()

    return PersonalInfo(id=personal.id, nome=personal.nome, email=personal.email, ativo=True)


@router.delete("/personais/{user_id}", status_code=204)
def remover_personal(
    user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _assert_admin(user)

    vinculo = db.query(PersonalTenant).filter(
        PersonalTenant.tenant_id == user.tenant_id,
        PersonalTenant.user_id == user_id,
        PersonalTenant.ativo == True,  # noqa: E712
    ).first()
    if not vinculo:
        raise HTTPException(404, "Personal não encontrado nesta academia")

    vinculo.ativo = False
    db.commit()
