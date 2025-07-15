# Plano de Ação — Cadastro de Agendamentos pelo Prestador

Com base no levantamento de requisitos, decisões técnicas e estado atual do projeto, segue um plano de ação detalhado para implementar a funcionalidade de cadastro manual de agendamentos pelo prestador no dashboard.

---

## 1. Objetivo

Implementar um sistema onde prestadores autenticados podem:
- Cadastrar agendamentos manualmente para clientes
- Reutilizar a mesma lógica de validação da página pública
- Acessar formulário integrado ao dashboard existente
- Criar/buscar clientes automaticamente
- Enviar notificações por e-mail

---

## 2. Estado Atual do Projeto

### ✅ Funcionalidades Já Implementadas:
- Dashboard de agendamentos em `/dashboard/appointments`
- Sistema de listagem e filtros de agendamentos
- API routes para buscar e atualizar agendamentos (`/api/bookings`)
- Lógica de cálculo de horários disponíveis no sistema público
- Componentes de calendário e seleção de horários
- Sistema de validação de disponibilidade
- Envio de e-mails automáticos

### 🔄 Funcionalidades a Implementar:
- Modal/página de criação de agendamento manual
- Adaptação dos componentes existentes para o contexto do dashboard
- Integração com a API existente usando o parâmetro `createdBy: 'provider'`
- Interface de seleção de cliente (buscar ou criar)

---

## 3. Arquitetura da Solução

### 3.1. Fluxo de Navegação
```
/dashboard/appointments
    → Botão "Novo Agendamento" (já existe na interface)
    → Modal de criação de agendamento
    → Selecionar serviço
    → Selecionar data e horário (reutilizar componentes existentes)
    → Buscar/criar cliente
    → Confirmação e criação
    → Atualização da lista de agendamentos
```

### 3.2. Estrutura de Arquivos
```
src/app/dashboard/appointments/
├── page.tsx                           # ✅ Existente
├── appointments-client.tsx            # ✅ Existente - Adicionar modal
└── components/
    ├── appointment-card.tsx           # ✅ Existente
    ├── appointment-filters.tsx        # ✅ Existente
    ├── create-appointment-modal.tsx   # 🔄 Novo
    ├── service-selector.tsx           # 🔄 Novo
    ├── customer-selector.tsx          # 🔄 Novo
    └── appointment-form.tsx           # 🔄 Novo (adaptação dos componentes públicos)
```

---

## 4. Etapas de Implementação

### Etapa 1: Criar Modal de Cadastro de Agendamento
**Arquivo**: `src/app/dashboard/appointments/components/create-appointment-modal.tsx`

**Objetivo**: Criar modal principal que gerencia o fluxo de criação de agendamento.

**Funcionalidades**:
- Modal responsivo com múltiplas etapas
- Estados de loading e erro
- Integração com API existente
- Validação de dados

**Estrutura**:
```tsx
interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  providerId: string
}

// Estados:
// 1. Seleção de serviço
// 2. Seleção de data/horário 
// 3. Seleção/criação de cliente
// 4. Confirmação
```

### Etapa 2: Implementar Seletor de Serviços
**Arquivo**: `src/app/dashboard/appointments/components/service-selector.tsx`

**Objetivo**: Permitir seleção do serviço ativo do prestador.

**Funcionalidades**:
- Listar apenas serviços ativos do prestador
- Exibir nome, preço e duração
- Interface similar aos cards da página pública
- Validação de seleção obrigatória

**API Integration**:
- Reutilizar endpoint `/api/services` (já existente)
- Filtrar por `providerId` e `isActive: true`

### Etapa 3: Adaptar Componentes de Data/Horário
**Arquivo**: `src/app/dashboard/appointments/components/appointment-form.tsx`

**Objetivo**: Reutilizar componentes de calendário e seleção de horários da página pública.

**Reutilização de Componentes**:
```tsx
// Adaptar existentes de:
// src/app/booking/[customLink]/appointment/[serviceId]/components/
import { AppointmentCalendar } from '@/app/booking/[customLink]/appointment/[serviceId]/components/appointment-calendar'
import { TimeSlots } from '@/app/booking/[customLink]/appointment/[serviceId]/components/time-slots'
```

**Adaptações Necessárias**:
- Remover dependência de `customLink` nos componentes
- Passar `providerId` diretamente
- Manter mesma lógica de validação de disponibilidade
- Usar mesma API de slots disponíveis

### Etapa 4: Implementar Seletor/Criador de Cliente
**Arquivo**: `src/app/dashboard/appointments/components/customer-selector.tsx`

**Objetivo**: Buscar cliente existente ou criar novo.

**Funcionalidades**:
- Campo de busca por e-mail ou telefone
- Lista de sugestões de clientes existentes
- Formulário de criação de novo cliente
- Validação de dados obrigatórios (nome, e-mail, telefone)

**API Integration**:
- Criar endpoint `/api/customers/search?q={query}` para busca
- Reutilizar lógica de `findOrCreateCustomer` da lib existente

### Etapa 5: Modificar appointments-client.tsx
**Arquivo**: `src/app/dashboard/appointments/appointments-client.tsx`

**Objetivo**: Integrar modal de criação no componente principal.

**Alterações**:
```tsx
// Adicionar estado do modal
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

// Modificar botão existente para abrir modal
<Button onClick={() => setIsCreateModalOpen(true)}>
  <Plus className="h-4 w-4 mr-2" />
  Novo Agendamento
</Button>

// Adicionar componente do modal
<CreateAppointmentModal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onSuccess={() => {
    setIsCreateModalOpen(false)
    fetchAppointments() // Recarregar lista
  }}
  providerId={providerId}
/>
```

### Etapa 6: Criar API Route para Busca de Clientes
**Arquivo**: `src/app/api/customers/search/route.ts`

**Objetivo**: Endpoint para buscar clientes existentes do prestador.

**Funcionalidades**:
- Busca por e-mail ou telefone
- Filtrar apenas clientes que já agendaram com o prestador
- Retornar dados básicos (id, nome, e-mail, telefone)
- Paginação opcional

**Implementação**:
```typescript
export async function GET(request: NextRequest) {
  // Verificar autenticação
  // Obter providerId
  // Buscar clientes com agendamentos do prestador
  // Filtrar por query de busca
  // Retornar resultados
}
```

### Etapa 7: Modificar API de Agendamentos
**Arquivo**: `src/app/api/bookings/route.ts` (POST method)

**Objetivo**: Suportar criação via dashboard com `createdBy: 'provider'`.

**Alterações Necessárias**:
- Validar se usuário é prestador autenticado
- Permitir passar `customerId` diretamente (cliente já existente)
- Manter funcionalidade de criar cliente automaticamente
- Adicionar campo `createdBy: 'provider'` no registro
- Enviar e-mails para ambos (cliente e prestador)

**Schema de Validação**:
```typescript
const providerBookingSchema = z.object({
  serviceId: z.string(),
  customerId: z.string().optional(), // Se existente
  customerData: z.object({           // Se novo cliente
    name: z.string(),
    email: z.string().email(),
    phone: z.string()
  }).optional(),
  dateTime: z.string(),
  createdBy: z.literal('provider')
})
```

---

## 5. Validações e Regras de Negócio

### 5.1. Reutilização de Lógica Existente
- **Validação de Disponibilidade**: Usar mesma função `isTimeSlotAvailable`
- **Cálculo de Horários**: Usar mesma API `/api/available-slots`
- **Criação de Cliente**: Usar mesma função `findOrCreateCustomer`
- **Envio de E-mails**: Usar mesmas funções de notificação

### 5.2. Regras Específicas do Dashboard
- Apenas prestadores autenticados podem criar agendamentos
- Validar se serviço pertence ao prestador logado
- Permitir agendamento apenas dentro da disponibilidade configurada
- Não permitir agendamentos em horários já ocupados
- Registrar `createdBy: 'provider'` para auditoria

### 5.3. Tratamento de Erros
- Conflitos de horário (já ocupado)
- Serviço inativo ou inexistente
- Dados de cliente inválidos
- Falha no envio de e-mails (não bloquear criação)

---

## 6. Interface de Usuário

### 6.1. Design System
- Reutilizar componentes do shadcn/ui
- Manter consistência com dashboard existente
- Modal responsivo para mobile
- Loading states e feedback visual

### 6.2. UX Considerations
- Fluxo similar ao agendamento público (familiaridade)
- Possibilidade de voltar etapas
- Preview/confirmação antes de criar
- Feedback de sucesso claro
- Tratamento de erros amigável

---

## 7. Testes e Validação

### 7.1. Cenários de Teste
- Criação com cliente existente
- Criação com cliente novo
- Validação de conflitos de horário
- Comportamento com serviços inativos
- Teste de permissões (apenas próprio prestador)

### 7.2. Validação com Usuário
- Facilidade de uso comparada ao método atual
- Tempo para completar agendamento
- Clareza das mensagens de erro
- Satisfação geral com o fluxo

---

## 8. Entrega e Deploy

### 8.1. Ordem de Implementação
1. **Dia 1-2**: Criar estrutura do modal e seletor de serviços
2. **Dia 3-4**: Adaptar componentes de data/horário
3. **Dia 5-6**: Implementar seletor de clientes e API de busca
4. **Dia 7-8**: Integrar tudo e modificar API de agendamentos
5. **Dia 9**: Testes e refinamentos
6. **Dia 10**: Deploy e documentação

### 8.2. Critérios de Aceitação
- ✅ Prestador consegue criar agendamento manual em até 2 minutos
- ✅ Sistema valida disponibilidade corretamente
- ✅ E-mails são enviados automaticamente
- ✅ Interface é responsiva e intuitiva
- ✅ Não há conflitos com agendamentos da página pública

---

## 9. Considerações Futuras

### 9.1. Melhorias Incrementais
- Busca avançada de clientes (histórico de agendamentos)
- Agendamento recorrente
- Templates de agendamento rápido
- Integração com calendários externos

### 9.2. Métricas de Sucesso
- Redução no tempo de criação de agendamentos
- Aumento na precisão de dados de clientes
- Diminuição de conflitos de horário
- Satisfação do prestador com a ferramenta

---

## 10. Recursos Técnicos Necessários

### 10.1. Dependências
- Todas as dependências já estão instaladas
- Reutilização máxima de código existente
- Sem necessidade de novas bibliotecas

### 10.2. Performance
- Reutilizar queries e otimizações existentes
- Cache de serviços do prestador
- Debounce na busca de clientes
- Loading states apropriados

---

Este plano mantém consistência com a arquitetura existente, reutiliza ao máximo o código já implementado e garante que as mesmas regras de negócio sejam aplicadas tanto no fluxo público quanto no dashboard do prestador.
