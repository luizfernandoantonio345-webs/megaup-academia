@echo off
title MegaUp — Reset Database
echo.
echo  [ATENCAO] Este script vai APAGAR o banco de dados e recriar com seed inicial.
echo.
set /p confirm="Tem certeza? Digite 'sim' para confirmar: "
if /i not "%confirm%"=="sim" (
    echo Operacao cancelada.
    pause
    exit /b 0
)

cd /d "%~dp0backend"
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

if exist "megaup.db" del "megaup.db"

venv\Scripts\python.exe -c "from app.core.db import Base, engine; from app.models import *; Base.metadata.create_all(bind=engine); print('Tabelas criadas.')"
venv\Scripts\python.exe scripts/seed_demo.py

echo.
echo  Banco resetado com sucesso!
pause
