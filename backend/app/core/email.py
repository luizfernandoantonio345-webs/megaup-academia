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


def enviar_reset_senha(email: str, nome: str, link: str) -> None:
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#070B14;color:#EFF6FF;border-radius:16px;">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:900;color:#EFF6FF;margin-bottom:12px;">Redefinir sua senha</h2>
      <p style="color:#94A3B8;margin-bottom:24px;">Olá, <strong>{nome}</strong>! Recebemos uma solicitação para redefinir sua senha no GymPro.</p>
      <a href="{link}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;margin-bottom:24px;">Redefinir senha</a>
      <p style="color:#4B5768;font-size:13px;">Este link expira em <strong>1 hora</strong>. Se não foi você, ignore este email.</p>
    </div>
    """
    _send(email, "Redefinição de senha — GymPro", html)


def enviar_boas_vindas(email: str, nome: str) -> None:
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#070B14;color:#EFF6FF;border-radius:16px;">
      <h2 style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:900;color:#EFF6FF;margin-bottom:12px;">⚡ Bem-vindo ao GymPro!</h2>
      <p style="color:#94A3B8;margin-bottom:16px;">Olá, <strong>{nome}</strong>! Sua conta foi criada com sucesso.</p>
      <p style="color:#94A3B8;margin-bottom:24px;">Você tem <strong>14 dias</strong> de acesso completo à plataforma para explorar todas as funcionalidades.</p>
      <a href="https://fitsaas-frontend.onrender.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;">Acessar plataforma</a>
    </div>
    """
    _send(email, "Bem-vindo ao GymPro! 🎉", html)


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
