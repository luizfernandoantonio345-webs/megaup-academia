from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/fitsaas"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"
    ANTHROPIC_API_KEY: str = ""
    ENABLE_SCHEDULER: bool = False  # habilitar via .env em produção
    # E-mail — usa Resend (recomendado) ou SMTP puro
    # Resend: crie conta em resend.com → gera RESEND_API_KEY → 3 000 emails/mês grátis
    RESEND_API_KEY: str = ""
    # SMTP alternativo (ex: Brevo smtp-relay.brevo.com:587)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "GymPro <noreply@gympr.app>"
    FRONTEND_BASE_URL: str = "http://localhost:5173"
    # Asaas (gateway de pagamento) — opcional
    ASAAS_API_KEY: str = ""
    ASAAS_SANDBOX: bool = True  # False em produção
    # Stripe — plataforma SaaS (personal paga pelo GymPro)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_STARTER: str = ""   # price_xxx do Stripe Dashboard
    STRIPE_PRICE_PRO: str = ""
    STRIPE_PRICE_ELITE: str = ""
    APP_URL: str = "https://fitsaas-frontend.onrender.com"

    class Config:
        env_file = ".env"


settings = Settings()
