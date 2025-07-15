# TWBooking - Deployment em Produção

## 🐳 Deploy com Docker

### Pré-requisitos
- Docker e Docker Compose instalados
- Banco de dados PostgreSQL configurado
- Variáveis de ambiente configuradas

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env.production` com as seguintes variáveis:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# Email (se usando)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"
```

### Build da Imagem

```bash
# Build da imagem Docker
docker build -t twbooking:latest .

# Ou usando docker-compose
docker-compose -f docker-compose.prod.yml build
```

### Executar em Produção

```bash
# Com docker-compose (inclui PostgreSQL)
docker-compose -f docker-compose.prod.yml up -d

# Ou apenas a aplicação (se tiver banco externo)
docker run -d \
  --name twbooking \
  -p 3000:3000 \
  --env-file .env.production \
  twbooking:latest
```

### Healthcheck

Verifique se a aplicação está funcionando:

```bash
curl http://localhost:3000/api/health
```

## 🚀 Deploy em Plataformas Cloud

### Vercel (Recomendado para Next.js)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático a cada push

### Railway

1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Adicione serviço PostgreSQL

### DigitalOcean App Platform

1. Crie uma nova app no DigitalOcean
2. Configure o Dockerfile
3. Adicione banco PostgreSQL gerenciado

## 🔧 Comandos Úteis

```bash
# Ver logs do container
docker logs twbooking

# Executar migrations manualmente
docker exec twbooking npx prisma migrate deploy

# Acessar shell do container
docker exec -it twbooking sh

# Parar e remover containers
docker-compose -f docker-compose.prod.yml down
```

## 🔐 Segurança em Produção

1. **Use HTTPS**: Configure SSL/TLS
2. **Variáveis de Ambiente**: Nunca commite secrets
3. **NEXTAUTH_SECRET**: Use uma chave forte e única
4. **Database**: Configure SSL para conexão com banco
5. **Rate Limiting**: Configure limites de requisições
6. **CORS**: Configure domínios permitidos

## 📊 Monitoramento

- Configure logs estruturados
- Use ferramentas como Sentry para error tracking
- Configure alertas de saúde da aplicação
- Monitore performance do banco de dados

## 🔄 CI/CD

Exemplo de pipeline GitHub Actions:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        # ... configuração do pipeline
```

## 🆘 Troubleshooting

### Erro de conexão com banco
- Verifique `DATABASE_URL`
- Confirme que o banco está acessível
- Teste conectividade de rede

### Migrations falhando
- Execute `prisma migrate reset` em desenvolvimento
- Verifique se todas as migrations estão commitadas

### Erro 500 na aplicação
- Verifique logs: `docker logs twbooking`
- Confirme variáveis de ambiente
- Teste localmente com dados de produção
