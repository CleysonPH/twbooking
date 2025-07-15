# Plano de Ação — Dashboard do Prestador com Estatísticas e Gráficos

Com base no levantamento de requisitos e nas decisões técnicas do projeto, segue um plano de ação detalhado para a implementação do dashboard do prestador com informações estatísticas e gráficos de faturamento:

---

## 1. Objetivos do Dashboard

Criar um dashboard completo para o prestador que apresente:

### 1.1. Cards de Estatísticas (Topo)
- **Agendamentos para hoje**: Quantidade de agendamentos para o dia atual
- **Próximos agendamentos**: Quantidade de agendamentos futuros (próximos 7 dias)
- **Faturamento do mês**: Valor total faturado no mês atual (apenas agendamentos COMPLETED)
- **Número de serviços cadastrados**: Total de serviços ativos

### 1.2. Gráfico de Faturamento por Dia
- Gráfico de linha mostrando faturamento diário
- Filtros de período: últimos 7 dias, 30 dias e 60 dias
- Tooltip em cada ponto exibindo:
  - Data
  - Quantidade de agendamentos concluídos
  - Quantidade de agendamentos cancelados
  - Quantidade de não comparecimento (no-show)
  - Total faturado no dia

---

## 2. Estado Atual do Projeto

### 2.1. Estrutura Existente
- Dashboard básico já implementado em `/src/app/dashboard/page.tsx`
- Cards estáticos já criados (sem dados dinâmicos)
- Estrutura de banco de dados completa com modelo `Booking`
- Autenticação funcionando com Auth.js
- UI Components (shadcn/ui) disponíveis

### 2.2. Dependências Disponíveis
- Next.js 15.4.1 com TypeScript
- Prisma para acesso ao banco
- Tailwind CSS + shadcn/ui para componentes
- Auth.js para sessão do usuário

---

## 3. Etapas de Implementação

### 3.1. Preparação das Dependências

**Instalar biblioteca de gráficos:**
```bash
npm install recharts
npm install @types/recharts --save-dev
```

**Justificativa:** Recharts é uma biblioteca React nativa, leve, bem documentada e com boa integração ao TypeScript.

### 3.2. Criação dos Serviços de Dados

**Arquivo: `src/lib/dashboard-stats.ts`**
- Função para buscar agendamentos do dia atual
- Função para buscar próximos agendamentos (7 dias)
- Função para calcular faturamento do mês
- Função para contar serviços ativos
- Função para buscar dados do gráfico (por período)

**Estrutura das funções:**
```typescript
export async function getTodayAppointments(providerId: string)
export async function getUpcomingAppointments(providerId: string) 
export async function getMonthlyRevenue(providerId: string)
export async function getActiveServicesCount(providerId: string)
export async function getRevenueChartData(providerId: string, days: number)
```

### 3.3. Criação dos Componentes

**3.3.1. Componente de Cards Estatísticos**
**Arquivo: `src/app/dashboard/components/stats-cards.tsx`**
- Componente reutilizável para exibir os cards
- Props tipadas para cada tipo de estatística
- Loading states durante carregamento
- Formatação adequada de valores (moeda, números)

**3.3.2. Componente do Gráfico de Faturamento**
**Arquivo: `src/app/dashboard/components/revenue-chart.tsx`**
- Gráfico de linha usando Recharts
- Botões de filtro (7, 30, 60 dias)
- Tooltip personalizado com todas as informações
- Responsividade para mobile
- Loading state durante carregamento

**3.3.3. Componente de Filtros de Período**
**Arquivo: `src/app/dashboard/components/period-filter.tsx`**
- Botões para alternar entre períodos
- Estado ativo visual
- Integração com o gráfico

### 3.4. Atualização da Página Principal

**Arquivo: `src/app/dashboard/page.tsx`**
- Remover cards estáticos existentes
- Integrar novos componentes
- Implementar carregamento de dados server-side
- Tratamento de erros e estados de loading
- Manter estrutura de layout existente

### 3.5. Criação de API Routes (se necessário)

**Arquivo: `src/app/api/dashboard/stats/route.ts`**
- Endpoint para buscar estatísticas gerais
- Validação de autenticação
- Cache de dados quando apropriado

**Arquivo: `src/app/api/dashboard/revenue-chart/route.ts`**
- Endpoint para dados do gráfico
- Parâmetro de período (7, 30, 60 dias)
- Otimização de consultas

### 3.6. Tipagens TypeScript

**Arquivo: `src/lib/dashboard-types.ts`**
```typescript
export interface DashboardStats {
  todayAppointments: number
  upcomingAppointments: number
  monthlyRevenue: number
  activeServices: number
}

export interface ChartDataPoint {
  date: string
  revenue: number
  completed: number
  cancelled: number
  noShow: number
}

export type PeriodFilter = 7 | 30 | 60
```

---

## 4. Consultas de Banco de Dados

### 4.1. Estatísticas dos Cards

```typescript
// Agendamentos de hoje
const todayStart = startOfDay(new Date())
const todayEnd = endOfDay(new Date())

const todayBookings = await prisma.booking.count({
  where: {
    providerId,
    dateTime: {
      gte: todayStart,
      lte: todayEnd
    }
  }
})

// Faturamento do mês (apenas COMPLETED)
const monthStart = startOfMonth(new Date())
const monthEnd = endOfMonth(new Date())

const monthlyRevenue = await prisma.booking.aggregate({
  where: {
    providerId,
    status: 'COMPLETED',
    dateTime: {
      gte: monthStart,
      lte: monthEnd
    }
  },
  _sum: {
    servicePriceSnapshot: true
  }
})
```

### 4.2. Dados do Gráfico

```typescript
// Agrupamento por dia com contadores por status
const chartData = await prisma.booking.groupBy({
  by: ['dateTime'],
  where: {
    providerId,
    dateTime: {
      gte: startDate,
      lte: endDate
    }
  },
  _count: {
    status: true
  },
  _sum: {
    servicePriceSnapshot: true
  }
})
```

---

## 5. Estrutura de Arquivos

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx (atualizado)
│   │   └── components/
│   │       ├── stats-cards.tsx (novo)
│   │       ├── revenue-chart.tsx (novo)
│   │       └── period-filter.tsx (novo)
│   └── api/
│       └── dashboard/
│           ├── stats/
│           │   └── route.ts (novo)
│           └── revenue-chart/
│               └── route.ts (novo)
└── lib/
    ├── dashboard-stats.ts (novo)
    └── dashboard-types.ts (novo)
```

---

## 6. Checklist de Implementação

### 6.1. Preparação
- [ ] Instalar dependência `recharts`
- [ ] Criar tipos TypeScript para dashboard
- [ ] Criar utilitários para consultas de banco

### 6.2. Componentes
- [ ] Implementar componente de cards estatísticos
- [ ] Implementar componente de gráfico de faturamento
- [ ] Implementar filtros de período
- [ ] Adicionar loading states e tratamento de erros

### 6.3. Lógica de Negócio
- [ ] Implementar consultas para estatísticas dos cards
- [ ] Implementar consultas para dados do gráfico
- [ ] Otimizar consultas de banco de dados
- [ ] Adicionar cache quando necessário

### 6.4. Interface
- [ ] Integrar componentes na página principal
- [ ] Garantir responsividade mobile
- [ ] Implementar tooltips informativos
- [ ] Validar acessibilidade

### 6.5. Testes e Validação
- [ ] Testar com dados reais
- [ ] Validar cálculos de faturamento
- [ ] Testar filtros de período
- [ ] Verificar performance das consultas

---

## 7. Considerações Técnicas

### 7.1. Performance
- Usar consultas otimizadas com agregações no banco
- Implementar cache para dados que não mudam frequentemente
- Carregar dados de forma assíncrona quando possível

### 7.2. Experiência do Usuário
- Loading skeletons durante carregamento
- Estados de erro informativos
- Tooltips explicativos nos gráficos
- Responsividade completa

### 7.3. Escalabilidade
- Estrutura preparada para adicionar novos tipos de gráficos
- Componentes reutilizáveis
- Tipagem forte para prevenir erros

---

## 8. Estimativa de Tempo

- **Preparação e tipos**: 2 horas
- **Componentes de UI**: 6 horas
- **Lógica de dados**: 4 horas
- **Integração e testes**: 3 horas
- **Refinamentos e polish**: 2 horas

**Total estimado**: 17 horas

---

## 9. Requisitos Atendidos

Este plano atende aos seguintes requisitos do levantamento:

- **Requisito 5.1.2**: Dashboard com visualização de agendamentos
- **Requisito 5.1.6**: Resumo financeiro mensal
- **Requisitos Não Funcionais**: Interface responsiva e tempo de resposta < 2s

---

## 10. Próximos Passos

Após implementação do dashboard básico, considerar:
- Gráficos adicionais (pizza para distribuição de status)
- Filtros mais avançados (por serviço, por período customizado)
- Exportação de relatórios
- Métricas de crescimento (comparação com mês anterior)
