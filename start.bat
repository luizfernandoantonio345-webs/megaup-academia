@echo off
title MegaUp Academia — Dev Server
color 0E
echo.
echo  ==========================================
echo   MegaUp Academia — Iniciando tudo...
echo.
echo   Backend  : http://localhost:8000
echo   Frontend : http://localhost:5173
echo   API Docs : http://localhost:8000/docs
echo  ==========================================
echo.

start "MegaUp Backend" cmd /k "call %~dp0start-backend.bat"
timeout /t 3 /nobreak > nul
start "MegaUp Frontend" cmd /k "call %~dp0start-frontend.bat"

echo.
echo  Servidores iniciados em janelas separadas.
echo  Pressione qualquer tecla para fechar esta janela.
pause > nul
