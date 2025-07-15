"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone } from "lucide-react"

const customerFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  email: z
    .email("E-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone deve ter no máximo 15 dígitos")
    .regex(/^[\d\s\(\)\-\+]+$/, "Formato de telefone inválido")
    .trim()
})

type CustomerFormData = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void
  isLoading: boolean
}

export function CustomerForm({ onSubmit, isLoading }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema)
  })

  const handleFormSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true)
    try {
      onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Seus dados para contato</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Precisamos dessas informações para confirmar seu agendamento
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-w-md mx-auto">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome completo
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* E-mail */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            {...register("phone")}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Botão de continuar */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Validando..." : "Continuar"}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Seus dados serão utilizados apenas para confirmar o agendamento
        </p>
      </div>
    </div>
  )
}
