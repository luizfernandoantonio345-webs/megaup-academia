"""
Envio de e-mail via SMTP (smtplib) ou Resend HTTP API.

Prioridade:
  1. Se RESEND_API_KEY estiver definida → usa Resend (mais simples, sem config SMTP)
  2. Se SMTP_HOST estiver definida → usa smtplib
  3. Nenhuma das duas → loga e não envia (modo dev)

Serviços gratuitos recomendados:
  - Resend: resend.com  → 3 000 emails/mês grátis, só precisa de RESEND_API_KEY
  - Brevo : brevo.com   → 300 emails/dia  grátis, usa SMTP (smtp-relay.brevo.com:587)
"""
import logging
import smtplib
import urllib.request
import urllib.error
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Templates ──────────────────────────────────────────────────────────────

def _base(content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <!-- Header -->
        <tr>
          <td style="background:#6366f1;padding:24px 32px;">
            <span style="font-size:18px;font-weight:600;color:#ffffff;letter-spacing:-0.02em;">GymPro</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            {content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f4f4f5;">
            <p style="margin:0;font-size:12px;color:#71717a;">
              GymPro · Plataforma para Personal Trainers<br>
              <a href="{settings.FRONTEND_BASE_URL}" style="color:#6366f1;text-decoration:none;">{settings.FRONTEND_BASE_URL}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _btn(href: str, label: str) -> str:
    return f'<a href="{href}" style="display:inline-block;background:#6366f1;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:20px 0;">{label}</a>'


def _h2(text: str) -> str:
    return f'<h2 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#09090b;letter-spacing:-0.02em;">{text}</h2>'


def _p(text: str, muted: bool = False) -> str:
    color = "#71717a" if muted else "#3f3f46"
    return f'<p style="margin:0 0 12px;font-size:14px;color:{color};line-height:1.6;">{text}</p>'


# ── Transport ───────────────────────────────────────────────────────────────

def _send_via_resend(to: str, subject: str, html: str) -> None:
    payload = json.dumps({
        "from": settings.EMAIL_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    }).encode()
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status not in (200, 201):
                logger.error("Resend retornou status %s para %s", resp.status, to)
    except urllib.error.HTTPError as e:
        logger.error("Resend erro %s: %s", e.code, e.read())
    except Exception:
        logger.exception("Falha ao enviar via Resend para %s", to)


def _send_via_smtp(to: str, subject: str, html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as s:
            s.ehlo()
            s.starttls()
            s.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            s.sendmail(settings.EMAIL_FROM, to, msg.as_string())
    except Exception:
        logger.exception("Falha ao enviar via SMTP para %s", to)


def _send(to: str, subject: str, html: str) -> None:
    if settings.RESEND_API_KEY:
        _send_via_resend(to, subject, html)
    elif settings.SMTP_HOST:
        _send_via_smtp(to, subject, html)
    else:
        logger.info("Email não enviado (sem SMTP/Resend): %s → %s", subject, to)


# ── Emails ──────────────────────────────────────────────────────────────────

def enviar_reset_senha(email: str, nome: str, link: str) -> None:
    content = (
        _h2("Redefinir sua senha")
        + _p(f"Olá, <strong>{nome}</strong>! Recebemos uma solicitação para redefinir sua senha.")
        + _btn(link, "Redefinir senha")
        + _p("Este link expira em <strong>1 hora</strong>. Se não foi você, ignore este e-mail.", muted=True)
    )
    _send(email, "Redefinição de senha — GymPro", _base(content))


def enviar_boas_vindas(email: str, nome: str) -> None:
    content = (
        _h2(f"Bem-vindo ao GymPro, {nome}!")
        + _p("Sua conta foi criada com sucesso. Você tem <strong>14 dias</strong> de acesso completo para explorar todas as funcionalidades.")
        + _btn(f"{settings.FRONTEND_BASE_URL}/dashboard", "Acessar plataforma")
        + _p("Qualquer dúvida, basta responder este e-mail.", muted=True)
    )
    _send(email, "Bem-vindo ao GymPro!", _base(content))


def enviar_convite(email_aluno: str, nome_personal: str, nome_academia: str, link: str) -> None:
    content = (
        _h2(f"Você foi convidado para {nome_academia}")
        + _p(f"<strong>{nome_personal}</strong> te convidou para acompanhar seus treinos no GymPro.")
        + _btn(link, "Aceitar convite")
        + _p("O link expira em 7 dias.", muted=True)
    )
    _send(email_aluno, f"Convite de {nome_personal} — GymPro", _base(content))


def enviar_verificacao_email(email: str, nome: str, link: str) -> None:
    content = (
        _h2(f"Confirme seu e-mail, {nome}!")
        + _p("Obrigado por se cadastrar no GymPro. Clique no botão abaixo para ativar sua conta.")
        + _btn(link, "Confirmar e-mail")
        + _p("Este link expira em <strong>24 horas</strong>. Se não foi você, ignore este e-mail.", muted=True)
    )
    _send(email, "Confirme seu e-mail — GymPro", _base(content))


def enviar_lembrete_pagamento(
    aluno_nome: str,
    aluno_email: str,
    personal_nome: str,
    valor: float,
    vencimento,
) -> None:
    """Lembrete de cobrança vencida enviado ao aluno."""
    venc_str = vencimento.strftime("%d/%m/%Y") if hasattr(vencimento, "strftime") else str(vencimento)
    content = (
        _h2(f"Olá, {aluno_nome.split()[0]}! 👋")
        + _p(f"Seu personal <strong>{personal_nome}</strong> identificou um pagamento pendente:")
        + f'<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:16px 20px;margin:16px 0;">'
        + f'<div style="font-size:28px;font-weight:700;color:#f87171;font-family:Inter,sans-serif;">R$ {valor:.2f}</div>'
        + f'<div style="font-size:13px;color:#71717a;margin-top:4px;">Vencimento: {venc_str}</div>'
        + f'</div>'
        + _p("Entre em contato com seu personal para regularizar.", muted=True)
    )
    _send(aluno_email, f"Pagamento pendente — R$ {valor:.2f} venceu em {venc_str}", _base(content))


def enviar_cancelamento_assinatura(email: str, nome: str, plano: str) -> None:
    link_planos = f"{settings.APP_URL}/planos"
    content = (
        _h2(f"Sua assinatura foi cancelada, {nome}")
        + _p(f"O plano <strong>{plano}</strong> foi cancelado e sua conta foi movida para o plano Free (até 3 alunos).")
        + _p("Você pode reativar a qualquer momento pelo painel de planos.")
        + _btn(link_planos, "Ver planos disponíveis")
        + _p("Se isso foi um erro ou deseja ajuda, responda este e-mail.", muted=True)
    )
    _send(email, "Assinatura cancelada — GymPro", _base(content))
