import os
from pydantic_settings import BaseSettings


_DEFAULT_SECRET = "change-me-in-production"


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./megaup.db"
    SECRET_KEY: str = _DEFAULT_SECRET
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"
    ANTHROPIC_API_KEY: str = ""
    ENABLE_SCHEDULER: bool = False
    # E-mail (Resend recomendado — resend.com, 3000 emails/mês grátis)
    RESEND_API_KEY: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "MegaUp <noreply@megaup.com.br>"
    FRONTEND_BASE_URL: str = "http://localhost:5173"
    # Asaas (gateway de pagamento nacional) — opcional
    ASAAS_API_KEY: str = ""
    ASAAS_SANDBOX: bool = True
    # Stripe — opcional (plataforma SaaS)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_STARTER: str = ""
    STRIPE_PRICE_PRO: str = ""
    STRIPE_PRICE_ELITE: str = ""
    APP_URL: str = "http://localhost:8000"
    # VAPID — Web Push notifications
    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Fail fast on production with unsafe defaults
_is_prod = not settings.DATABASE_URL.startswith("sqlite")
if _is_prod and settings.SECRET_KEY == _DEFAULT_SECRET:
    raise RuntimeError(
        "SECURITY: SECRET_KEY está com o valor padrão. "
        "Defina uma chave aleatória forte no .env antes de usar em produção."
    )
