# Plano de Ação 005 - Listagem e Detalhes de Serviços

## Objetivo
Implementar a funcionalidade de listagem e visualização de detalhes de serviços no dashboard do prestador, permitindo navegar entre os serviços cadastrados e visualizar informações completas de cada serviço.

## Análise do Estado Atual

### ✅ O que já temos implementado:
- Modelo `Service` no Prisma Schema com todos os campos necessários
- Dashboard básico funcional com autenticação
- Componentes UI do shadcn/ui (Button, Card, Input, Label)
- Validações com Zod já configuradas
- Sistema de autenticação Auth.js funcionando

### 🔄 O que precisa ser implementado:
- Barra de navegação no dashboard
- Página de listagem de serviços
- Modal de detalhes do serviço
- Componentes UI adicionais (Dialog, Switch, Badge)
- API routes para buscar serviços
- Validações específicas para serviços

## Escopo da Implementação

### 📋 Funcionalidades a serem implementadas:
1. **Barra de Navegação no Dashboard**
   - Link para "Serviços"
   - Link para "Dashboard" (home)
   - Botão de logout mantido

2. **Página de Listagem de Serviços**
   - Cards com informações essenciais (nome, preço, duração, status ativo/inativo)
   - Botão "Adicionar Novo Serviço" (placeholder)
   - Cards clicáveis para abrir modal de detalhes

3. **Modal de Detalhes do Serviço**
   - Exibição completa das informações do serviço
   - Toggle para ativar/desativar serviço (placeholder)
   - Botão "Editar Serviço" (placeholder)

### 🚫 Funcionalidades que NÃO serão implementadas nesta iteração:
- Criação de novos serviços
- Edição de serviços
- Exclusão de serviços
- Funcionalidade real dos toggles e botões de ação

## Estrutura de Arquivos

### Novos arquivos a serem criados:
```
src/
├── app/
│   └── dashboard/
│       ├── services/
│       │   └── page.tsx                    # Página de listagem de serviços
│       └── components/
│           ├── dashboard-nav.tsx           # Barra de navegação
│           ├── service-card.tsx            # Card individual do serviço
│           └── service-detail-modal.tsx    # Modal de detalhes
├── components/ui/
│   ├── dialog.tsx                          # Componente Dialog do shadcn/ui
│   ├── switch.tsx                          # Componente Switch do shadcn/ui
│   └── badge.tsx                           # Componente Badge do shadcn/ui
└── lib/
    └── services.ts                         # Funções para buscar serviços
```

### Arquivos a serem modificados:
```
src/
├── app/
│   └── dashboard/
│       └── page.tsx                        # Adicionar navegação
└── lib/
    └── validations.ts                      # Adicionar schemas de serviços
```

## Detalhamento Técnico

### 1. Componentes UI (shadcn/ui)
**Instalar componentes necessários:**
```bash
npx shadcn@latest add dialog switch badge
```

### 2. Schema de Validação (validations.ts)
```typescript
// Schema para detalhes de serviço (apenas leitura)
export const serviceDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  duration: z.number(),
  description: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type ServiceDetail = z.infer<typeof serviceDetailSchema>
```

### 3. Funções de Serviço (services.ts)
```typescript
import { prisma } from "./prisma"

export async function getProviderServices(providerId: string) {
  return await prisma.service.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getServiceById(serviceId: string, providerId: string) {
  return await prisma.service.findFirst({
    where: { 
      id: serviceId,
      providerId 
    }
  })
}
```

### 4. Dashboard Navigation Component
```typescript
interface DashboardNavProps {
  currentPath?: string
}

export function DashboardNav({ currentPath }: DashboardNavProps) {
  // Links: Dashboard, Serviços
  // Indicador visual da página atual
  // Design responsivo
}
```

### 5. Service Card Component
```typescript
interface ServiceCardProps {
  service: {
    id: string
    name: string
    price: number
    duration: number
    isActive: boolean
  }
  onCardClick: (serviceId: string) => void
}

export function ServiceCard({ service, onCardClick }: ServiceCardProps) {
  // Card clicável
  // Badge de status (Ativo/Inativo)
  // Formatação de preço e duração
  // Hover states
}
```

### 6. Service Detail Modal
```typescript
interface ServiceDetailModalProps {
  serviceId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ServiceDetailModal({ serviceId, isOpen, onClose }: ServiceDetailModalProps) {
  // Fetch detalhes do serviço
  // Display completo das informações
  // Toggle switch (placeholder)
  // Botão editar (placeholder)
  // Loading e error states
}
```

## Fluxo de Navegação

### Usuário no Dashboard:
1. **Dashboard Inicial** → Clica em "Serviços" na navegação
2. **Página de Serviços** → Visualiza lista de serviços em cards
3. **Clica em um Card** → Abre modal com detalhes completos
4. **Modal de Detalhes** → Visualiza informações, pode fechar modal
5. **Volta para Listagem** → Pode clicar em outros serviços

### Estados da Interface:
- **Loading**: Enquanto carrega serviços
- **Empty State**: Quando não há serviços cadastrados
- **Error State**: Em caso de erro na busca
- **Success State**: Lista de serviços exibida

## Responsividade

### Breakpoints:
- **Mobile (< 768px)**: Cards em coluna única, modal fullscreen
- **Tablet (768px - 1024px)**: Cards em 2 colunas
- **Desktop (> 1024px)**: Cards em 3 colunas, modal centralizada

## Critérios de Aceitação

### ✅ Funcionalidade:
- [ ] Barra de navegação funcional no dashboard
- [ ] Página de serviços carrega lista de serviços do prestador logado
- [ ] Cards de serviços exibem informações essenciais
- [ ] Clique no card abre modal com detalhes completos
- [ ] Modal pode ser fechada e reaberta
- [ ] Botões de ação são exibidos (mas não funcionam)

### ✅ UX/UI:
- [ ] Interface responsiva em todos os breakpoints
- [ ] Loading states durante carregamento
- [ ] Empty state quando não há serviços
- [ ] Navegação intuitiva entre páginas
- [ ] Design consistente com o restante da aplicação

### ✅ Técnico:
- [ ] Código TypeScript sem erros
- [ ] Componentes reutilizáveis e bem estruturados
- [ ] Validação de tipos com Zod
- [ ] Tratamento adequado de erros
- [ ] Performance otimizada (sem re-renders desnecessários)

## Próximos Passos (Futuras Iterações)

### Plano 006 - CRUD de Serviços:
- Implementar criação de serviços
- Implementar edição de serviços
- Implementar ativação/desativação de serviços
- Implementar exclusão de serviços (soft delete)

### Plano 007 - Validações e Melhorias:
- Validações de negócio para serviços
- Otimizações de performance
- Testes unitários
- Melhorias de UX

## Estimativa de Tempo
**Total estimado: 8-12 horas**

- Setup componentes UI: 1h
- Navegação dashboard: 2h
- Página listagem: 3h
- Modal detalhes: 3h
- Responsividade e refinamentos: 2-3h
- Testes e ajustes: 1-2h

## Riscos e Considerações

### 🔴 Riscos:
- Complexidade do estado do modal pode gerar bugs
- Performance com muitos serviços (paginação futura)
- Inconsistências de design sem design system completo

### 🟡 Mitigações:
- Usar estado local simples para modal
- Limitar exibição inicial (ordenar por mais recentes)
- Seguir padrões do shadcn/ui rigorosamente
- Manter componentes pequenos e focados

### 💡 Oportunidades:
- Estabelecer padrões de modal para outras funcionalidades
- Criar base sólida para CRUD futuro
- Melhorar arquitetura de componentes do dashboard
