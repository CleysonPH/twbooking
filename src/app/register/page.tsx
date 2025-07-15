"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface FormData {
  name: string
  businessName: string
  address: string
  phone: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    businessName: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    // Validar campos obrigatórios
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório")
      return false
    }
    if (!formData.businessName.trim()) {
      toast.error("Nome do negócio é obrigatório")
      return false
    }
    if (!formData.address.trim()) {
      toast.error("Endereço é obrigatório")
      return false
    }
    if (!formData.phone.trim()) {
      toast.error("Telefone é obrigatório")
      return false
    }
    if (!formData.email.trim()) {
      toast.error("Email é obrigatório")
      return false
    }
    if (!formData.password) {
      toast.error("Senha é obrigatória")
      return false
    }
    if (!formData.confirmPassword) {
      toast.error("Confirmação de senha é obrigatória")
      return false
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Formato de email inválido")
      return false
    }

    // Validar força da senha
    if (formData.password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres")
      return false
    }

    // Validar confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      toast.error("Senhas não coincidem")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Remover confirmPassword antes de enviar
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...dataToSend } = formData

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Erro ao criar conta")
        return
      }

      toast.success(`Conta criada com sucesso! Seu link personalizado: ${data.customLink}`)
      
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do Negócio</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Nome da sua empresa/negócio"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Endereço completo do seu negócio"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmação de Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
                required
              />
            </div>

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
