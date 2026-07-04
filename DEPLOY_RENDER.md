# Deploy — GymPro no Render

## URLs de produção

| Serviço  | URL |
|----------|-----|
| Frontend | https://fitsaas-frontend.onrender.com |
| Backend  | https://fitsaas.onrender.com |
| API Docs | https://fitsaas.onrender.com/docs |
| Health   | https://fitsaas.onrender.com/health |

---

## Deploy automático

O Render faz deploy automático toda vez que há um `git push` para o branch `master`.  
Se o deploy não atualizar, vá em: **Dashboard → fitsaas-frontend → Manual Deploy → Deploy latest commit**

---

## Variáveis de ambiente — Backend (`fitsaas-api`)

Configure em: Dashboard → fitsaas-api → Environment

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Vem automaticamente do banco Render |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (console.anthropic.com) |
| `FRONTEND_BASE_URL` | `https://fitsaas-frontend.onrender.com` |
| `RESEND_API_KEY` | `re_...` (resend.com — gratuito, 3k emails/mês) |

### Configurar o Resend (email — obrigatório para reset de senha e convites)

1. Acesse [resend.com](https://resend.com) → crie conta grátis
2. Vá em **API Keys → Create API Key**
3. Copie a chave e cole em `RESEND_API_KEY` no Render
4. *(Opcional)* Adicione e verifique um domínio próprio para o remetente

> Sem `RESEND_API_KEY`, emails de reset de senha e convites **não são enviados** (apenas logados no servidor).

---

## Variáveis de ambiente — Frontend (`fitsaas-frontend`)

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | `https://fitsaas.onrender.com` |

> Após salvar, clique em **Manual Deploy** para rebuildar o frontend com a URL correta.

---

## Primeiro acesso

1. Acesse https://fitsaas-frontend.onrender.com
2. Clique em **Criar conta** → preencha nome, email, senha e nome da academia
3. Faça login
4. Crie um aluno, monte um treino, veja o Dashboard

---

## Limites do plano gratuito do Render

| Recurso | Detalhe |
|---------|---------|
| Cold start | Backend dorme após 15 min de inatividade → primeira req leva ~30s |
| PostgreSQL | 1 GB, expira após 90 dias |
| Banda | 100 GB/mês |

**Para clientes reais:** atualize para o plano **Starter** (~$7/mês backend + $7/mês banco). Remove o sleep.

---

## Troubleshooting

### Deploy não atualiza após push
→ Vá em Dashboard → fitsaas-frontend → **Manual Deploy → Deploy latest commit**  
→ Veja os logs de build para identificar falha

### Build falha com "out of memory"
O `render.yaml` já configura `NODE_OPTIONS="--max-old-space-size=1536"`.  
Se ainda falhar, aumente para `2048` no campo `buildCommand`.

### Frontend mostra "Network Error" ou não carrega dados
→ Verifique se `VITE_API_URL=https://fitsaas.onrender.com` está setado  
→ Após setar, faça **Manual Deploy** no frontend

### Banco não inicia
→ `DATABASE_URL` deve começar com `postgresql://` (não `postgres://`)  
→ Se começar com `postgres://`, substitua manualmente

### Email não chega
→ `RESEND_API_KEY` não está configurado ou está errado  
→ Verifique logs do backend: `fitsaas-api → Logs → grep "email"`
