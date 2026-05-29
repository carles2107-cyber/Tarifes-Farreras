@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Configuració Bot Telegram + Claude

echo ========================================
echo    BOT TELEGRAM + CLAUDE - INSTALACIÓ
echo ========================================
echo.

:: Comprovar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado.
    echo Descárgalo de: https://www.python.org/downloads/
    echo Asegúrate de marcar "Add Python to PATH" al instalar.
    pause
    exit /b 1
)
echo [OK] Python encontrado.

:: Crear .env si no existe
if not exist .env (
    echo.
    echo Vamos a configurar tus claves de acceso.
    echo.
    set /p TELEGRAM_TOKEN="Pega tu token de Telegram (de @BotFather): "
    set /p ANTHROPIC_KEY="Pega tu API Key de Anthropic: "

    (
        echo TELEGRAM_BOT_TOKEN=!TELEGRAM_TOKEN!
        echo ANTHROPIC_API_KEY=!ANTHROPIC_KEY!
    ) > .env

    echo [OK] Archivo .env creado.
) else (
    echo [OK] Archivo .env ya existe.
)

:: Instalar dependencias
echo.
echo Instalando dependencias...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Fallo al instalar dependencias.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.

:: Arrancar el bot
echo.
echo ========================================
echo   Iniciando el bot... (Ctrl+C para parar)
echo ========================================
echo.
python bot.py
pause
