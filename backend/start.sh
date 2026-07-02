#!/bin/bash
# Script de inicialização para produção (Render, Docker, etc.)
# Cria tabelas que ainda não existem e depois sobe o servidor.
set -e

echo "Criando tabelas no banco de dados..."
python -c "
from app.core.db import engine, Base
import app.models  # registra todos os models
Base.metadata.create_all(bind=engine)
print('Tabelas criadas/verificadas com sucesso.')
"

echo "Iniciando servidor..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
