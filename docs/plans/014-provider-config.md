# Plano de Ação — Implementação de Configuração do Prestador

Com base no levantamento de requisitos e nas decisões técnicas do projeto, segue um plano de ação detalhado para a implementação da funcionalidade de configuração do prestador no sistema de agendamento online:

---

## 1. Objetivo da Funcionalidade

Criar uma página de configuração que permita ao prestador:
- Editar suas informações pessoais e de negócio (exceto email)
- Alterar sua senha através de uma modal
- Visualizar e atualizar todos os dados do perfil
- Receber feedback visual através de toasts para todas as operações

---

## 2. Análise do Estado Atual

### 2.1. Estrutura do Provider (Prisma Schema)
```prisma
model Provider {
  id              String         @id @default(cuid())
  name            String         // Editável
  businessName    String         // Editável  
  email           String         @unique // NÃO editável
  password        String         // Editável via modal
  phone           String         // Editável
  customLink      String         @unique // Editável
  address         String         // Editável
  passwordResetAt DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  userId          String         @unique
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  services        Service[]
  bookings        Booking[]
  availability    Availability[]
}
```

### 2.2. Componentes Já Disponíveis
- Sistema de toast (Sonner) já configurado no layout
- Componentes shadcn/ui: Dialog, Button, Input, Label, Form
- Navegação do dashboard já implementada
- Padrão de modais já estabelecido no projeto

---

## 3. Etapas de Implementação

### 3.1. Estrutura de Validação de Dados

**3.1.1. Criar schemas de validação no `src/lib/validations.ts`**
- [ ] Schema para atualização de dados do provider
- [ ] Schema para alteração de senha
- [ ] Types TypeScript correspondentes

```typescript
// Schema para atualização do perfil do provider
export const providerUpdateSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres").trim(),
  businessName: z.string().min(2, "Nome do negócio deve ter pelo menos 2 caracteres").max(100, "Nome do negócio deve ter no máximo 100 caracteres").trim(),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(15, "Telefone deve ter no máximo 15 dígitos").regex(/^[\d\s\(\)\-\+]+$/, "Formato de telefone inválido").trim(),
  customLink: z.string().min(3, "Link personalizado deve ter pelo menos 3 caracteres").max(50, "Link personalizado deve ter no máximo 50 caracteres").regex(/^[a-zA-Z0-9\-_]+$/, "Link personalizado deve conter apenas letras, números, hífen e underscore").trim(),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres").max(200, "Endereço deve ter no máximo 200 caracteres").trim()
})

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres").max(100, "Nova senha deve ter no máximo 100 caracteres").regex(/[a-zA-Z]/, "Nova senha deve conter pelo menos uma letra").regex(/\d/, "Nova senha deve conter pelo menos um número"),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As senhas não coincidem",
  path: ["confirmNewPassword"]
})
```

### 3.2. Implementação de Funções de Serviço

**3.2.1. Criar funções no `src/lib/provider.ts`**
- [ ] Função para buscar dados do provider
- [ ] Função para atualizar dados do provider
- [ ] Função para alterar senha do provider

```typescript
// Buscar dados do provider
export async function getProviderProfile(providerId: string): Promise<Provider | null>

// Atualizar dados do provider
export async function updateProviderProfile(providerId: string, data: ProviderUpdateFormData): Promise<Provider>

// Alterar senha do provider
export async function changeProviderPassword(providerId: string, currentPassword: string, newPassword: string): Promise<boolean>
```

### 3.3. Implementação das APIs

**3.3.1. Criar rota API em `src/app/api/provider/route.ts`**
- [ ] GET: Buscar dados do provider logado
- [ ] PUT: Atualizar dados do provider logado

**3.3.2. Criar rota API em `src/app/api/provider/change-password/route.ts`**
- [ ] POST: Alterar senha do provider logado

### 3.4. Navegação do Dashboard

**3.4.1. Atualizar navegação em `src/app/dashboard/components/dashboard-nav.tsx`**
- [ ] Adicionar item "Configurações" na navegação

### 3.5. Implementação da Interface

**3.5.1. Criar página de configuração em `src/app/dashboard/config/page.tsx`**
- [ ] Formulário de edição dos dados do provider
- [ ] Botão para abrir modal de alteração de senha
- [ ] Integração com APIs
- [ ] Tratamento de loading states
- [ ] Implementação de toasts para feedback

**3.5.2. Criar modal de alteração de senha em `src/app/dashboard/config/components/change-password-modal.tsx`**
- [ ] Formulário com campos: senha atual, nova senha, confirmar nova senha
- [ ] Validação client-side e server-side
- [ ] Loading state durante a requisição
- [ ] Toasts para feedback de sucesso/erro

### 3.6. Componentes Específicos

**3.6.1. Formulário Principal de Configuração**
- Campos editáveis:
  - Nome pessoal
  - Nome do negócio
  - Telefone
  - Link personalizado
  - Endereço
- Campo não editável (read-only):
  - Email (com indicação visual de que não pode ser alterado)
- Botão "Alterar Senha" para abrir a modal
- Botão "Salvar Alterações" para submeter o formulário

**3.6.2. Modal de Alteração de Senha**
- Campo "Senha Atual" (type="password")
- Campo "Nova Senha" (type="password")  
- Campo "Confirmar Nova Senha" (type="password")
- Botões "Cancelar" e "Alterar Senha"

---

## 4. Detalhamento Técnico

### 4.1. Fluxo de Dados

**4.1.1. Carregamento Inicial**
1. Página carrega e busca dados do provider via GET `/api/provider`
2. Preenche formulário com dados atuais
3. Exibe loading state durante carregamento

**4.1.2. Atualização de Dados**
1. Usuário edita campos e clica "Salvar Alterações"
2. Validação client-side com Zod
3. Requisição PUT para `/api/provider` com dados atualizados
4. Loading state no botão durante requisição
5. Toast de sucesso/erro baseado na resposta
6. Recarregamento dos dados em caso de sucesso

**4.1.3. Alteração de Senha**
1. Usuário clica "Alterar Senha" - abre modal
2. Usuário preenche campos e clica "Alterar Senha"
3. Validação client-side com Zod
4. Requisição POST para `/api/provider/change-password`
5. Loading state na modal durante requisição
6. Toast de sucesso/erro baseado na resposta
7. Fechamento da modal em caso de sucesso

### 4.2. Validações Específicas

**4.2.1. Link Personalizado**
- Verificar se já existe outro provider com o mesmo customLink
- Regex para garantir formato válido (alfanumérico, hífen, underscore)
- Conversão para lowercase para consistência

**4.2.2. Alteração de Senha**
- Verificar senha atual antes de permitir alteração
- Hash da nova senha com bcrypt
- Não retornar a senha atual na resposta da API

### 4.3. Tratamento de Erros

**4.3.1. Erros de Validação**
- Exibir erros de campo específicos no formulário
- Toast para erros gerais de validação

**4.3.2. Erros de API**
- Conflito de customLink: "Link personalizado já está em uso"
- Senha atual incorreta: "Senha atual está incorreta"
- Erros de rede: "Erro de conexão. Tente novamente."

### 4.4. Experiência do Usuário

**4.4.1. Loading States**
- Skeleton/spinner durante carregamento inicial
- Botão "Salvar Alterações" com loading durante requisição
- Modal com loading durante alteração de senha

**4.4.2. Feedback Visual**
- Toasts para todas as operações (sucesso/erro)
- Indicação visual de campo obrigatório
- Indicação de que email não pode ser editado

---

## 5. Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   └── provider/
│   │       ├── route.ts                    # GET/PUT provider data
│   │       └── change-password/
│   │           └── route.ts                # POST change password
│   └── dashboard/
│       ├── components/
│       │   └── dashboard-nav.tsx           # Updated with config link
│       └── config/
│           ├── page.tsx                    # Main config page
│           └── components/
│               └── change-password-modal.tsx # Password change modal
├── lib/
│   ├── provider.ts                         # Provider service functions
│   └── validations.ts                      # Updated with new schemas
```

---

## 6. Checklist de Implementação

### 6.1. Backend
- [ ] Adicionar schemas de validação (`providerUpdateSchema`, `changePasswordSchema`)
- [ ] Implementar funções de serviço em `src/lib/provider.ts`
- [ ] Criar API GET/PUT `/api/provider`
- [ ] Criar API POST `/api/provider/change-password`
- [ ] Testes das APIs com casos de sucesso e erro

### 6.2. Frontend
- [ ] Atualizar navegação do dashboard com item "Configurações"
- [ ] Criar página `/dashboard/config`
- [ ] Implementar formulário principal com todos os campos
- [ ] Criar modal de alteração de senha
- [ ] Implementar loading states e tratamento de erros
- [ ] Integrar toasts para feedback
- [ ] Testes de usabilidade

### 6.3. Validação e Testes
- [ ] Testar carregamento de dados do provider
- [ ] Testar atualização de dados com validação
- [ ] Testar alteração de senha com validação
- [ ] Testar casos de erro (link duplicado, senha incorreta)
- [ ] Testar responsividade em mobile e desktop
- [ ] Verificar acessibilidade dos componentes

---

## 7. Considerações de Segurança

- Verificar autenticação em todas as rotas da API
- Hash da senha com bcrypt na alteração
- Não retornar senhas nas respostas da API
- Validar dados tanto no frontend quanto no backend
- Rate limiting nas APIs de alteração de dados
- Sanitização de inputs para prevenir XSS

---

## 8. Melhorias Futuras

- Confirmação por email para alterações importantes
- Log de auditoria para alterações de configuração
- Upload de avatar/logo do negócio
- Configurações adicionais (timezone, moeda, etc.)
- Confirmação por email para alteração de senha
