"""
Envio de e-mail via SMTP (smtplib nativo).
Se SMTP_HOST não estiver configurado, loga o e-mail e retorna sem enviar.
"""
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send(to: str, subject: str, html: str) -> None:
    if not settings.SMTP_HOST:
        logger.info("SMTP não configurado — e-mail para %s não enviado: %s", to, subject)
        return

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
        logger.exception("Falha ao enviar e-mail para %s", to)


def enviar_convite(email_aluno: str, nome_personal: str, nome_academia: str, link: str) -> None:
    html = f"""
    <h2>Você foi convidado para {nome_academia}!</h2>
    <p>Olá! <strong>{nome_personal}</strong> te convidou para acompanhar seus treinos no FitSaaS.</p>
    <p>Clique no link abaixo para criar sua conta:</p>
    <p><a href="{link}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;
       text-decoration:none;font-weight:bold;">Aceitar convite</a></p>
    <p style="color:#888;font-size:12px;">O link expira em 7 dias.</p>
    """
    _send(email_aluno, f"Convite de {nome_personal} — FitSaaS", html)
