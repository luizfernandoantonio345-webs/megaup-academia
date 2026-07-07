# GymPro — Configuração Render (Produção)

## Variáveis de Ambiente — Backend

No painel do Render, vá em **seu serviço backend → Environment → Add Environment Variable** e adicione cada uma abaixo.

---

### ✅ Já geradas (veja os valores no chat com o Claude)

Cole no Render os valores que o Claude gerou na conversa. Não os guardamos aqui por segurança.

```
VAPID_PUBLIC_KEY  = [ver no chat]
VAPID_PRIVATE_KEY = [ver no chat]
ENABLE_SCHEDULER  = true
```

---

### 📧 E-mail (Resend — grátis, 3.000 emails/mês)

1. Acesse **resend.com** → crie uma conta gratuita
2. Vá em **API Keys → Create API Key**
3. Copie a chave e adicione:

```
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxx   ← cole sua chave aqui
EMAIL_FROM = GymPro <noreply@SEU_DOMINIO.com>
```

> Se ainda não tem domínio, use `onboarding@resend.dev` como remetente durante os testes (Resend permite isso).
> `EMAIL_FROM = GymPro <onboarding@resend.dev>`

---

### 💳 Stripe (Billing do GymPro)

1. Acesse **dashboard.stripe.com** → crie uma conta
2. Vá em **Developers → API Keys** e copie a **Secret key**
3. Crie os produtos: Starter, Pro, Elite em **Products → Add product** (tipo: recorrente)
4. Copie o **Price ID** de cada plano (começa com `price_`)
5. Configure o webhook: **Developers → Webhooks → Add endpoint**
   - URL: `https://fitsaas-backend.onrender.com/billing/webhook`
   - Eventos: `customer.subscription.*`, `invoice.payment_*`, `checkout.session.completed`
   - Copie o **Signing secret**

```
STRIPE_SECRET_KEY = sk_live_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY = pk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxxxxxxxxxx
STRIPE_PRICE_STARTER = price_xxxxxxxxxxxx
STRIPE_PRICE_PRO = price_xxxxxxxxxxxx
STRIPE_PRICE_ELITE = price_xxxxxxxxxxxx
```

---

### 🌐 URL de produção

```
APP_URL = https://fitsaas-frontend.onrender.com
FRONTEND_BASE_URL = https://fitsaas-frontend.onrender.com
```

> Se tiver domínio personalizado, substitua pela URL do domínio.

---

### 🔐 Segurança

```
SECRET_KEY = (gere uma string aleatória longa — ex: rode `python -c "import secrets; print(secrets.token_hex(32))"`)
```

---

## Variáveis de Ambiente — Frontend (Render Static Site)

No serviço frontend do Render, em **Environment**:

```
VITE_API_URL = https://fitsaas-backend.onrender.com
```

---

## Domínio personalizado

1. Render → seu serviço → **Custom Domains → Add Custom Domain**
2. Aponte o DNS: adicione um `CNAME` apontando para o endereço `.onrender.com` no seu provedor de domínio
3. O certificado SSL é gerado automaticamente pelo Render

---

## Checklist de entrega

- [ ] VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY adicionados no Render
- [ ] ENABLE_SCHEDULER=true adicionado
- [ ] RESEND_API_KEY configurado (email funcional)
- [ ] Stripe configurado (billing funcional)
- [ ] SECRET_KEY trocado para valor seguro
- [ ] APP_URL correto para produção
- [ ] Domínio personalizado (opcional)
