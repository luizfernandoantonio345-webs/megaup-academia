# Deploy no Render — Passo a Passo

## Pré-requisitos
- Conta no [Render](https://render.com) (gratuita)
- Repositório no GitHub com o código do FitSaaS

## 1. Subir o código para o GitHub

Se ainda não tem repositório:
```bash
cd fitsaas
git init
git add .
git commit -m "FitSaaS v1.0 — deploy inicial"
```

Crie um repositório no GitHub (pode ser privado) e:
```bash
git remote add origin https://github.com/SEU_USUARIO/fitsaas.git
git push -u origin main
```

> **Atenção:** Certifique-se de que o arquivo `.gitignore` exclui `venv/`, `__pycache__/`, `.env` e `node_modules/`.

---

## 2. Criar o .gitignore (se não existir)

```
# backend
backend/venv/
backend/__pycache__/
backend/**/__pycache__/
backend/.env
backend/*.pyc

# frontend
frontend/node_modules/
frontend/dist/
frontend/.env
```

---

## 3. Deploy via Blueprint (render.yaml)

O projeto já tem `render.yaml` na raiz. O Render lê esse arquivo e cria tudo automaticamente.

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **New → Blueprint**
3. Conecte seu repositório GitHub
4. Render vai detectar o `render.yaml` e criar os 3 serviços automaticamente:
   - `fitsaas-db` — PostgreSQL
   - `fitsaas-api` — Backend FastAPI
   - `fitsaas-frontend` — Frontend React

5. Clique em **Apply**

---

## 4. Configurar variáveis de ambiente manualmente

Após o deploy inicial, acesse cada serviço e configure:

### Backend (`fitsaas-api`) → Environment
| Variável | Valor |
|----------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (obtenha em console.anthropic.com) |
| `FRONTEND_BASE_URL` | URL do frontend (ex: `https://fitsaas-frontend.onrender.com`) |
| `SMTP_HOST` | `smtp.gmail.com` (opcional — para e-mails de convite) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | seu@gmail.com |
| `SMTP_PASSWORD` | senha de app do Gmail |

### Frontend (`fitsaas-frontend`) → Environment
| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL do backend (ex: `https://fitsaas-api.onrender.com`) |

> **IMPORTANTE:** Após salvar `VITE_API_URL`, clique em **Manual Deploy → Deploy latest commit** no serviço do frontend para rebuildar com a URL correta.

---

## 5. Verificar

Após o deploy (pode levar 3–5 min):

```
Backend:  https://fitsaas-api.onrender.com/health
Docs API: https://fitsaas-api.onrender.com/docs
Frontend: https://fitsaas-frontend.onrender.com
```

---

## 6. Primeiro acesso

1. Acesse o frontend
2. Clique em "Criar conta" → preencha seus dados de personal e nome da academia
3. Faça login
4. Crie seu primeiro aluno e treino

---

## Limites do plano gratuito do Render

| Recurso | Limite |
|---------|--------|
| Web Services | Ficam em "sleep" após 15 min de inatividade (cold start ~30s) |
| PostgreSQL | 1 GB de armazenamento, expira após 90 dias no plano gratuito |
| Banda | 100 GB/mês |

**Recomendação:** Para uso com clientes reais, atualize para o plano **Starter** (~$7/mês backend + $7/mês banco). Remove o sleep e mantém o banco permanentemente.

---

## Troubleshooting

**Backend não inicia:**
- Verifique os logs em Render → `fitsaas-api` → Logs
- Certifique-se que `DATABASE_URL` está setado (vem do banco automaticamente via blueprint)

**Frontend mostra erro de CORS ou "Network Error":**
- `VITE_API_URL` provavelmente está errado ou faltando
- Lembre de fazer redeploy do frontend após mudar a variável

**Tabelas não criadas:**
- O sistema cria automaticamente no primeiro start via `create_all`
- Se der erro, verifique se o `DATABASE_URL` do Render começa com `postgresql://` (não `postgres://`)
- Se começar com `postgres://`, adicione a var `DATABASE_URL` manualmente substituindo `postgres://` por `postgresql://`
