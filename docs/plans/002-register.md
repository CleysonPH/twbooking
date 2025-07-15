# Plano de Ação — Implementação da Página de Registro (`/register`)

## 1. Objetivo
Implementar a página de registro de prestadores de serviço, permitindo que novos usuários criem uma conta na plataforma, conforme requisitos funcionais e decisões técnicas do projeto.

---

## 2. Levantamento de Requisitos Relacionados
- Cadastro de prestador com: nome, nome do negócio, e-mail, senha, telefone, endereço (obrigatório) e link personalizado **(gerado automaticamente)**.
- Validação de dados obrigatórios e unicidade de e-mail.
- Geração automática do `customLink` a partir do nome do negócio, com tratamento de conflitos interno (sem erro para o usuário).
- Integração com autenticação (Auth.js) e persistência no banco (Prisma/PostgreSQL).
- Interface responsiva e amigável (shadcn/ui + Tailwind CSS).

---

## 3. Estado Atual do Projeto
- Estrutura Next.js com TypeScript já criada.
- Página `/register` existente (ainda sem implementação do formulário).
- UI base e utilitários disponíveis em `src/components/ui` e `src/lib`.
- Decisões técnicas já definidas para autenticação, ORM e banco de dados.

---

## 4. Etapas do Plano de Ação

### 4.1. Modelagem e Infraestrutura
- [ ] **Atualizar o schema do Prisma** para garantir todos os campos necessários na entidade `Provider`.
- [ ] **Executar migração** para refletir alterações no banco de dados local.

### 4.2. Backend (API e Autenticação)
- [ ] **Criar rota de API** (`/api/register`) para cadastro de prestador:
  - Receber e validar dados do formulário.
  - Gerar automaticamente o `customLink` a partir do nome do negócio (`businessName`).
  - Verificar unicidade de e-mail.
  - Em caso de conflito de `customLink`, gerar uma variação única (ex: adicionando número incremental ou hash).
  - Criar registro no banco (Prisma).
  - Hash de senha seguro.
- [ ] **Integrar com Auth.js** para permitir login após registro.

### 4.3. Frontend (Página `/register`)
- [ ] **Implementar formulário de registro** com campos:
  - Nome, nome do negócio, e-mail, senha, telefone, endereço.
  - **Remover campo de customLink do formulário** (será gerado automaticamente).
- [ ] **Adicionar validação client-side** (campos obrigatórios, formato de e-mail, força da senha, etc).
- [ ] **Utilizar componentes de UI do shadcn/ui** para inputs, botões e feedbacks.
- [ ] **Exibir mensagens de erro e sucesso**.
- [ ] **Redirecionar para login/dashboard** após registro bem-sucedido.

### 4.4. Testes e Qualidade
- [ ] **Testar fluxos de registro** (sucesso, erros de validação, e-mail já existente, geração automática de customLink).
- [ ] **Testar responsividade e acessibilidade** da página.

### 4.5. Documentação e Ajustes Finais
- [ ] **Documentar endpoints, regras de negócio e lógica de geração de customLink** no README ou docs internos.
- [ ] **Revisar código e realizar ajustes de UX/UI** conforme feedback.

---

## 5. Observações
- Garantir que o endereço seja obrigatório no formulário e no banco.
- O campo customLink deve ser sempre gerado automaticamente e garantir unicidade sem intervenção do usuário.
- Preparar o fluxo para expansão futura (ex: confirmação de e-mail, campos adicionais).
- Seguir padrão de commits convencionais e boas práticas do projeto.

---

## 6. Critérios de Aceitação
- Prestador consegue se registrar com todos os dados obrigatórios.
- Dados são persistidos corretamente no banco.
- Não é possível registrar e-mail duplicado.
- O customLink é gerado automaticamente, único e sem erro para o usuário.
- Usuário recebe feedback claro sobre sucesso ou erros.
- Página responsiva e acessível.
