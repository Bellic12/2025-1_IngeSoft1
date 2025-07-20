@echo off
setlocal

:: ============================
:: Configuración inicial
:: ============================

set "NODE_MIN_VERSION=18.0.0"
set "DB_COMMAND=sqlite3"
set "DB_FILE=pretty_exam.db"
set "SCHEMA=..\..\Documentacion\Proyecto\schema.sql"
set "SEED=..\..\Documentacion\Proyecto\seed_data.sql"

:: ============================
:: Verificar dependencias
:: ============================

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js no está instalado.
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm no está instalado.
    exit /b 1
)

where %DB_COMMAND% >nul 2>nul
if errorlevel 1 (
    echo ERROR: %DB_COMMAND% no está instalado.
    exit /b 1
)

:: ============================
:: Inicializar base de datos
:: ============================

if exist "%DB_FILE%" (
    del "%DB_FILE%"
    echo Base de datos anterior eliminada.
)

echo Creando base de datos...
%DB_COMMAND% "%DB_FILE%" < "%SCHEMA%"
%DB_COMMAND% "%DB_FILE%" < "%SEED%"
echo Base de datos creada.

:: ============================
:: Instalar dependencias npm y ejecutar en modo desarrollo
:: ============================

echo Instalando dependencias de npm y ejecutando...
npm run setup-dev

endlocal
pause
