#!/bin/bash
# Startup script for Render / production.
set -e

echo "Criando tabelas base no banco de dados..."
python -c "
from app.core.db import engine, Base, SessionLocal
import app.models
Base.metadata.create_all(bind=engine)
print('Tabelas verificadas.')
"

echo "Verificando seed inicial..."
python -c "
from app.core.db import SessionLocal
from app.models import User
db = SessionLocal()
count = db.query(User).count()
db.close()
if count == 0:
    print('Banco vazio — rodando seed inicial...')
    import subprocess, sys
    subprocess.run([sys.executable, 'scripts/seed_demo.py'])
    print('Seed concluido.')
else:
    print(f'Banco ok ({count} usuarios).')
"

echo "Iniciando servidor uvicorn..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --no-access-log \
  --log-level warning
