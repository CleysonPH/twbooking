# Plano de Ação — Gerenciamento de Agendamentos

Com base no levantamento de requisitos e nas decisões técnicas do projeto, segue um plano de ação detalhado para a implementação da funcionalidade de gerenciamento de agendamentos pelo prestador de serviço:

---

## 1. Objetivo da Funcionalidade

Permitir que o prestador de serviço:
- Visualize todos os seus agendamentos em uma interface clara e organizada
- Filtre agendamentos por data para facilitar a visualização
- Altere o status de agendamentos (cancelar, marcar como não compareceu, concluído)
- Tenha acesso a um botão para criação de novos agendamentos (funcionalidade será implementada posteriormente)

---

## 2. Estado Atual do Projeto

### 2.1. Estrutura Existente
- ✅ Schema Prisma com modelo `Booking` completo
- ✅ API de criação de agendamentos (`/api/bookings`)
- ✅ Sistema de autenticação com Auth.js
- ✅ Dashboard básico com navegação
- ✅ Componentes UI do shadcn/ui configurados
- ✅ Enum `BookingStatus` definido (SCHEDULED, COMPLETED, CANCELLED, NO_SHOW)

### 2.2. Gaps Identificados
- ❌ Página de gerenciamento de agendamentos não existe
- ❌ API para listagem de agendamentos do prestador
- ❌ API para atualização de status de agendamentos
- ❌ Componentes UI específicos para listagem e gerenciamento
- ❌ Sistema de filtros por data

---

## 3. Etapas de Implementação

### 3.1. Backend - APIs de Agendamentos

#### 3.1.1. API de Listagem de Agendamentos
**Arquivo**: `src/app/api/bookings/route.ts` (método GET)

**Funcionalidades**:
- Listar agendamentos do prestador autenticado
- Suporte a filtros por data (query params: `startDate`, `endDate`)
- Ordenação por data/hora do agendamento
- Incluir dados do cliente e serviço via snapshot

**Validações**:
- Verificar autenticação do prestador
- Validar formato das datas de filtro
- Limitar resultados para evitar sobrecarga

#### 3.1.2. API de Atualização de Status
**Arquivo**: `src/app/api/bookings/[id]/route.ts` (método PATCH)

**Funcionalidades**:
- Atualizar status do agendamento
- Validar se o agendamento pertence ao prestador autenticado
- Enviar notificações por e-mail quando necessário

**Validações**:
- Verificar se o agendamento existe
- Verificar se o prestador é o dono do agendamento
- Validar transições de status permitidas
- Não permitir alterações em agendamentos muito antigos

### 3.2. Frontend - Página de Gerenciamento

#### 3.2.1. Estrutura de Arquivos
```
src/app/dashboard/appointments/
├── page.tsx                    # Página principal
├── appointments-client.tsx     # Componente client-side
└── components/
    ├── appointment-card.tsx    # Card individual do agendamento
    ├── appointment-filters.tsx # Filtros de data
    ├── status-badge.tsx       # Badge de status
    └── status-update-modal.tsx # Modal para alteração de status
```

#### 3.2.2. Componente Principal
**Arquivo**: `src/app/dashboard/appointments/page.tsx`

**Funcionalidades**:
- Server component que busca dados iniciais
- Implementa autenticação e redirecionamento
- Passa dados para componente client-side

#### 3.2.3. Componente Client-Side
**Arquivo**: `src/app/dashboard/appointments/appointments-client.tsx`

**Funcionalidades**:
- Estado local para agendamentos e filtros
- Funções para atualização de status
- Integração com APIs
- Gerenciamento de loading states

#### 3.2.4. Componentes Específicos

**AppointmentCard**:
- Exibir informações do agendamento
- Badge de status com cores específicas
- Botões de ação (alterar status)
- Layout responsivo

**AppointmentFilters**:
- Filtro por data (data início e fim)
- Botão de limpar filtros
- Aplicação automática de filtros

**StatusBadge**:
- Componente reutilizável para exibir status
- Cores específicas para cada status
- Texto traduzido para português

**StatusUpdateModal**:
- Modal para confirmar alteração de status
- Seleção do novo status
- Confirmação de ação

### 3.3. Navegação e UX

#### 3.3.1. Atualização da Navegação
**Arquivo**: `src/app/dashboard/components/dashboard-nav.tsx`

**Mudanças**:
- Adicionar item "Agendamentos" na navegação
- Link para `/dashboard/appointments`
- Ícone apropriado

#### 3.3.2. Design da Interface
- Layout consistente com outras páginas do dashboard
- Cards com informações claras e organizadas
- Estados de loading e error bem definidos
- Feedback visual para ações do usuário

---

## 4. Especificações Técnicas

### 4.1. Schema de Validação
```typescript
// Para filtros de agendamentos
const appointmentFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Para atualização de status
const updateStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
})
```

### 4.2. Tipos TypeScript
```typescript
interface AppointmentWithDetails {
  id: string
  dateTime: Date
  status: BookingStatus
  customerNameSnapshot: string
  customerEmailSnapshot: string
  serviceNameSnapshot: string
  servicePriceSnapshot: number
  serviceDescriptionSnapshot: string | null
  addressSnapshot: string
  createdAt: Date
  updatedAt: Date
}

interface AppointmentFilters {
  startDate?: string
  endDate?: string
}
```

### 4.3. Estados de Loading
- Loading inicial da página
- Loading durante filtros
- Loading durante atualização de status
- Estados de erro com retry

---

## 5. Regras de Negócio

### 5.1. Transições de Status Permitidas
- `SCHEDULED` → `COMPLETED`, `CANCELLED`, `NO_SHOW`
- `COMPLETED` → Não permite alterações
- `CANCELLED` → Não permite alterações
- `NO_SHOW` → Não permite alterações

### 5.2. Restrições Temporais
- Não permitir alteração de status para agendamentos muito antigos (> 30 dias)
- Não permitir cancelamento de agendamentos já ocorridos

### 5.3. Notificações
- Enviar e-mail ao cliente quando agendamento for cancelado pelo prestador
- Log de todas as alterações de status para auditoria

---

## 6. Funcionalidades Futuras (Botão Placeholder)

### 6.1. Botão "Novo Agendamento"
- Posicionado no header da página
- Estilo consistente com design system
- Tooltip indicando "Em desenvolvimento"
- Link preparado para `/dashboard/appointments/new`

---

## 7. Checklist de Implementação

### 7.1. Backend
- [ ] Implementar GET `/api/bookings` com filtros
- [ ] Implementar PATCH `/api/bookings/[id]` para status
- [ ] Adicionar validações de segurança
- [ ] Implementar notificações por e-mail
- [ ] Testes das APIs

### 7.2. Frontend
- [ ] Criar estrutura de arquivos
- [ ] Implementar página principal
- [ ] Criar componente AppointmentCard
- [ ] Implementar sistema de filtros
- [ ] Criar modal de atualização de status
- [ ] Implementar estados de loading/error
- [ ] Adicionar navegação no dashboard
- [ ] Adicionar botão "Novo Agendamento" (placeholder)

### 7.3. UX/UI
- [ ] Design responsivo
- [ ] Estados vazios (sem agendamentos)
- [ ] Feedback visual para ações
- [ ] Cores específicas para cada status
- [ ] Formatação de datas em português

### 7.4. Testes e Validação
- [ ] Teste de listagem de agendamentos
- [ ] Teste de filtros por data
- [ ] Teste de alteração de status
- [ ] Teste de permissões (apenas próprios agendamentos)
- [ ] Teste de responsividade
- [ ] Teste de estados de loading/error

---

## 8. Considerações de Performance

- Implementar paginação se necessário (inicialmente carregar últimos 30 dias)
- Cache de agendamentos no cliente para evitar requests desnecessários
- Debounce nos filtros de data
- Otimização de queries no Prisma (select específico, includes necessários)

---

## 9. Acessibilidade

- Labels apropriados em todos os elementos interativos
- Suporte à navegação por teclado
- Contraste adequado nas cores dos status
- Screen reader friendly

---

## 10. Cronograma Estimado

- **Backend APIs**: 1-2 dias
- **Componentes base**: 1-2 dias  
- **Integração e UX**: 1 dia
- **Testes e ajustes**: 1 dia
- **Total estimado**: 4-6 dias

---

Este plano garante uma implementação completa e robusta do gerenciamento de agendamentos, mantendo consistência com o restante do projeto e preparando a base para futuras funcionalidades.
