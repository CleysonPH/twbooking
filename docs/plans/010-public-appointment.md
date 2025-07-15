# Plano de Ação — Implementação do Sistema de Agendamento Público

Com base no levantamento de requisitos, decisões técnicas e estado atual do projeto, segue um plano de ação detalhado para implementar a funcionalidade completa de agendamento público na plataforma TWBooking.

---

## 1. Objetivo

Implementar um sistema completo de agendamento online onde clientes podem:
- Visualizar serviços disponíveis na página pública `/booking/{customLink}`
- Selecionar um serviço e acessar uma página de agendamento
- Escolher data e horário disponível baseado na disponibilidade do prestador
- Preencher dados pessoais e confirmar o agendamento
- Receber confirmação por e-mail junto com o prestador

---

## 2. Estado Atual do Projeto

### ✅ Funcionalidades Já Implementadas:
- Página pública básica em `/booking/{customLink}`
- Exibição de informações do prestador
- Listagem de serviços ativos em cards
- Modal de detalhes do serviço
- Sistema de disponibilidade (CRUD completo)
- Autenticação de prestadores
- CRUD de serviços
- Schema do banco com todas as entidades necessárias

### 🔄 Funcionalidades a Implementar:
- Página de agendamento com calendário
- Cálculo de horários disponíveis
- Formulário de dados do cliente
- Criação de agendamentos
- Sistema de e-mails automáticos
- Página de confirmação

---

## 3. Arquitetura da Solução

### 3.1. Fluxo de Navegação
```
/booking/{customLink} 
    → Clique no card do serviço 
    → Modal com botão "Agendar Serviço"
    → /booking/{customLink}/appointment/{serviceId}
    → Página de agendamento (calendário + formulário)
    → /booking/{customLink}/confirmation/{bookingId}
    → Página de confirmação + envio de e-mails
```

### 3.2. Estrutura de Rotas
```
src/app/booking/[customLink]/
├── page.tsx                           # Página pública existente
├── appointment/
│   └── [serviceId]/
│       ├── page.tsx                   # Página de agendamento
│       └── components/
│           ├── appointment-calendar.tsx
│           ├── time-slots.tsx
│           ├── customer-form.tsx
│           └── booking-summary.tsx
├── confirmation/
│   └── [bookingId]/
│       └── page.tsx                   # Página de confirmação
└── components/                        # Componentes existentes
    ├── service-detail-modal.tsx       # ✅ Implementado
    ├── public-service-card.tsx        # ✅ Implementado
    ├── provider-info.tsx              # ✅ Implementado
    └── public-provider-client.tsx     # ✅ Implementado
```

---

## 4. Etapas de Implementação

### Etapa 1: Modificar Modal de Detalhes do Serviço
**Arquivo**: `src/app/booking/[customLink]/components/service-detail-modal.tsx`

**Objetivo**: Adicionar botão "Agendar Serviço" que redireciona para a página de agendamento.

**Alterações**:
- Substituir o placeholder "Em breve..." por botão funcional
- Usar `useRouter` para navegação
- Passar dados necessários via URL params

### Etapa 2: Criar API Routes para Agendamento
**Arquivos Novos**:
- `src/app/api/bookings/route.ts` - Criar agendamento
- `src/app/api/bookings/available-slots/route.ts` - Buscar horários disponíveis

**Funcionalidades**:
- Validar disponibilidade antes de criar agendamento
- Calcular horários livres baseado na disponibilidade do prestador
- Considerar duração do serviço e agendamentos existentes
- Criar cliente automaticamente se não existir

### Etapa 3: Implementar Lógica de Cálculo de Horários Disponíveis
**Arquivo**: `src/lib/booking.ts` (novo)

**Funcionalidades**:
- Função para buscar disponibilidade do prestador por dia da semana
- Função para buscar agendamentos existentes em uma data específica
- Algoritmo para calcular slots livres considerando:
  - Disponibilidade do prestador (ex: Segunda 08:00-12:00)
  - Duração do serviço (ex: 30 minutos)
  - Agendamentos já confirmados
  - Intervalo mínimo entre agendamentos

**Exemplo de cálculo**:
```
Disponibilidade: Segunda 08:00-12:00
Serviço: 30 minutos
Agendamentos existentes: 09:00-09:30, 10:30-11:00

Horários disponíveis:
✅ 08:00 - 08:30
✅ 08:30 - 09:00
❌ 09:00 - 09:30 (ocupado)
✅ 09:30 - 10:00
✅ 10:00 - 10:30
❌ 10:30 - 11:00 (ocupado)
✅ 11:00 - 11:30
✅ 11:30 - 12:00
```

### Etapa 4: Criar Página de Agendamento
**Arquivo**: `src/app/booking/[customLink]/appointment/[serviceId]/page.tsx`

**Componentes**:
1. **AppointmentCalendar**: Calendário para seleção de data
2. **TimeSlots**: Lista de horários disponíveis para a data selecionada
3. **CustomerForm**: Formulário com nome, e-mail e telefone
4. **BookingSummary**: Resumo do agendamento antes da confirmação

**Estado da página**:
```typescript
interface AppointmentState {
  selectedDate: Date | null
  selectedTime: string | null
  availableSlots: string[]
  customerData: {
    name: string
    email: string
    phone: string
  }
  isLoading: boolean
}
```

### Etapa 5: Implementar Componentes da Página de Agendamento

#### 5.1. AppointmentCalendar
**Arquivo**: `src/app/booking/[customLink]/appointment/[serviceId]/components/appointment-calendar.tsx`

**Funcionalidades**:
- Exibir calendário do mês atual e próximo
- Desabilitar datas passadas
- Destacar dias com disponibilidade
- Callback para seleção de data

#### 5.2. TimeSlots
**Arquivo**: `src/app/booking/[customLink]/appointment/[serviceId]/components/time-slots.tsx`

**Funcionalidades**:
- Receber data selecionada como prop
- Buscar horários disponíveis via API
- Exibir slots em formato de grid
- Callback para seleção de horário

#### 5.3. CustomerForm
**Arquivo**: `src/app/booking/[customLink]/appointment/[serviceId]/components/customer-form.tsx`

**Funcionalidades**:
- Formulário com validação usando React Hook Form + Zod
- Campos: nome, e-mail, telefone
- Integração com validações existentes em `src/lib/validations.ts`

#### 5.4. BookingSummary
**Arquivo**: `src/app/booking/[customLink]/appointment/[serviceId]/components/booking-summary.tsx`

**Funcionalidades**:
- Exibir resumo do agendamento
- Informações do serviço, data, horário e cliente
- Botão de confirmação que cria o agendamento

### Etapa 6: Implementar Sistema de E-mails
**Arquivo**: `src/lib/email-service.ts` (estender existente)

**Novas funções**:
- `sendBookingConfirmationToCustomer()` - E-mail para o cliente
- `sendBookingNotificationToProvider()` - E-mail para o prestador
- Templates HTML para os e-mails

**Conteúdo dos e-mails**:
- **Para o cliente**: Confirmação com detalhes do agendamento, endereço, contato do prestador
- **Para o prestador**: Notificação de novo agendamento com dados do cliente

### Etapa 7: Criar Página de Confirmação
**Arquivo**: `src/app/booking/[customLink]/confirmation/[bookingId]/page.tsx`

**Funcionalidades**:
- Exibir dados do agendamento confirmado
- Informações do prestador e endereço
- Orientações para o cliente
- Link para cancelamento (futura implementação)

### Etapa 8: Adicionar Validações no Schema
**Arquivo**: `src/lib/validations.ts`

**Novas validações**:
```typescript
export const customerBookingSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  selectedDate: z.string(),
  selectedTime: z.string(),
  serviceId: z.string().cuid()
})

export type CustomerBookingData = z.infer<typeof customerBookingSchema>
```

---

## 5. Detalhes Técnicos

### 5.1. Cálculo de Horários Disponíveis

**Algoritmo**:
1. Buscar disponibilidade do prestador para o dia da semana
2. Buscar agendamentos existentes para a data específica
3. Gerar lista de slots de 30 em 30 minutos dentro da disponibilidade
4. Remover slots que conflitam com agendamentos existentes
5. Considerar duração do serviço (se serviço dura 60min, slot de 11:30 não fica disponível se disponibilidade termina às 12:00)

**Exemplo de implementação**:
```typescript
export async function getAvailableSlots(
  providerId: string,
  serviceId: string,
  date: Date
): Promise<string[]> {
  const weekday = getWeekday(date)
  const availability = await getProviderAvailabilityByWeekday(providerId, weekday)
  const service = await getServiceById(serviceId)
  const existingBookings = await getBookingsByDate(providerId, date)
  
  return calculateAvailableSlots(availability, service.duration, existingBookings)
}
```

### 5.2. Snapshot de Dados no Agendamento

Conforme o schema existente, todos os dados devem ser salvos como snapshot:
- `addressSnapshot`: Endereço do prestador
- `serviceNameSnapshot`: Nome do serviço
- `servicePriceSnapshot`: Preço do serviço
- `serviceDescriptionSnapshot`: Descrição do serviço
- `customerNameSnapshot`: Nome do cliente
- `customerEmailSnapshot`: E-mail do cliente

### 5.3. Tratamento de Conflitos

**Cenários de conflito**:
- Dois clientes tentam agendar o mesmo horário simultaneamente
- Prestador altera disponibilidade após cliente selecionar horário

**Solução**:
- Validação dupla na API antes de criar agendamento
- Transação no banco de dados
- Mensagem de erro amigável para o cliente

---

## 6. Cronograma de Implementação

### Semana 1:
- [ ] Etapa 1: Modificar modal de detalhes
- [ ] Etapa 2: Criar API routes básicas
- [ ] Etapa 3: Implementar lógica de cálculo de horários

### Semana 2:
- [ ] Etapa 4: Criar estrutura da página de agendamento
- [ ] Etapa 5.1: Implementar AppointmentCalendar
- [ ] Etapa 5.2: Implementar TimeSlots

### Semana 3:
- [ ] Etapa 5.3: Implementar CustomerForm
- [ ] Etapa 5.4: Implementar BookingSummary
- [ ] Etapa 6: Sistema de e-mails

### Semana 4:
- [ ] Etapa 7: Página de confirmação
- [ ] Etapa 8: Validações finais
- [ ] Testes integrados e refinamentos

---

## 7. Critérios de Aceitação

### 7.1. Funcionalidades Principais:
- [ ] Cliente consegue navegar do modal do serviço para a página de agendamento
- [ ] Calendário exibe apenas datas disponíveis baseado na disponibilidade do prestador
- [ ] Horários disponíveis são calculados corretamente considerando duração do serviço
- [ ] Formulário de cliente valida todos os campos obrigatórios
- [ ] Agendamento é criado com snapshot de todos os dados
- [ ] E-mails são enviados automaticamente para cliente e prestador
- [ ] Página de confirmação exibe todos os detalhes do agendamento

### 7.2. Validações:
- [ ] Não é possível agendar horários já ocupados
- [ ] Não é possível agendar em datas/horários fora da disponibilidade
- [ ] Sistema trata conflitos de agendamento simultâneo
- [ ] Dados do cliente são validados antes de criar agendamento

### 7.3. UX/UI:
- [ ] Interface responsiva em desktop e mobile
- [ ] Carregamento de horários disponíveis em menos de 2 segundos
- [ ] Feedback visual claro para seleções e estados de carregamento
- [ ] Mensagens de erro e sucesso são claras e úteis

---

## 8. Considerações de Segurança

- Validação de todos os inputs no servidor
- Rate limiting nas APIs de agendamento
- Sanitização de dados antes de salvar no banco
- Validação de existência de prestador e serviço antes de criar agendamento
- Logs de auditoria para todas as operações de agendamento
