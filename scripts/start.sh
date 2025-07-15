#!/bin/sh

# Script de inicialização para produção
# Executa migrations do Prisma antes de iniciar a aplicação

echo "🚀 Iniciando aplicação TWBooking..."

# Executar migrations do Prisma
echo "📦 Executando migrations do banco de dados..."
npx prisma migrate deploy

# Verificar se as migrations foram executadas com sucesso
if [ $? -eq 0 ]; then
    echo "✅ Migrations executadas com sucesso!"
else
    echo "❌ Erro ao executar migrations!"
    exit 1
fi

# Iniciar a aplicação
echo "🌟 Iniciando servidor Next.js..."
exec node server.js
