# Plano de Implementação: Atualização de Serviços (Update Services)

## 📋 Contexto

Implementar a funcionalidade de atualização/edição de serviços no sistema TW Booking, permitindo que prestadores de serviço possam editar os dados de seus serviços já cadastrados.

## 🎯 Objetivos

- Permitir que prestadores editem serviços existentes (nome, preço, duração, descrição)
- Implementar controle de ativação/desativação de serviços (toggle isActive)
- Manter consistência de dados e validações
- Garantir que apenas o proprietário do serviço possa editá-lo
- Atualizar interface de usuário para suportar a edição

## 📊 Estado Atual do Projeto

### ✅ Já Implementado
- CRUD parcial de serviços (Create, Read)
- API endpoint GET `/api/services/[id]` para buscar serviço específico
- Validação `serviceCreateSchema` no arquivo `validations.ts`
- Modal de detalhes do serviço (`ServiceDetailModal`) com botão "Editar" (desabilitado)
- Função utilitária `getServiceById()` em `lib/services.ts`
- Interface de listagem e visualização de serviços

### ❌ Faltando Implementar
- API endpoint PUT/PATCH `/api/services/[id]` para atualização
- Schema de validação específico para update (opcional se reutilizar o create)
- Modal de edição de serviço (`EditServiceModal`)
- Função utilitária `updateService()` em `lib/services.ts`
- Integração do botão "Editar" no `ServiceDetailModal`
- Atualização da lista após edição

## 🚀 Plano de Implementação

### Fase 1: Backend - API e Validações (2-3 horas)

#### 1.1. Atualizar validações (`src/lib/validations.ts`)
- [ ] Criar `serviceUpdateSchema` baseado no `serviceCreateSchema`
- [ ] Adicionar type `ServiceUpdateFormData`
- [ ] Considerar campos opcionais para updates parciais

#### 1.2. Implementar funções utilitárias (`src/lib/services.ts`)
- [ ] Adicionar função `updateService(serviceId, data, providerId)`
- [ ] Adicionar função `toggleServiceStatus(serviceId, providerId)` (para ativar/desativar)

#### 1.3. Implementar API endpoint (`src/app/api/services/[id]/route.ts`)
- [ ] Adicionar método `PUT` para atualização completa
- [ ] Adicionar método `PATCH` para atualizações parciais (como toggle status)
- [ ] Implementar validação de propriedade (service pertence ao provider logado)
- [ ] Implementar tratamento de erros apropriado

### Fase 2: Frontend - Componentes e Interface (3-4 horas)

#### 2.1. Criar modal de edição (`src/app/dashboard/services/components/edit-service-modal.tsx`)
- [ ] Criar componente `EditServiceModal` baseado no `CreateServiceModal`
- [ ] Implementar formulário pré-preenchido com dados atuais
- [ ] Adicionar validação client-side
- [ ] Implementar chamada para API de update
- [ ] Adicionar feedback visual (loading, success, error)

#### 2.2. Atualizar modal de detalhes (`src/app/dashboard/components/service-detail-modal.tsx`)
- [ ] Habilitar botão "Editar Serviço"
- [ ] Adicionar prop `onEdit` para comunicação com componente pai
- [ ] Implementar toggle de status ativo/inativo diretamente no modal
- [ ] Atualizar dados após edição sem fechar o modal

#### 2.3. Atualizar cliente de serviços (`src/app/dashboard/services/services-client.tsx`)
- [ ] Adicionar estado para controlar modal de edição
- [ ] Implementar função `handleEditService` 
- [ ] Atualizar lista de serviços após edição
- [ ] Adicionar o componente `EditServiceModal`

### Fase 3: Integração e Testes (1-2 horas)

#### 3.1. Testes funcionais
- [ ] Testar edição de todos os campos do serviço
- [ ] Testar validações client e server-side
- [ ] Testar toggle de status ativo/inativo
- [ ] Testar casos de erro (serviço não encontrado, não autorizado)
- [ ] Testar atualização da interface após edição

#### 3.2. Refinamentos de UX
- [ ] Adicionar confirmação antes de desativar serviço
- [ ] Melhorar feedback visual durante operações
- [ ] Adicionar loading states apropriados
- [ ] Verificar responsividade dos modals

## 🏗️ Arquivos a Criar/Modificar

### Novos Arquivos
```
src/app/dashboard/services/components/
├── edit-service-modal.tsx           # Modal de edição de serviço
```

### Arquivos a Modificar
```
src/lib/
├── validations.ts                   # Adicionar serviceUpdateSchema
├── services.ts                      # Adicionar funções de update

src/app/api/services/[id]/
├── route.ts                         # Adicionar métodos PUT/PATCH

src/app/dashboard/
├── services/services-client.tsx     # Integrar modal de edição
├── components/service-detail-modal.tsx  # Habilitar edição e toggle

```

## 📝 Especificações Técnicas

### API Endpoints
```typescript
// PUT /api/services/[id] - Atualização completa
{
  name: string
  price: number
  duration: number
  description?: string
}

// PATCH /api/services/[id] - Atualização parcial (toggle status)
{
  isActive: boolean
}
```

### Validações
- Reutilizar `serviceCreateSchema` para updates ou criar `serviceUpdateSchema`
- Validar propriedade do serviço (providerId)
- Manter validações de negócio (preço positivo, duração múltipla de 15min, etc.)

### UX/UI Guidelines
- Formulário de edição idêntico ao de criação, mas pré-preenchido
- Indicação visual clara de que está em modo edição
- Confirmação antes de desativar serviços
- Feedback imediato após operações
- Manter consistência com design existente (shadcn/ui + Tailwind)

## ⚠️ Considerações Especiais

### Segurança
- Validar sempre que o serviço pertence ao provider logado
- Sanitizar inputs para prevenir XSS
- Rate limiting na API (já implementado no projeto)

### Performance
- Evitar re-renders desnecessários na lista de serviços
- Otimizar chamadas à API (usar cache quando apropriado)
- Loading states para melhor percepção de performance

### Consistência de Dados
- Ao desativar serviço, considerar impacto em agendamentos futuros
- Manter histórico de alterações (timestamps já existem)
- Validar dados no cliente e servidor

## 🎯 Critérios de Aceitação

- [ ] Prestador consegue editar nome, preço, duração e descrição de um serviço
- [ ] Prestador consegue ativar/desativar serviços via toggle
- [ ] Formulário de edição vem pré-preenchido com dados atuais
- [ ] Validações funcionam corretamente (client e server-side)
- [ ] Apenas o proprietário do serviço pode editá-lo
- [ ] Interface atualiza automaticamente após edição
- [ ] Feedback visual adequado em todas as operações
- [ ] Funcionalidade é responsiva (desktop e mobile)

## 📅 Estimativa de Tempo

**Total: 6-9 horas de desenvolvimento**

- Backend (API + validações): 2-3h
- Frontend (componentes + integração): 3-4h  
- Testes e refinamentos: 1-2h

## 🔄 Próximos Passos Após Implementação

1. Implementar exclusão de serviços (delete)
2. Adicionar ordenação e filtros na lista de serviços
3. Implementar histórico de alterações
4. Adicionar métricas de uso por serviço
