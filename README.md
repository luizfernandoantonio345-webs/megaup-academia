# MegaUp Academia

Plataforma SaaS completa para gestão de academias e personal trainers.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router 7, TanStack Query 5 |
| Backend | FastAPI (Python 3.11), SQLAlchemy 2 |
| Banco dev | SQLite |
| Banco prod | PostgreSQL (Neon / Render) |
| IA | Claude (Anthropic) |
| Auth | JWT + httpOnly refresh cookie |

## Funcionalidades

- Gestão de alunos com anamnese, fotos de evolução e avaliações físicas
- Prescrição de treinos com progressão de carga via IA
- Gamificação: streak, conquistas e feed social
- QR Check-in diário com token HMAC rotativo
- Push notifications inteligentes (lembrete de streak)
- Plano nutricional por aluno com macros diários
- Agenda de sessões
- Chat personal ↔ aluno
- Relatório de evolução por aluno
- Financeiro: cobranças, planos e integração Asaas
- Billing SaaS (trial → Starter/Pro/Elite via Stripe)
- Convites por e-mail, perfil público e programa de referral
- LGPD: dados sensíveis protegidos, política de privacidade completa

## Rodar localmente

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env        # preencher variáveis
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
# criar frontend/.env com: VITE_API_URL=http://localhost:8000
npm run dev
```

Ou use os scripts na raiz:

```bash
start.bat       # inicia backend + frontend simultaneamente
reset-db.bat    # apaga e recria o banco SQLite com dados de demo
```

## Variáveis de ambiente

Ver [`backend/.env.example`](backend/.env.example) para a lista completa.

Variáveis obrigatórias em produção:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | PostgreSQL (Neon.tech recomendado) |
| `SECRET_KEY` | String aleatória longa |
| `ANTHROPIC_API_KEY` | IA de progressão de carga |
| `RESEND_API_KEY` | Envio de e-mails (resend.com) |
| `APP_URL` | URL pública do backend |
| `FRONTEND_BASE_URL` | URL pública do frontend |

## Deploy (Render)

O arquivo [`render.yaml`](render.yaml) define dois serviços:

- **Backend** — FastAPI (Python web service)
- **Frontend** — React/Vite (Static Site)

Após o primeiro deploy, configure as variáveis de ambiente no painel do Render.

## Credenciais de desenvolvimento

| Role | Email | Senha |
|---|---|---|
| Admin | admin@megaup.com.br | megaup2024 |
| Aluno | carlos@demo.com | aluno123 |
