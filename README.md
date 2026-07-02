# FitSaaS — Plataforma de Gestão para Personal Trainers (e Academias)

SaaS B2B2C: **foco principal = personal trainer autônomo** paga mensalidade fixa pra usar o
app com seus alunos (ele fica com 100% do que cobra dos alunos). O mesmo modelo multi-tenant
também atende academias com vários personais — é o mesmo produto, o tenant só muda de escala.

Inspirado no MFIT Personal, com diferenciais em IA de progressão, multi-tenant e gamificação.

**Pitch central:** "Você paga uma mensalidade fixa pela ferramenta e fica com 100% do que
seus alunos pagam — em vez de dividir com a plataforma."

## Stack
- **Backend:** FastAPI + PostgreSQL + SQLAlchemy + Alembic
- **Auth:** JWT (papéis: admin_academia, personal, aluno)
- **IA:** camada sobre API da Anthropic (Claude) para sugestão/ajuste de treino
- **Frontend Personal/Admin:** React (web)
- **Frontend Aluno:** React Native / PWA (app de consumo)
- **Async:** APScheduler (lembretes, recálculo de progressão)
- **Pagamentos:** Asaas/Pagar.me (PIX + split) — fase posterior

## Estrutura
```
backend/
  app/
    api/routes/     # endpoints (auth, alunos, treinos, avaliacoes, ia)
    core/           # config, segurança, db
    models/         # tabelas SQLAlchemy
    schemas/        # validação Pydantic
    services/       # regras de negócio
    ai/             # integração com Claude (prescrição/ajuste)
  tests/            # pytest
frontend-personal/  # React web (dashboard do personal)
frontend-aluno/     # app do aluno
```

## Como rodar (backend)
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # preencher DATABASE_URL e ANTHROPIC_API_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

## Status
Esqueleto inicial. Ver `PROMPT-CLAUDE-CODE.md` para o roteiro de desenvolvimento completo.
