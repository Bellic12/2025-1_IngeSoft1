#!/bin/bash
set -e

# ============================
# Configuración inicial
# ============================

NODE_MIN_VERSION="18.0.0"
DB_COMMAND="sqlite3"
DB_FILE="pretty_exam.db"
SCHEMA="../../Documentacion/Proyecto/schema.sql"
SEED="../../Documentacion/Proyecto/seed_data.sql"

# ============================
# Verificar dependencias
# ============================

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado."
    exit 1
fi

if ! command -v $DB_COMMAND &> /dev/null; then
    echo "ERROR: $DB_COMMAND no está instalado."
    exit 1
fi

# ============================
# Inicializar base de datos
# ============================

if [ -f "$DB_FILE" ]; then
    rm "$DB_FILE"
    echo "Base de datos anterior eliminada."
fi

echo "Creando base de datos..."
$DB_COMMAND "$DB_FILE" < "$SCHEMA"
$DB_COMMAND "$DB_FILE" < "$SEED"
echo "Base de datos creada."

# ============================
# Instalar dependencias npm y ejecutar en modo desarrollo
# ============================

echo "Instalando dependencias de npm y ejecutando..."
npm run setup-dev
