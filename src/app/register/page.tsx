"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { registerSchema, type RegisterFormData } from "@/lib/validations"
import { handleApiErrors, type ApiErrorResponse } from "@/lib/form-utils"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur"
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      // Remover confirmPassword antes de enviar
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...dataToSend } = data

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (!response.ok) {
        // Usar a função utilitária para lidar com erros
        handleApiErrors<RegisterFormData>(result, setError)
        return
      }

      toast.success(`Conta criada com sucesso! Seu link personalizado: ${result.customLink}`)
      
      // Redirecionar para o login após 2 segundos
      setTimeout(() => {
        router.push("/login")
      }, 2000)

    } catch (err) {
      console.error("Erro:", err)
      toast.error("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cadastrar Conta</CardTitle>
          <CardDescription>
            Crie sua conta para gerenciar seus agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              id="name"
              label="Nome"
              type="text"
              placeholder="Seu nome completo"
              error={errors.name?.message}
              {...register("name")}
            />

            <FormField
              id="businessName"
              label="Nome do Negócio"
              type="text"
              placeholder="Nome da sua empresa/negócio"
              error={errors.businessName?.message}
              {...register("businessName")}
            />

            <FormField
              id="address"
              label="Endereço"
              type="text"
              placeholder="Endereço completo do seu negócio"
              error={errors.address?.message}
              {...register("address")}
            />

            <FormField
              id="phone"
              label="Telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <FormField
              id="password"
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register("password")}
            />

            <FormField
              id="confirmPassword"
              label="Confirmação de Senha"
              type="password"
              placeholder="Digite a senha novamente"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <a href="/login" className="text-primary hover:underline">
              Fazer login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
