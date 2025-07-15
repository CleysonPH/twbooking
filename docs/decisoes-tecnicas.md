# Decisões Técnicas — MVP Sistema de Agendamento Online

## 1. Arquitetura Geral
- **Monolito Modular**: Projeto unificado, com front-end e back-end integrados via Next.js, facilitando desenvolvimento, deploy e manutenção.

## 2. Linguagem e Framework Principal
- **Next.js (TypeScript)**: Permite SSR, rotas de API, integração com React e back-end no mesmo projeto.

## 3. Banco de Dados
- **PostgreSQL**
  - **Produção:** Neon (banco gerenciado, externo)
  - **Desenvolvimento:** Docker Compose (container local)

## 4. ORM
- **Prisma**: Modelagem, migrações e acesso ao banco com tipagem forte e integração nativa ao Next.js.

## 5. Autenticação
- **Auth.js** (ex-NextAuth.js): Solução moderna, flexível e integrada ao Prisma para autenticação por e-mail/senha.

## 6. Envio de E-mails
- **Nodemailer** com **Mailtrap (SMTP)**: Flexibilidade, confiabilidade e controle total sobre templates e integrações.

## 7. UI/Componentes
- **shadcn/ui** + **Tailwind CSS**: Componentes React modernos, acessíveis e altamente customizáveis.

## 8. Infraestrutura e Deploy
- **Vercel:** Deploy do app Next.js, preview automático, escalabilidade.
- **Neon:** Banco PostgreSQL gerenciado em produção.
- **Docker Compose:** Banco PostgreSQL local para desenvolvimento.

## 9. DevOps e Observabilidade
- **Não implementado no MVP**: Foco em simplicidade. Ferramentas como Sentry, Uptime Kuma ou GitHub Actions podem ser adicionadas futuramente.
