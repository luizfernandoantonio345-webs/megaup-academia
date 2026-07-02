"""
Integração com Asaas (gateway de pagamento BR).
Se ASAAS_API_KEY não estiver configurada, as operações retornam dados simulados
para manter o sistema funcionando sem o gateway real.

Docs: https://docs.asaas.com/
"""
import logging
from datetime import datetime

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_SANDBOX_URL = "https://sandbox.asaas.com/api/v3"
_PROD_URL = "https://api.asaas.com/v3"


def _base_url() -> str:
    return _SANDBOX_URL if settings.ASAAS_SANDBOX else _PROD_URL


def _headers() -> dict:
    return {"access_token": settings.ASAAS_API_KEY, "Content-Type": "application/json"}


def _disponivel() -> bool:
    return bool(settings.ASAAS_API_KEY)


def criar_cobranca_pix(
    *,
    nome_aluno: str,
    email_aluno: str,
    cpf_aluno: str | None,
    valor: float,
    vencimento: datetime,
    descricao: str = "Mensalidade FitSaaS",
) -> dict:
    """
    Cria uma cobrança PIX no Asaas.
    Retorna dict com {asaas_id, link_pagamento, qr_code}.
    Se ASAAS_API_KEY não configurado, retorna dados simulados.
    """
    if not _disponivel():
        logger.info("Asaas não configurado — cobrança simulada para %s", email_aluno)
        return {
            "asaas_id": f"sim_{email_aluno}_{vencimento.strftime('%Y%m')}",
            "link_pagamento": None,
            "qr_code": None,
            "simulado": True,
        }

    try:
        payload = {
            "billingType": "PIX",
            "value": valor,
            "dueDate": vencimento.strftime("%Y-%m-%d"),
            "description": descricao,
            "customer": {
                "name": nome_aluno,
                "email": email_aluno,
                **({"cpfCnpj": cpf_aluno} if cpf_aluno else {}),
            },
        }
        resp = httpx.post(
            f"{_base_url()}/payments",
            headers=_headers(),
            json=payload,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "asaas_id": data.get("id"),
            "link_pagamento": data.get("invoiceUrl"),
            "qr_code": data.get("pixQrCode"),
            "simulado": False,
        }
    except Exception:
        logger.exception("Falha ao criar cobrança no Asaas para %s", email_aluno)
        return {
            "asaas_id": None,
            "link_pagamento": None,
            "qr_code": None,
            "simulado": False,
            "erro": True,
        }


def confirmar_pagamento_asaas(asaas_id: str) -> bool:
    """Consulta status da cobrança no Asaas. Retorna True se pago."""
    if not _disponivel() or not asaas_id:
        return False
    try:
        resp = httpx.get(
            f"{_base_url()}/payments/{asaas_id}",
            headers=_headers(),
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("status") == "RECEIVED"
    except Exception:
        logger.exception("Falha ao consultar Asaas id=%s", asaas_id)
        return False
