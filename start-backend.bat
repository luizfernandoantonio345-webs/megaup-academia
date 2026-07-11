@echo off
title MegaUp — Backend (FastAPI)
color 0C
echo.
echo  ==========================================
echo   MegaUp Academia — Backend (FastAPI)
echo   http://localhost:8000
echo   Docs: http://localhost:8000/docs
echo  ==========================================
echo.

cd /d "%~dp0backend"

if not exist "venv\Scripts\python.exe" (
    echo [ERRO] Virtualenv nao encontrado. Execute primeiro:
    echo   cd backend
    echo   python -m venv venv
    echo   venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

if not exist ".env" (
    echo [AVISO] Arquivo .env nao encontrado. Usando configuracoes padrao.
)

set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
