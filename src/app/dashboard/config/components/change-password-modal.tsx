"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validations"
import { toast } from "sonner"

interface ChangePasswordModalProps {
  children: React.ReactNode
}

export function ChangePasswordModal({ children }: ChangePasswordModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ChangePasswordFormData) => (
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
      const validationResult = changePasswordSchema.safeParse(formData)
      
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
      const response = await fetch("/api/provider/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(validationResult.data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao alterar senha")
      }

      toast.success("Senha alterada com sucesso!")
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      })
      setOpen(false)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Erro inesperado ao alterar senha")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setOpen(false)
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      })
      setErrors({})
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange("currentPassword")}
              disabled={loading}
              required
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange("newPassword")}
              disabled={loading}
              required
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={formData.confirmNewPassword}
              onChange={handleInputChange("confirmNewPassword")}
              disabled={loading}
              required
            />
            {errors.confirmNewPassword && (
              <p className="text-sm text-destructive">{errors.confirmNewPassword}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
