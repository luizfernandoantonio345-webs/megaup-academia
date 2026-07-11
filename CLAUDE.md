# MegaUp Academia — Guia do Projeto

Academia: **MegaUp Jardim das Rosas** · R. Sen. Queiroz, 246 · @megaup.jardimdasrosas

## Stack

| Camada    | Tecnologia                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS, React Router 7, React Query 5 |
| Backend   | FastAPI (Python 3.11), SQLAlchemy 2, Alembic      |
| Banco dev | SQLite (`backend/megaup.db`)                      |
| Banco prod| PostgreSQL (Render / Neon)                        |
| IA        | Claude (Anthropic) via SDK Python                 |
| Auth      | JWT (Bearer token), roles: `admin_academia` / `personal` / `aluno` |

## Como iniciar

```
# Tudo de uma vez:
start.bat

# Separado:
start-backend.bat   → http://localhost:8000  (API + docs em /docs)
start-frontend.bat  → http://localhost:5173  (App React)
```

## Credenciais de desenvolvimento

| Role  | Email                  | Senha       |
|-------|------------------------|-------------|
| Admin | admin@megaup.com.br    | megaup2024  |
| Aluno | carlos@demo.com        | aluno123    |

## Resetar banco

```
reset-db.bat   ← apaga megaup.db e recria com seed
```

## Estrutura de pastas

```
megaup-academia/
├── backend/
│   ├── app/
│   │   ├── api/routes/     ← endpoints REST (auth, alunos, treinos, etc.)
│   │   ├── core/           ← config, db, security, email
│   │   ├── models/         ← SQLAlchemy ORM
│   │   ├── schemas/        ← Pydantic validators
│   │   ├── services/       ← lógica de negócio (billing, gamificação)
│   │   └── ai/             ← integração Claude (progressão de carga)
│   ├── scripts/seed_demo.py
│   ├── venv/               ← virtualenv Python (não commitar)
│   ├── megaup.db           ← banco SQLite local (não commitar)
│   ├── .env                ← variáveis locais (não commitar)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          ← páginas (Landing, Login, Dashboard, etc.)
│   │   ├── components/     ← componentes reutilizáveis
│   │   ├── api/            ← client Axios + endpoints
│   │   ├── contexts/       ← Auth, Theme
│   │   └── hooks/          ← utilitários React
│   ├── public/             ← favicon, manifest, icons
│   ├── .env                ← VITE_API_URL=http://localhost:8000
│   └── package.json
├── start.bat               ← inicia tudo
├── start-backend.bat
├── start-frontend.bat
└── reset-db.bat
```

## Identidade visual

- Cor primária: `#ef4444` (vermelho)
- Cor hover: `#f87171` (vermelho claro)
- Fundo: `#0C0C0D` (preto)
- Cards: `#111113`
- Fonte: Inter

## Modalidades da academia

- Musculação
- Funcional
- Dança Livre
- Ritbox

## Variáveis de ambiente importantes

### Backend (`backend/.env`)
```
DATABASE_URL=sqlite:///./megaup.db        # dev
DATABASE_URL=postgresql://...             # produção
ANTHROPIC_API_KEY=sk-ant-...              # IA de progressão
ASAAS_API_KEY=...                         # gateway de pagamento
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000        # dev
VITE_API_URL=https://megaup-backend.onrender.com  # produção
```

## Deploy (Render)

Ver `render.yaml` e `RENDER_SETUP.md` na raiz do projeto.
Para produção, usar PostgreSQL e configurar as variáveis de ambiente no painel do Render.
