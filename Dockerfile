# Dockerfile multi-stage para aplicação Next.js com Prisma
# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

# Instalar dependências necessárias para builds nativos
RUN apk add --no-cache libc6-compat

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar todas as dependências (incluindo dev para build)
RUN npm ci --ignore-scripts

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Construir aplicação para produção
RUN npm run build

# Estágio 2: Imagem de produção
FROM node:20-alpine AS runner

# Instalar dumb-init, openssl (necessário para Prisma) e wget (para healthcheck)
RUN apk add --no-cache dumb-init openssl wget

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos necessários do estágio de build
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar schema do Prisma, migrations e client gerado
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Copiar script de inicialização
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Trocar para usuário não-root
USER nextjs

# Comando de inicialização com dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["./scripts/start.sh"]
