# Plano de Implementação: Configuração de Disponibilidade

## 📋 Contexto

Implementar a funcionalidade de configuração de disponibilidade no sistema TW Booking, permitindo que prestadores de serviço possam cadastrar, editar e excluir os dias da semana e horários em que estão disponíveis para atendimento.

## 🎯 Objetivos

- Permitir que prestadores configurem sua disponibilidade semanal (dias e horários)
- Implementar CRUD completo para disponibilidade (Create, Read, Update, Delete)
- Criar interface intuitiva para gerenciamento de horários
- Validar conflitos de horários e sobreposições
- Integrar nova aba "Disponibilidade" na navegação do dashboard
- Preparar base para sistema de agendamentos futuros

## 📊 Estado Atual do Projeto

### ✅ Já Implementado
- Modelo `Availability` no Prisma Schema com relacionamento ao `Provider`
- Sistema de autenticação Auth.js funcional
- Dashboard com navegação (`DashboardNav`) e estrutura modular
- Padrão de API routes estabelecido (`/api/services/`)
- Componentes UI do shadcn/ui (button, card, dialog, form-field, etc.)
- Validações com Zod (`src/lib/validations.ts`)
- Utilitários para trabalho com formulários (`src/lib/form-utils.ts`)

### ❌ Faltando Implementar
- API endpoints para CRUD de disponibilidade (`/api/availability/`)
- Schemas de validação para dados de disponibilidade
- Página de configuração de disponibilidade (`/dashboard/availability`)
- Componentes para gerenciamento de horários
- Funções utilitárias para trabalhar com disponibilidade
- Integração da nova aba na navegação
- Validações de negócio (sobreposição de horários, formatos válidos, etc.)

## 🚀 Plano de Implementação

### Fase 1: Backend - API e Validações (3-4 horas)

#### 1.1. Criar schemas de validação (`src/lib/validations.ts`)
- [ ] Criar `availabilityCreateSchema` com validações para:
  - `weekday`: enum com dias da semana (MONDAY, TUESDAY, etc.)
  - `startTime`: formato HH:MM (ex: "09:00")
  - `endTime`: formato HH:MM (ex: "18:00")
  - Validação que `endTime` > `startTime`
- [ ] Criar `availabilityUpdateSchema` (similar ao create)
- [ ] Adicionar types `AvailabilityFormData`, `AvailabilityCreateData`, `AvailabilityUpdateData`

#### 1.2. Criar funções utilitárias (`src/lib/availability.ts`)
- [ ] `getProviderAvailability(providerId)`: buscar toda disponibilidade do prestador
- [ ] `createAvailability(data, providerId)`: criar nova disponibilidade
- [ ] `updateAvailability(availabilityId, data, providerId)`: atualizar disponibilidade
- [ ] `deleteAvailability(availabilityId, providerId)`: excluir disponibilidade
- [ ] `validateTimeOverlap(providerId, weekday, startTime, endTime, excludeId?)`: validar sobreposição
- [ ] `formatAvailabilityForDisplay(availability[])`: formatar dados para exibição

#### 1.3. Implementar API routes (`src/app/api/availability/route.ts`)
- [ ] `GET`: listar disponibilidade do prestador logado
- [ ] `POST`: criar nova disponibilidade com validações

#### 1.4. Implementar API routes (`src/app/api/availability/[id]/route.ts`)
- [ ] `PUT`: atualizar disponibilidade específica
- [ ] `DELETE`: excluir disponibilidade específica
- [ ] Validar propriedade (availability pertence ao provider logado)

### Fase 2: Frontend - Página e Componentes (4-5 horas)

#### 2.1. Atualizar navegação (`src/app/dashboard/components/dashboard-nav.tsx`)
- [ ] Adicionar nova aba "Disponibilidade" apontando para `/dashboard/availability`
- [ ] Atualizar lógica de `isActive` para incluir a nova rota

#### 2.2. Criar página principal (`src/app/dashboard/availability/page.tsx`)
- [ ] Implementar layout responsivo com lista de disponibilidades
- [ ] Botão para adicionar nova disponibilidade
- [ ] Listagem organizada por dia da semana
- [ ] Ações de editar e excluir para cada horário
- [ ] Estados de loading e erro
- [ ] Feedback visual para operações (success/error toasts)

#### 2.3. Criar componente cliente (`src/app/dashboard/availability/availability-client.tsx`)
- [ ] Gerenciar estado da lista de disponibilidades
- [ ] Implementar funções para CRUD (create, update, delete)
- [ ] Controlar abertura/fechamento de modais
- [ ] Implementar refresh da lista após operações
- [ ] Tratamento de erros e loading states

#### 2.4. Criar componentes de modal (`src/app/dashboard/availability/components/`)

**`create-availability-modal.tsx`:**
- [ ] Modal para adicionar nova disponibilidade
- [ ] Formulário com campos: dia da semana, horário início, horário fim
- [ ] Validação client-side em tempo real
- [ ] Integração com API de criação

**`edit-availability-modal.tsx`:**
- [ ] Modal para editar disponibilidade existente
- [ ] Preenchimento automático com dados atuais
- [ ] Validação e atualização via API

**`availability-list.tsx`:**
- [ ] Componente para listar disponibilidades agrupadas por dia
- [ ] Cards/items para cada horário configurado
- [ ] Botões de ação (editar, excluir) com confirmação

#### 2.5. Criar componentes de formulário (`src/app/dashboard/availability/components/`)

**`availability-form.tsx`:**
- [ ] Formulário reutilizável para create/edit
- [ ] Select para dia da semana com labels em português
- [ ] Inputs de tempo (time) para horário início/fim
- [ ] Validações em tempo real
- [ ] Preview do horário selecionado

### Fase 3: Melhorias e Validações (2-3 horas)

#### 3.1. Implementar validações avançadas
- [ ] Prevenir sobreposição de horários no mesmo dia
- [ ] Validar formato de horários (HH:MM)
- [ ] Garantir que horário fim > horário início
- [ ] Alertas para conflitos de horários

#### 3.2. Melhorar UX/UI
- [ ] Ordenação automática por dia da semana e horário
- [ ] Visual indicator para dias sem disponibilidade
- [ ] Confirmação antes de excluir disponibilidade
- [ ] Loading states durante operações
- [ ] Mensagens de sucesso/erro com Sonner

#### 3.3. Testes e validações finais
- [ ] Testar criação de múltiplas disponibilidades
- [ ] Testar edição e exclusão
- [ ] Validar comportamento em diferentes resoluções
- [ ] Testar prevenção de sobreposições
- [ ] Verificar integração com navegação

## 🔧 Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   └── availability/
│   │       ├── route.ts                 # GET, POST
│   │       └── [id]/
│   │           └── route.ts             # PUT, DELETE
│   └── dashboard/
│       ├── availability/
│       │   ├── page.tsx                 # Página principal
│       │   ├── availability-client.tsx  # Lógica do cliente
│       │   └── components/
│       │       ├── create-availability-modal.tsx
│       │       ├── edit-availability-modal.tsx
│       │       ├── availability-list.tsx
│       │       └── availability-form.tsx
│       └── components/
│           └── dashboard-nav.tsx        # Atualizar navegação
└── lib/
    ├── availability.ts                  # Funções utilitárias
    └── validations.ts                   # Schemas Zod
```

## 📋 Dados de Exemplo

### Modelo de Disponibilidade
```typescript
interface Availability {
  id: string
  providerId: string
  weekday: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string // "09:00"
  endTime: string   // "18:00"
}
```

### Exemplo de Disponibilidades
```json
[
  {
    "id": "clx123",
    "weekday": "MONDAY",
    "startTime": "09:00",
    "endTime": "12:00"
  },
  {
    "id": "clx124", 
    "weekday": "MONDAY",
    "startTime": "14:00",
    "endTime": "18:00"
  },
  {
    "id": "clx125",
    "weekday": "TUESDAY",
    "startTime": "08:00",
    "endTime": "17:00"
  }
]
```

## 🎨 Design/UX Considerations

### Organização Visual
- Agrupamento por dia da semana com headers visuais
- Cards para cada período de disponibilidade
- Cores diferentes para indicar dias com/sem disponibilidade
- Layout responsivo (grid no desktop, stack no mobile)

### Interações
- Botão flutuante ou destacado para "Adicionar Disponibilidade"
- Modais para criação/edição (evitar navegação desnecessária)
- Confirmação visual antes de excluir
- Feedback imediato para todas as operações

### Acessibilidade
- Labels apropriados para campos de formulário
- Navegação por teclado nos modais
- Contraste adequado para diferentes estados
- Textos alternativos para ícones

## ⚠️ Riscos e Considerações

### Riscos Técnicos
- **Sobreposição de horários**: Implementar validação rigorosa both client e server-side
- **Fuso horário**: Por enquanto assumir horário local, documentar para futuras expansões
- **Performance**: Otimizar queries de validação de conflitos

### Riscos de UX
- **Complexidade**: Manter interface simples mesmo com múltiplas disponibilidades
- **Feedback**: Garantir que usuário sempre saiba o resultado de suas ações
- **Mobile**: Garantir usabilidade em telas pequenas

### Considerações Futuras
- **Feriados**: Sistema de exceções para dias específicos
- **Intervalos**: Permitir múltiplos períodos no mesmo dia
- **Agendamento**: Esta base servirá para validação de horários disponíveis
- **Recorrência**: Padrões mais complexos de disponibilidade

## 📈 Critérios de Aceitação

### Funcionalidades Básicas
- [ ] Prestador consegue acessar página de disponibilidade via navegação
- [ ] Prestador consegue adicionar novo horário de disponibilidade
- [ ] Prestador consegue visualizar todos seus horários organizados por dia
- [ ] Prestador consegue editar horário existente
- [ ] Prestador consegue excluir horário existente

### Validações
- [ ] Sistema impede criação de horários sobrepostos no mesmo dia
- [ ] Sistema valida que horário fim é posterior ao horário início
- [ ] Sistema mostra mensagens de erro claras para dados inválidos

### UX/UI
- [ ] Interface é responsiva e funciona bem no mobile
- [ ] Operações fornecem feedback visual (loading, success, error)
- [ ] Navegação entre abas funciona corretamente
- [ ] Modais abrem/fecham adequadamente

### Segurança
- [ ] Apenas prestador autenticado pode gerenciar sua disponibilidade
- [ ] Prestador não pode ver/editar disponibilidade de outros
- [ ] APIs validam propriedade dos dados antes de modificar
