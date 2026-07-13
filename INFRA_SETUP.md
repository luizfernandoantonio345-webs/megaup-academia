# MegaUp — Guia de Infraestrutura de Produção

## 1. Render — Upgrade para Starter (pago)

O plano **Free** do Render coloca o serviço para dormir após 15 minutos de inatividade, causando cold starts de ~30s no login.

### Como fazer o upgrade

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique no serviço `megaup-api` (backend)
3. Vá em **Settings → Plan**
4. Selecione **Starter ($7/mês)** ou superior
5. Confirme o cartão de crédito

Após o upgrade, o serviço fica **sempre ativo** e o login passa a ser instantâneo.

---

## 2. Neon PostgreSQL — Banco de dados de produção

O SQLite funciona em desenvolvimento mas não suporta múltiplas conexões simultâneas em produção.

### Como configurar

1. Acesse [neon.tech](https://neon.tech) e crie uma conta gratuita
2. Crie um novo projeto → copie a `DATABASE_URL` que termina com `?sslmode=require`
3. No painel do Render, vá em **Environment → Add Environment Variable**:

```
DATABASE_URL = postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

4. Faça o deploy. O Alembic/migrations rodarão automaticamente no startup

> **Nota**: O plano gratuito do Neon inclui 0.5 GB de storage e é suficiente para academias com até ~500 alunos.

---

## 3. VAPID Keys — Notificações Push

Para ativar as notificações push (lembretes de treino, streak), gere as chaves VAPID:

### Gerar as chaves

```bash
pip install pywebpush
python -c "
from py_vapid import Vapid
v = Vapid()
v.generate_keys()
print('VAPID_PUBLIC_KEY:', v.public_key.decode())
print('VAPID_PRIVATE_KEY:', v.private_key.decode())
"
```

### Configurar no Render

Adicione nas variáveis de ambiente:

```
VAPID_PUBLIC_KEY  = BNf...  (começa com "B")
VAPID_PRIVATE_KEY = xxx...
```

O frontend lerá `VAPID_PUBLIC_KEY` via `GET /push/vapid-public-key` automaticamente.

---

## 4. WhatsApp Business API — Notificações por mensagem

Para enviar lembretes de treino via WhatsApp (ex: "Carlos, não esqueça seu treino hoje! 💪").

### Opção A — Twilio WhatsApp (mais simples)

1. Crie conta em [twilio.com](https://twilio.com)
2. Vá em **Messaging → Try it out → WhatsApp Sandbox**
3. Copie o Account SID e Auth Token
4. Adicione nas variáveis de ambiente:

```
TWILIO_ACCOUNT_SID = ACxxx
TWILIO_AUTH_TOKEN  = xxx
TWILIO_WHATSAPP_FROM = whatsapp:+14155238886
```

5. No código, use o SDK Python do Twilio:

```python
from twilio.rest import Client
client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
client.messages.create(
    from_=settings.TWILIO_WHATSAPP_FROM,
    body=f"Olá {aluno.nome}! Não esqueça seu treino hoje 💪",
    to=f"whatsapp:+55{aluno.telefone}",
)
```

### Opção B — Evolution API (self-hosted, gratuito)

Para volumes maiores ou sem custo por mensagem:

1. Deploy de uma instância Evolution API no Render (imagem Docker disponível)
2. Configure um número WhatsApp Business
3. Use webhooks para integrar ao backend MegaUp

---

## 5. Variáveis de Ambiente Completas (produção)

Configure todas no painel do Render → Environment:

```env
# Banco de dados
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require

# Segurança (gere com: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=gere-uma-chave-aleatoria-de-64-chars

# IA (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# E-mail (Resend — 3000 emails/mês grátis em resend.com)
RESEND_API_KEY=re_...
EMAIL_FROM=MegaUp <noreply@megaup.com.br>

# Push Notifications
VAPID_PUBLIC_KEY=BNf...
VAPID_PRIVATE_KEY=...

# URLs
FRONTEND_BASE_URL=https://megaup-academia.vercel.app
APP_URL=https://megaup-api.onrender.com

# Agendador de tarefas (lembretes automáticos)
ENABLE_SCHEDULER=true

# Pagamento (Asaas — opcional)
ASAAS_API_KEY=...
ASAAS_SANDBOX=false
```

---

## 6. Deploy do Frontend (Vercel)

O frontend Next.js faz deploy automático no Vercel via GitHub:

1. Acesse [vercel.com](https://vercel.com) → **New Project** → importe o repositório
2. **Root Directory**: `frontend`
3. **Build Command**: `next build`
4. **Output Directory**: `.next`
5. Adicione a variável de ambiente:

```
NEXT_PUBLIC_API_URL=https://megaup-api.onrender.com
```

6. Cada push na branch `master` faz deploy automático

---

## 7. Como rodar os testes

```bash
cd backend
pip install pytest
pytest tests/ -v
```

22 testes cobrindo: auth, alunos, treinos, check-in e health check.
