# Plano de Ação 006 - Cadastro de Serviços

## Objetivo
Implementar a funcionalidade completa de cadastro de serviços para prestadores, permitindo criar novos serviços através de um formulário intuitivo com validações adequadas, incluindo a regra de duração em múltiplos de 15 minutos.

## Análise do Estado Atual

### ✅ O que já temos implementado:
- Modelo `Service` no Prisma Schema com todos os campos necessários
- Dashboard funcional com sistema de navegação entre páginas
- Página de listagem de serviços (`/dashboard/services`) já implementada
- Componentes UI do shadcn/ui (Button, Card, Input, Label, Dialog)
- Sistema de validações com Zod configurado
- Sistema de autenticação Auth.js funcionando
- Função `getProviderServices()` para buscar serviços
- Estrutura básica de API routes já estabelecida

### 🔄 O que precisa ser implementado:
- Formulário de cadastro de serviços
- Validações específicas para criação de serviços (incluindo duração múltipla de 15)
- API route para criação de serviços
- Modal/página para o formulário de cadastro
- Integração com a página de listagem existente
- Feedback visual para sucesso/erro
- Atualização da listagem após criação

## Escopo da Implementação

### 📋 Funcionalidades a serem implementadas:

#### 1. **Validações de Serviço**
- Schema Zod para validação de criação de serviço
- Validação de nome (obrigatório, 2-100 caracteres)
- Validação de preço (obrigatório, valor positivo, formato monetário)
- Validação de duração (obrigatório, múltiplo de 15 minutos, mínimo 15, máximo 480)
- Validação de descrição (opcional, máximo 500 caracteres)

#### 2. **Componentes UI Necessários**
- Componente `Textarea` do shadcn/ui para descrição
- Componente `Select` do shadcn/ui para seleção de duração
- Mensagens de toast para feedback (Sonner)
- Form components integrados com react-hook-form

#### 3. **Modal de Cadastro de Serviço**
- Modal responsivo com formulário estruturado
- Campos: Nome, Preço, Duração (dropdown), Descrição
- Botões de ação: Cancelar e Criar Serviço
- Loading states durante criação
- Validação em tempo real

#### 4. **API Route para Criação**
- Endpoint POST `/api/services`
- Validação de autenticação
- Validação dos dados de entrada
- Criação do serviço no banco de dados
- Tratamento de erros adequado
- Resposta padronizada

#### 5. **Integração com a Interface Existente**
- Ativação do botão "Adicionar Novo Serviço" na página de listagem
- Atualização da listagem após criação bem-sucedida
- Integração com o estado vazio (quando não há serviços)

### 🚫 Funcionalidades que NÃO serão implementadas nesta iteração:
- Edição de serviços existentes
- Exclusão de serviços
- Configurações avançadas de disponibilidade por serviço

## Estrutura de Arquivos

### Novos arquivos a serem criados:
```
src/
├── app/
│   └── api/
│       └── services/
│           └── route.ts                    # API route para criar serviços
├── components/
│   └── ui/
│       ├── textarea.tsx                    # Componente Textarea do shadcn/ui
│       └── select.tsx                      # Componente Select do shadcn/ui (se não existir)
└── app/dashboard/services/
    └── components/
        └── create-service-modal.tsx        # Modal de cadastro de serviço
```

### Arquivos a serem modificados:
```
src/lib/validations.ts                      # Adicionar serviceCreateSchema
src/lib/services.ts                         # Adicionar função createService
src/app/dashboard/services/services-client.tsx  # Integrar modal de criação
```

## Implementação Detalhada

### 1. Schema de Validação (src/lib/validations.ts)

```typescript
// Schema para criação de serviço
export const serviceCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  price: z
    .number({
      required_error: "Preço é obrigatório",
      invalid_type_error: "Preço deve ser um número"
    })
    .positive("Preço deve ser positivo")
    .max(99999.99, "Preço deve ser menor que R$ 99.999,99"),
  duration: z
    .number({
      required_error: "Duração é obrigatória",
      invalid_type_error: "Duração deve ser um número"
    })
    .min(15, "Duração mínima é de 15 minutos")
    .max(480, "Duração máxima é de 8 horas (480 minutos)")
    .refine(
      (value) => value % 15 === 0,
      {
        message: "Duração deve ser um múltiplo de 15 minutos"
      }
    ),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .trim()
    .optional()
    .or(z.literal(""))
})

export type ServiceCreateFormData = z.infer<typeof serviceCreateSchema>
```

### 2. API Route (src/app/api/services/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../auth"
import { prisma } from "@/lib/prisma"
import { serviceCreateSchema } from "@/lib/validations"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Prestador não encontrado" },
        { status: 404 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = serviceCreateSchema.parse(body)

    // Criar serviço
    const service = await prisma.service.create({
      data: {
        ...validatedData,
        providerId: provider.id,
        description: validatedData.description || null
      }
    })

    return NextResponse.json(service, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Erro ao criar serviço:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
```

### 3. Modal de Cadastro (src/app/dashboard/services/components/create-service-modal.tsx)

```typescript
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { serviceCreateSchema, ServiceCreateFormData } from "@/lib/validations"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormField } from "@/components/ui/form-field"
import { toast } from "sonner"

// Opções de duração em múltiplos de 15
const durationOptions = [
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
  { value: 75, label: "1h 15min" },
  { value: 90, label: "1h 30min" },
  { value: 105, label: "1h 45min" },
  { value: 120, label: "2 horas" },
  { value: 150, label: "2h 30min" },
  { value: 180, label: "3 horas" },
  { value: 240, label: "4 horas" },
  { value: 300, label: "5 horas" },
  { value: 360, label: "6 horas" },
  { value: 420, label: "7 horas" },
  { value: 480, label: "8 horas" },
]

interface CreateServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateServiceModal({ isOpen, onClose, onSuccess }: CreateServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ServiceCreateFormData>({
    resolver: zodResolver(serviceCreateSchema)
  })

  const selectedDuration = watch("duration")

  const onSubmit = async (data: ServiceCreateFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar serviço")
      }

      toast.success("Serviço criado com sucesso!")
      reset()
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar serviço")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Serviço</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nome do Serviço" error={errors.name?.message} required>
            <Input
              {...register("name")}
              placeholder="Ex: Corte de cabelo masculino"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Preço (R$)" error={errors.price?.message} required>
            <Input
              {...register("price", { 
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? undefined : parseFloat(value)
              })}
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 35.00"
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Duração" error={errors.duration?.message} required>
            <Select 
              value={selectedDuration?.toString()} 
              onValueChange={(value) => setValue("duration", parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Descrição (opcional)" error={errors.description?.message}>
            <Textarea
              {...register("description")}
              placeholder="Descreva os detalhes do serviço..."
              rows={3}
              disabled={isLoading}
            />
          </FormField>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 4. Função de Serviço (src/lib/services.ts)

```typescript
// Adicionar esta função ao arquivo existente

export async function createService(data: ServiceCreateFormData, providerId: string) {
  return await prisma.service.create({
    data: {
      ...data,
      providerId,
      description: data.description || null
    }
  })
}
```

### 5. Integração com a Interface (modificação em services-client.tsx)

- Adicionar estado para controlar o modal de criação
- Ativar o botão "Adicionar Novo Serviço"
- Implementar callback para atualizar a listagem após criação
- Adicionar o modal de criação ao componente

## Critérios de Aceitação

### ✅ Critérios de Funcionalidade:
1. **Formulário de Cadastro**
   - [ ] Prestador consegue abrir modal de cadastro clicando no botão "Adicionar Novo Serviço"
   - [ ] Formulário possui todos os campos obrigatórios: nome, preço, duração
   - [ ] Campo de descrição é opcional e funcional
   - [ ] Seletor de duração oferece apenas opções múltiplas de 15 minutos
   - [ ] Validações funcionam em tempo real

2. **Validações**
   - [ ] Nome: mínimo 2 caracteres, máximo 100 caracteres
   - [ ] Preço: apenas valores positivos, formato numérico
   - [ ] Duração: apenas múltiplos de 15, entre 15 e 480 minutos
   - [ ] Descrição: máximo 500 caracteres (opcional)

3. **Integração e Feedback**
   - [ ] Serviço é criado com sucesso no banco de dados
   - [ ] Toast de sucesso é exibido após criação
   - [ ] Listagem de serviços é atualizada automaticamente
   - [ ] Modal é fechado após criação bem-sucedida
   - [ ] Formulário é resetado para próximo uso

4. **Tratamento de Erros**
   - [ ] Erros de validação são exibidos adequadamente
   - [ ] Erros de servidor são tratados com toast de erro
   - [ ] Loading states funcionam durante a criação
   - [ ] Formulário não pode ser submetido durante loading

### ✅ Critérios Técnicos:
1. **Segurança**
   - [ ] API valida autenticação antes de criar serviço
   - [ ] Dados são validados no backend com Zod
   - [ ] Prestador só consegue criar serviços para si mesmo

2. **Performance**
   - [ ] Formulário responde rapidamente às interações
   - [ ] Criação de serviço tem resposta em menos de 2 segundos
   - [ ] Modal abre/fecha sem delays perceptíveis

3. **UX/UI**
   - [ ] Interface responsiva em desktop e mobile
   - [ ] Componentes seguem design system do shadcn/ui
   - [ ] Feedback visual claro para todas as ações
   - [ ] Navegação intuitiva e sem confusão

## Riscos e Considerações

### 🚨 Riscos Identificados:
1. **Validação de Duração**: Lógica de múltiplos de 15 pode confundir usuários
   - **Mitigação**: Usar dropdown com opções pré-definidas
   
2. **Performance com Muitos Serviços**: Listagem pode ficar lenta
   - **Mitigação**: Implementar paginação em iterações futuras
   
3. **Preço com Centavos**: Formatação monetária pode gerar bugs
   - **Mitigação**: Usar input number com validação rigorosa

### 💡 Considerações de UX:
1. **Duração Intuitiva**: Mostrar durações em formato amigável (1h 30min vs 90 min)
2. **Preço Monetário**: Considerar máscara de moeda em iterações futuras
3. **Descrição Rica**: Campo de texto simples suficiente para MVP

## Dependências

### Pacotes que podem precisar ser instalados:
- `@hookform/resolvers` (se não estiver instalado)
- `react-hook-form` (se não estiver instalado)
- `sonner` (para toast notifications)

### Componentes shadcn/ui necessários:
- `textarea`
- `select` (se não existir)
- Componentes existentes: `dialog`, `button`, `input`, `label`
