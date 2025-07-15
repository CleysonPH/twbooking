# Plano de Ação — Implementação da Página de Login (`/login`)

## 1. Objetivo
Implementar a página de login para prestadores de serviço, permitindo autenticação via e-mail e senha, com redirecionamento para dashboard após login bem-sucedido, conforme requisitos funcionais e decisões técnicas do projeto.

---

## 2. Levantamento de Requisitos Relacionados
- **Requisito 5.1.1**: O sistema deve permitir que o prestador de serviço acesse a plataforma mediante autenticação por e-mail e senha.
- Autenticação integrada com Auth.js (já configurado).
- Interface responsiva e amigável (shadcn/ui + Tailwind CSS).
- Redirecionamento para dashboard após login bem-sucedido.
- Tratamento de erros de autenticação com feedback visual.

---

## 3. Estado Atual do Projeto
- **Auth.js já configurado** em `auth.ts` com provider Credentials e integração Prisma.
- **Middleware de autenticação** configurado em `middleware.ts`.
- **Página `/login` existente** com placeholder básico em `src/app/login/page.tsx`.
- **Componentes UI disponíveis**: Button, Card, Input, Label (shadcn/ui).
- **Schema Prisma** com entidades Provider e User já definidas.
- **API route** para NextAuth em `src/app/api/auth/[...nextauth]/route.ts`.

---

## 4. Etapas do Plano de Ação

### 4.1. Frontend (Página `/login`)
- [ ] **Implementar formulário de login** com campos:
  - E-mail (input type="email", obrigatório)
  - Senha (input type="password", obrigatório)
  - Botão "Entrar"
- [ ] **Utilizar componentes shadcn/ui**:
  - `Card` para container do formulário
  - `Input` e `Label` para campos
  - `Button` para submissão
- [ ] **Adicionar validação client-side**:
  - Campos obrigatórios
  - Formato de e-mail válido
  - Feedback visual para erros
- [ ] **Integrar com Auth.js**:
  - Utilizar função `signIn` do NextAuth
  - Configurar redirecionamento após login
  - Tratar erros de autenticação
- [ ] **Design responsivo**:
  - Layout centralizado na tela
  - Adaptável para desktop e mobile
  - Consistent com design system do projeto

### 4.2. Navegação e Redirecionamento
- [ ] **Criar página de dashboard placeholder**:
  - Rota `/dashboard` com página básica para testar navegação
  - Verificação de autenticação (middleware já configurado)
  - Layout simples para validar autorização
- [ ] **Configurar redirecionamentos**:
  - Após login bem-sucedido → `/dashboard`
  - Se já autenticado e acessar `/login` → `/dashboard`
  - Se não autenticado e acessar `/dashboard` → `/login`

### 4.3. Tratamento de Erros e UX
- [ ] **Implementar feedback de erros**:
  - Credenciais inválidas
  - Campos obrigatórios
  - Problemas de conexão
- [ ] **Adicionar estados de loading**:
  - Botão desabilitado durante submissão
  - Indicador visual de carregamento
- [ ] **Melhorar UX**:
  - Link para página de cadastro
  - Placeholder adequado nos inputs
  - Mensagens de erro claras e úteis

### 4.4. Testes e Validação
- [ ] **Testar fluxo completo**:
  - Login com credenciais válidas
  - Login com credenciais inválidas
  - Validação de campos obrigatórios
  - Redirecionamento após login
  - Proteção de rotas autenticadas
- [ ] **Testar responsividade**:
  - Desktop (1920x1080, 1366x768)
  - Tablet (768px)
  - Mobile (375px, 414px)
- [ ] **Validar integração**:
  - Auth.js funcionando corretamente
  - Middleware protegendo rotas
  - Sessão persistindo após login

---

## 5. Estrutura de Arquivos

### 5.1. Arquivos a serem modificados:
- `src/app/login/page.tsx` - Implementação do formulário de login
- `src/app/dashboard/page.tsx` - Criar página placeholder (nova)

### 5.2. Possíveis novos componentes:
- `src/components/ui/form.tsx` - Se necessário para validação de formulários
- `src/components/login-form.tsx` - Componente do formulário de login (opcional)

---

## 6. Tecnologias e Dependências Utilizadas
- **Next.js 15** - Framework principal
- **Auth.js (NextAuth v5)** - Autenticação (já instalado)
- **shadcn/ui** - Componentes de interface (já configurado)
- **Tailwind CSS** - Estilização (já configurado)
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para consultas ao banco (já configurado)

---

## 7. Critérios de Aceitação
- [ ] ✅ Prestador consegue fazer login com e-mail e senha válidos
- [ ] ✅ Sistema exibe erro claro para credenciais inválidas
- [ ] ✅ Após login bem-sucedido, usuário é redirecionado para `/dashboard`
- [ ] ✅ Dashboard placeholder é acessível apenas para usuários autenticados
- [ ] ✅ Usuários não autenticados são redirecionados para `/login` ao tentar acessar `/dashboard`
- [ ] ✅ Interface é responsiva e funciona bem em desktop e mobile
- [ ] ✅ Formulário possui validações client-side adequadas
- [ ] ✅ Estados de loading são exibidos durante o processo de autenticação

---

## 8. Observações Técnicas
- O sistema de autenticação já está configurado, então o foco é na implementação da interface.
- O middleware já protege rotas automaticamente, mas é importante testar o comportamento.
- A página de dashboard é apenas um placeholder neste momento - implementação completa será abordada em plano posterior.
- Considerar implementação de "Lembrar-me" (persistent session) em versões futuras.
- Validar se a configuração atual do Auth.js está alinhada com as necessidades do projeto.

---

## 9. Próximos Passos (Fora do Escopo)
- Implementação completa do dashboard com funcionalidades reais
- Funcionalidade "Esqueci minha senha"
- Autenticação via OAuth (Google, etc.) - se necessário
- Two-factor authentication (2FA) - para versões futuras
- Logs de auditoria de login
