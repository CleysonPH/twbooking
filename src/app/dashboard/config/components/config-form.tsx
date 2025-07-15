"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordModal } from "./change-password-modal"
import { providerUpdateSchema, type ProviderUpdateFormData } from "@/lib/validations"
import { toast } from "sonner"
import type { ProviderProfile } from "@/lib/provider"

interface ConfigFormProps {
  provider: ProviderProfile
}

export function ConfigForm({ provider }: ConfigFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProviderUpdateFormData>({
    name: provider.name,
    businessName: provider.businessName,
    phone: provider.phone,
    customLink: provider.customLink,
    address: provider.address
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ProviderUpdateFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validação client-side
      const validationResult = providerUpdateSchema.safeParse(formData)
      
      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {}
        validationResult.error.issues.forEach(issue => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message
          }
        })
        setErrors(fieldErrors)
        return
      }

      // Chamada para a API
      const response = await fetch("/api/provider", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(validationResult.data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar dados")
      }

      const updatedProvider = await response.json()
      
      // Atualizar dados locais com a resposta do servidor
      setFormData({
        name: updatedProvider.name,
        businessName: updatedProvider.businessName,
        phone: updatedProvider.phone,
        customLink: updatedProvider.customLink,
        address: updatedProvider.address
      })

      toast.success("Dados atualizados com sucesso!")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Erro inesperado ao atualizar dados")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulário de Dados Pessoais - 2 colunas */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e configurações do negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Pessoal</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    disabled={loading}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Nome do Negócio</Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleInputChange("businessName")}
                    disabled={loading}
                    required
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive">{errors.businessName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={provider.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                    disabled={loading}
                    required
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customLink">Link Personalizado</Label>
                  <Input
                    id="customLink"
                    type="text"
                    value={formData.customLink}
                    onChange={handleInputChange("customLink")}
                    disabled={loading}
                    required
                  />
                  {errors.customLink && (
                    <p className="text-sm text-destructive">{errors.customLink}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Usado para criar sua página pública de agendamento
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange("address")}
                  disabled={loading}
                  required
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Endereço onde os serviços são prestados
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Card de Alteração de Senha - 1 coluna */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Altere sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordModal>
              <Button variant="outline" className="w-full">
                Alterar Senha
              </Button>
            </ChangePasswordModal>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
