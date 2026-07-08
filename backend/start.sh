#!/bin/bash
# Startup script for Render / production.
# SQLAlchemy create_all + DDL migrations are handled by the FastAPI lifespan,
# so we just ensure the base tables exist then hand off to uvicorn.
set -e

echo "Criando tabelas base no banco de dados..."
python -c "
from app.core.db import engine, Base
import app.models
Base.metadata.create_all(bind=engine)
print('Tabelas verificadas.')
"

echo "Iniciando servidor uvicorn..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --no-access-log \
  --log-level warning
