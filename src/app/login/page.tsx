"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { toast } from "sonner"
import Link from "next/link"
import { loginSchema, type LoginFormData } from "@/lib/validations"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur"
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Credenciais inválidas. Verifique seu e-mail e senha.")
      } else {
        // Verificar se o login foi bem-sucedido
        const session = await getSession()
        if (session) {
          toast.success("Login realizado com sucesso!")
          router.push("/dashboard")
          router.refresh()
        }
      }
    } catch (error) {
      toast.error("Erro interno. Tente novamente mais tarde.")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <CardDescription>
            Digite suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              disabled={isLoading}
              {...register("email")}
            />
            
            <FormField
              id="password"
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              error={errors.password?.message}
              disabled={isLoading}
              {...register("password")}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link 
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link 
                href="/register" 
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
