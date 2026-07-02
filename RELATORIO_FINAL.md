# Relatório Final — FitSaaS

**Data:** 2026-07-02  
**Versão:** 1.0.0  
**Pitch:** "Pague uma mensalidade fixa pela ferramenta e fique com 100% do que cobrar dos seus alunos."

---

## Resumo Executivo

O FitSaaS foi construído do zero como um B2B2C SaaS multi-tenant para personal trainers autônomos e academias de pequeno/médio porte. Em 9 fases, o sistema evoluiu de um CRUD básico de autenticação até uma plataforma com IA prescritiva, gamificação, cobrança integrada e suporte a múltiplos personais sob uma academia.

---

## O que foi implementado (por fase)

### FASE 0 — Fundação
- Projeto FastAPI com SQLAlchemy 2.0 + Alembic + PostgreSQL
- Modelos: `Tenant`, `User` (roles: personal / aluno / admin_academia)
- Autenticação JWT (python-jose) + hashing bcrypt
- Registro de personal com criação automática de tenant
- Testes: `test_auth.py` (7 testes)

### FASE 1 — Convites de Alunos
- Modelo `Convite` com token único e expiração
- Personal gera convite → aluno recebe link por e-mail → cria conta vinculada ao tenant
- Isolamento multi-tenant: aluno só aparece na lista do personal que o convidou
- Testes: `test_convites.py` (6 testes, fluxo completo ponta a ponta)

### FASE 2 — Exercícios e Treinos
- Modelos: `Exercicio`, `Treino`, `TreinoItem`
- Exercícios globais (tenant_id = null) + customizados por tenant
- CRUD completo de treinos com itens; dia_semana em português (sem acentos)
- Endpoint `GET /alunos/{id}/treino-do-dia` retorna treino do dia atual
- Testes: `test_exercicios.py`, `test_treinos.py`

### FASE 3 — Execução e Histórico
- Modelos: `ExecucaoTreino`, `ExecucaoItem`
- Aluno registra execução com carga real, reps e dificuldade
- Histórico de carga por exercício (`/alunos/{id}/historico-carga/{exercicio_id}`)
- Avaliações físicas: peso, % gordura, medidas (JSON — dado sensível LGPD)
- Testes: `test_execucoes.py`, `test_avaliacoes.py`

### FASE 4 — IA / Progressão de Carga
- Integração Anthropic `claude-sonnet-4-6` com Pydantic validation do output
- `POST /ia/sugerir-carga` → retorna `{acao: "aumentar"|"manter"|"reduzir", carga_sugerida, motivo}`
- `POST /ia/treino-alternativo` → gera treino alternativo dado equipamentos disponíveis
- Modelo `SugestaoProgressao` — scheduler persiste sugestões pré-calculadas
- APScheduler `tarefa_progressao` (opt-in via `ENABLE_SCHEDULER=True`)
- Testes: `test_ia.py`, `test_scheduler.py`

### FASE 5 — Gamificação
- `streak_atual` e `streak_recorde` no modelo `Aluno`
- Modelo `Conquista` com UniqueConstraint (aluno × código)
- `calcular_streak()` — conta dias consecutivos UTC retroativamente
- `atualizar_gamificacao()` — chamado após cada execução de treino
- 5 conquistas: `primeiro_treino`, `streak_7`, `streak_30`, `treinos_10`, `treinos_50`
- Endpoint `GET /alunos/{id}/gamificacao` com resposta tipada
- Testes: `test_gamificacao.py` (12 testes)

### FASE 6 — E-mail e Notificações
- `app/core/email.py` — envio SMTP com graceful no-op quando `SMTP_HOST` vazio
- Convite enviado por e-mail com HTML formatado
- Configurações `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `FRONTEND_BASE_URL`

### FASE 7 — Frontend React
- Vite + React 18 + Tailwind CSS 3 + React Router v6 + TanStack Query + Axios
- **Personal trainer**: Dashboard, Alunos, Detalhe do Aluno, Treinos, Exercícios, IA, Convites, Financeiro
- **Aluno**: Treino de Hoje, Conquistas/Gamificação
- `AuthContext` — login/registrar/logout com token JWT + user object
- `ProtectedRoute` com controle de roles
- Layout responsivo com sidebar + mobile overlay
- Todas as páginas integradas com a API via `api/index.js`

### FASE 8 — Scripts e Seed
- `scripts/seed_demo.py` — cria demo completo em desenvolvimento:
  - Personal: `demo@fitsaas.com` / `demo1234`
  - 3 alunos, 15 exercícios globais, 5 semanas de histórico de execuções
- `docker-compose.yml` — PostgreSQL 16 + backend + frontend (multi-stage nginx)
- `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`
- `.env.example` para backend e frontend

### FASE 9 — Pagamentos e Multi-tenant Academia
- **Modelos**: `PlanoAluno`, `Cobranca`, `PersonalTenant` + enums `PlanoStatus`, `CobrancaStatus`
- **Serviço Asaas** (`app/services/asaas.py`) — integração PIX com fallback simulado quando API key ausente
- **Endpoints de pagamentos** (`/pagamentos/*`):
  - `POST /planos/` — personal cria plano para aluno (valor + dia de vencimento)
  - `GET /planos/` — lista planos do tenant
  - `DELETE /planos/{id}` — inativa plano
  - `POST /cobrancas/` — gera cobrança (integra Asaas se configurado)
  - `GET /cobrancas/` — lista cobranças do tenant
  - `PATCH /cobrancas/{id}/pagar` — marca como pago manualmente
  - `GET /resumo` — resumo financeiro (receita prevista, inadimplentes, próximas cobranças)
  - `POST /webhook/asaas` — recebe confirmações automáticas do gateway
- **Endpoints de academia** (`/academia/*`):
  - `GET /personais/` — admin_academia lista personais do tenant
  - `POST /personais/` — vincula personal por e-mail ao tenant
  - `DELETE /personais/{user_id}` — remove personal da academia
- **Frontend Financeiro** — página com cards de resumo, tabela de cobranças com ação "Marcar pago" e link PIX, gestão de planos com formulários in-line

---

## Arquitetura

```
fitsaas/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── prescricao.py       # chamada ao Claude API
│   │   │   └── scheduler.py        # APScheduler job
│   │   ├── api/routes/
│   │   │   ├── auth.py             # login, registrar-personal, aceitar-convite
│   │   │   ├── alunos.py           # CRUD alunos + gamificacao + anamnese
│   │   │   ├── treinos.py          # CRUD treinos + itens + executar
│   │   │   ├── exercicios.py       # CRUD exercícios globais/tenant
│   │   │   ├── convites.py         # geração e validação de convites
│   │   │   ├── ia.py               # sugerir-carga, treino-alternativo
│   │   │   ├── pagamentos.py       # planos, cobranças, resumo, webhook Asaas
│   │   │   └── academia.py         # gestão de personais pelo admin_academia
│   │   ├── core/
│   │   │   ├── config.py           # Settings (pydantic-settings)
│   │   │   ├── db.py               # SQLAlchemy engine + SessionLocal
│   │   │   ├── deps.py             # get_current_user dependency
│   │   │   ├── security.py         # hash/verify password, create_access_token
│   │   │   └── email.py            # envio SMTP graceful
│   │   ├── models/__init__.py      # todos os modelos ORM
│   │   ├── schemas/
│   │   │   ├── auth.py             # AuthResponse, UserInfo
│   │   │   ├── alunos.py           # AlunoCreate, AlunoResponse, AlunoUpdate
│   │   │   ├── treinos.py          # TreinoCreate, TreinoResponse, etc.
│   │   │   ├── gamificacao.py      # GamificacaoResponse, ConquistaResponse
│   │   │   └── pagamentos.py       # PlanoAlunoCreate/Response, CobrancaCreate/Response, etc.
│   │   ├── services/
│   │   │   ├── gamificacao.py      # calcular_streak, atualizar_gamificacao
│   │   │   └── asaas.py            # criar_cobranca_pix, confirmar_pagamento_asaas
│   │   └── main.py                 # app FastAPI + routers + CORS + lifespan
│   ├── tests/
│   │   ├── conftest.py             # fixture client + db (SQLite in-memory)
│   │   ├── test_auth.py            # 7 testes
│   │   ├── test_convites.py        # 6 testes
│   │   ├── test_treinos.py         # testes de treinos
│   │   ├── test_execucoes.py       # testes de execução
│   │   ├── test_ia.py              # testes de IA (mock)
│   │   ├── test_scheduler.py       # 2 testes scheduler
│   │   ├── test_gamificacao.py     # 12 testes
│   │   ├── test_pagamentos.py      # 17 testes
│   │   └── test_academia.py        # 7 testes
│   ├── scripts/seed_demo.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js           # Axios + Bearer interceptor + 401 redirect
    │   │   └── index.js            # todas as funções de API
    │   ├── contexts/AuthContext.jsx
    │   ├── components/
    │   │   ├── Layout.jsx          # sidebar + mobile overlay
    │   │   └── ProtectedRoute.jsx  # role-based route guard
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Registrar.jsx
    │   │   ├── AceitarConvite.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Alunos.jsx
    │   │   ├── AlunoDetalhe.jsx
    │   │   ├── TreinoDetalhe.jsx
    │   │   ├── Exercicios.jsx
    │   │   ├── IA.jsx
    │   │   ├── Convites.jsx
    │   │   ├── Financeiro.jsx      # gestão de planos, cobranças, resumo financeiro
    │   │   └── aluno/
    │   │       ├── LayoutAluno.jsx
    │   │       ├── TreinoHoje.jsx
    │   │       └── Conquistas.jsx
    │   └── App.jsx
    ├── Dockerfile
    ├── nginx.conf
    └── .env.example
```

---

## Resultado dos Testes

```
105 passed in 128s  (todos os testes, todas as fases)
```

| Arquivo de teste          | Testes | Cobertura principal |
|---------------------------|--------|---------------------|
| `test_auth.py`            | 7      | Registro, login, JWT, proteção de rotas |
| `test_convites.py`        | 6      | Fluxo convite ponta a ponta, isolamento |
| `test_treinos.py`         | ~10    | CRUD treinos, itens, execução, histórico |
| `test_execucoes.py`       | ~8     | Registro de execução, histórico de carga |
| `test_ia.py`              | ~6     | Sugestão de carga, treino alternativo |
| `test_scheduler.py`       | 2      | Patch correto, fallback sem execuções |
| `test_gamificacao.py`     | 12     | Streak, conquistas, isolamento tenant |
| `test_pagamentos.py`      | 17     | Planos, cobranças, pagamento, webhook |
| `test_academia.py`        | 7      | Admin_academia, add/remove personais |

---

## Variáveis de Ambiente

### Backend (`.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fitsaas
SECRET_KEY=troque-em-producao
ANTHROPIC_API_KEY=sk-ant-...
ENABLE_SCHEDULER=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASSWORD=senha-de-app
FRONTEND_BASE_URL=http://localhost:5173
ASAAS_API_KEY=            # deixe vazio para modo simulado
ASAAS_SANDBOX=true
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000
```

---

## Como rodar

### Com Docker Compose
```bash
docker-compose up --build
# Backend:  http://localhost:8000
# Frontend: http://localhost:3000
# Docs API: http://localhost:8000/docs
```

### Sem Docker (desenvolvimento)
```bash
# Backend
cd backend
python -m venv venv && venv/Scripts/activate
pip install -r requirements.txt
alembic upgrade head
python scripts/seed_demo.py    # opcional — dados de demonstração
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Decisões Técnicas Relevantes

| Decisão | Motivo |
|---------|--------|
| `bcrypt==3.2.2` pinado | bcrypt 4+ é incompatível com passlib 1.7.4 |
| Imports de `SessionLocal` no nível do módulo em `scheduler.py` | Permite patch via `unittest.mock` nos testes |
| `AuthResponse` com objeto `user` aninhado | Evita divergência entre endpoints de auth; frontend lê sempre `data.user` |
| Enum de `dia_semana` sem acentos | Simplifica comparações de string em SQL e JS |
| Anamnese como `Text` (JSON) | LGPD: dado sensível não é logado nem exposto desnecessariamente |
| Asaas com fallback simulado | Sistema funciona completamente sem API key configurada |
| SQLite in-memory + StaticPool nos testes | Isolamento perfeito entre testes, sem dependência de PostgreSQL |
| `ENABLE_SCHEDULER=false` por padrão | Evita jobs rodando em dev/testes |

---

## Próximos Passos (roadmap sugerido)

1. **Criptografia AES-256** para `anamnese` e `medidas` em repouso
2. **Chat personal ↔ aluno** via WebSocket (FastAPI nativo)
3. **PWA + notificações push** para lembrete de treino
4. **Cobrança recorrente automática** — scheduler cria `Cobranca` mensalmente
5. **App mobile React Native** com código de API compartilhado
6. **Integração Apple Health / Google Fit** para aluno sincronizar dados de saúde
7. **Periodização automática por IA** — gera programa de 8–12 semanas completo
8. **Dashboard financeiro com gráficos** (Chart.js / Recharts)
9. **White-label** — academia personaliza logo e cores
10. **Plano Freemium** + trial 14 dias para aquisição orgânica

---

*Relatório gerado automaticamente ao final da implementação — FitSaaS v1.0.0*
