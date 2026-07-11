@echo off
title MegaUp — Frontend (React + Vite)
color 09
echo.
echo  ==========================================
echo   MegaUp Academia — Frontend (React)
echo   http://localhost:5173
echo  ==========================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] node_modules nao encontrado. Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias npm.
        pause
        exit /b 1
    )
)

npm run dev
