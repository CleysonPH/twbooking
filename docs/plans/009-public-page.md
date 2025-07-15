# Plano de Ação — Implementação da Página Pública do Prestador

Com base no levantamento de requisitos e nas decisões técnicas do projeto, segue um plano de ação detalhado para a implementação da página pública do prestador, acessível via `/booking/{customLink}`:

---

## 1. Objetivo da Página Pública

Criar uma página pública que permita aos clientes visualizar as informações básicas de um prestador de serviços e seus serviços disponíveis, sem necessidade de autenticação. Esta é a primeira etapa antes da implementação completa do sistema de agendamento.

### Funcionalidades desta fase:
- Exibir informações básicas do prestador (nome, nome do negócio, endereço, telefone)
- Listar serviços ativos do prestador em formato de cards
- Layout responsivo e atrativo para o cliente
- Tratamento de erros (prestador não encontrado, link inválido)

---

## 2. Estrutura Técnica

### 2.1. Rota Dinâmica
- **Arquivo**: `src/app/booking/[customLink]/page.tsx`
- **Padrão**: `/booking/{customLink}` onde `customLink` é único para cada prestador
- **Tipo**: Server Component com busca no banco de dados

### 2.2. Estrutura de Dados
Conforme o schema Prisma existente:
- **Provider**: name, businessName, address, phone, customLink
- **Service**: name, price, duration, description, isActive

### 2.3. Componentes Necessários
- **PublicProviderPage**: Componente principal da página
- **PublicServiceCard**: Card para exibir serviços (versão simplificada do ServiceCard existente)
- **ProviderInfo**: Componente para exibir informações do prestador

---

## 3. Etapas de Implementação

### 3.1. Criação da Função de Busca do Prestador
**Arquivo**: `src/lib/services.ts` (estender arquivo existente)

```typescript
// Adicionar função para buscar prestador por customLink
export async function getProviderByCustomLink(customLink: string) {
  return await prisma.provider.findUnique({
    where: { customLink },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
}
```

### 3.2. Criação da Página Principal
**Arquivo**: `src/app/booking/[customLink]/page.tsx`

Funcionalidades:
- Receber o parâmetro `customLink` da URL
- Buscar o prestador e seus serviços ativos
- Renderizar informações do prestador e lista de serviços
- Tratar caso de prestador não encontrado (404)
- Implementar metadata dinâmica para SEO

### 3.3. Componente de Informações do Prestador
**Arquivo**: `src/app/booking/[customLink]/components/provider-info.tsx`

Exibir:
- Nome do prestador e nome do negócio
- Endereço formatado
- Telefone (com link para WhatsApp/chamada)
- Layout atrativo com ícones

### 3.4. Componente de Card de Serviço Público
**Arquivo**: `src/app/booking/[customLink]/components/public-service-card.tsx`

Baseado no `ServiceCard` existente, mas adaptado para cliente:
- Remover badge de status (só serviços ativos são exibidos)
- Remover funcionalidade de clique para edição
- Adicionar descrição do serviço (se disponível)
- Layout otimizado para visualização do cliente

### 3.5. Página de Layout Específica (Opcional)
**Arquivo**: `src/app/booking/layout.tsx`

- Layout mais limpo, sem navegação do dashboard
- Header simples com logo do TWBooking
- Footer minimalista

---

## 4. Tratamento de Erros

### 4.1. Prestador Não Encontrado
- Verificar se o `customLink` existe no banco
- Exibir página 404 personalizada com opção de voltar à home
- Log do erro para monitoramento

### 4.2. Serviços Indisponíveis
- Caso o prestador não tenha serviços ativos
- Exibir mensagem informativa

---

## 5. Aspectos de UX/UI

### 5.1. Design Responsivo
- Layout otimizado para mobile-first
- Cards de serviços adaptáveis
- Informações do prestador bem organizadas

### 5.2. Performance
- Server-side rendering para melhor SEO
- Imagens otimizadas (se aplicável)
- Carregamento rápido da página

### 5.3. Acessibilidade
- Uso adequado de headings (h1, h2, h3)
- Contraste adequado
- Navegação por teclado

---

## 6. Estrutura de Arquivos

```
src/app/booking/
├── layout.tsx (opcional)
└── [customLink]/
    ├── page.tsx
    ├── not-found.tsx (opcional)
    └── components/
        ├── provider-info.tsx
        └── public-service-card.tsx
```

---

## 7. Checklist de Implementação

### Etapa 1: Funcionalidades Base
- [ ] Criar função `getProviderByCustomLink` em `src/lib/services.ts`
- [ ] Implementar página principal `src/app/booking/[customLink]/page.tsx`
- [ ] Criar componente `ProviderInfo`
- [ ] Criar componente `PublicServiceCard`
- [ ] Implementar tratamento de erro 404

### Etapa 2: Refinamentos
- [ ] Implementar layout específico para páginas de booking (opcional)
- [ ] Adicionar metadata dinâmica para SEO
- [ ] Criar página not-found personalizada
- [ ] Otimizar responsividade

### Etapa 3: Testes e Validação
- [ ] Testar com diferentes prestadores
- [ ] Validar responsividade em dispositivos móveis
- [ ] Testar casos de erro (link inválido, sem serviços)
- [ ] Verificar performance de carregamento

---

## 8. Considerações Futuras

Esta implementação prepara o terreno para as próximas funcionalidades:
- Sistema de agendamento online
- Calendário de disponibilidade
- Formulário de contato do cliente
- Integração com sistema de notificações

---

## 9. Estimativa de Tempo

- **Etapa 1**: 2-3 horas
- **Etapa 2**: 1-2 horas  
- **Etapa 3**: 1 hora
- **Total**: 4-6 horas

---

## 10. Dependências

- Schema Prisma já implementado ✅
- Sistema de autenticação funcionando ✅
- Componentes shadcn/ui disponíveis ✅
- Função `getProviderServices` existente (para referência) ✅
