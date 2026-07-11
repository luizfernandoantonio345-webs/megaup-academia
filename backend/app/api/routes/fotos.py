"""Fotos de evolução do aluno — upload comprimido no frontend, armazenado como base64."""
import base64
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import Aluno, FotoEvolucao, User

router = APIRouter()

MAX_B64_SIZE = 210_000  # ~150KB após encoding base64

# Magic bytes dos formatos de imagem aceitos
_MAGIC: list[tuple[bytes, bytes | None]] = [
    (b"\xff\xd8\xff", None),           # JPEG
    (b"\x89PNG",      None),           # PNG
    (b"GIF8",         None),           # GIF
    (b"RIFF",         b"WEBP"),        # WebP (bytes 8-11 = WEBP)
]


def _validate_image_mime(raw: bytes) -> None:
    for magic, extra in _MAGIC:
        if raw[: len(magic)] == magic:
            if extra is None or raw[8 : 8 + len(extra)] == extra:
                return
    raise HTTPException(400, "Formato de imagem inválido. Use JPEG, PNG, GIF ou WebP.")


class FotoCreate(BaseModel):
    foto_base64: str  # data:image/jpeg;base64,... ou apenas a parte base64
    tipo: Optional[str] = "frente"   # frente | lado | costas
    peso: Optional[float] = None
    observacao: Optional[str] = None
    data: Optional[str] = None       # ISO date, default=agora


def _check_aluno(aluno_id: int, current_user: User, db: Session) -> Aluno:
    aluno = db.query(Aluno).filter(
        Aluno.id == aluno_id,
        Aluno.tenant_id == current_user.tenant_id,
    ).first()
    if not aluno:
        raise HTTPException(404, "Aluno não encontrado")
    return aluno


@router.get("/{aluno_id}/fotos")
def listar_fotos(
    aluno_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_aluno(aluno_id, current_user, db)
    fotos = (
        db.query(FotoEvolucao)
        .filter(
            FotoEvolucao.aluno_id == aluno_id,
            FotoEvolucao.tenant_id == current_user.tenant_id,
        )
        .order_by(FotoEvolucao.data.desc())
        .all()
    )
    return [
        {
            "id": f.id,
            "data": f.data.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "tipo": f.tipo,
            "peso": f.peso,
            "observacao": f.observacao,
            "foto_base64": f.foto_base64,
        }
        for f in fotos
    ]


@router.post("/{aluno_id}/fotos", status_code=201)
def upload_foto(
    aluno_id: int,
    body: FotoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_aluno(aluno_id, current_user, db)

    # Strip data URI prefix if frontend sent it
    b64 = body.foto_base64
    if "," in b64:
        b64 = b64.split(",", 1)[1]

    if len(b64) > MAX_B64_SIZE:
        raise HTTPException(
            400,
            "Imagem muito grande. Máximo ~150KB. Comprima no frontend antes de enviar.",
        )

    try:
        raw = base64.b64decode(b64, validate=True)
    except Exception:
        raise HTTPException(400, "Base64 inválido")

    _validate_image_mime(raw)

    data_foto = datetime.utcnow()
    if body.data:
        try:
            data_foto = datetime.fromisoformat(body.data.replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            pass

    foto = FotoEvolucao(
        tenant_id=current_user.tenant_id,
        aluno_id=aluno_id,
        data=data_foto,
        tipo=body.tipo or "frente",
        foto_base64=b64,
        peso=body.peso,
        observacao=body.observacao or None,
    )
    db.add(foto)
    db.commit()
    db.refresh(foto)

    return {
        "id": foto.id,
        "data": foto.data.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "tipo": foto.tipo,
        "peso": foto.peso,
        "observacao": foto.observacao,
        "foto_base64": foto.foto_base64,
    }


@router.delete("/{aluno_id}/fotos/{foto_id}", status_code=204)
def deletar_foto(
    aluno_id: int,
    foto_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    foto = db.query(FotoEvolucao).filter(
        FotoEvolucao.id == foto_id,
        FotoEvolucao.aluno_id == aluno_id,
        FotoEvolucao.tenant_id == current_user.tenant_id,
    ).first()
    if not foto:
        raise HTTPException(404, "Foto não encontrada")
    db.delete(foto)
    db.commit()
