"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { serviceUpdateSchema, ServiceUpdateFormData } from "@/lib/validations"
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  isActive: boolean
}

interface EditServiceModalProps {
  service: Service | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditServiceModal({ service, isOpen, onClose, onSuccess }: EditServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ServiceUpdateFormData>({
    resolver: zodResolver(serviceUpdateSchema)
  })

  // Preencher formulário quando o modal abrir com dados do serviço
  useEffect(() => {
    if (service && isOpen) {
      setValue("name", service.name)
      setValue("price", service.price)
      setValue("duration", service.duration)
      setValue("description", service.description || "")
    }
  }, [service, isOpen, setValue])

  const onSubmit = async (data: ServiceUpdateFormData) => {
    if (!service) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar serviço")
      }

      toast.success("Serviço atualizado com sucesso!")
      reset()
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar serviço")
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome do serviço */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do serviço *</Label>
            <Input
              id="name"
              placeholder="Ex: Corte de cabelo"
              {...register("name")}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              max="99999.99"
              placeholder="0,00"
              {...register("price", { 
                valueAsNumber: true,
                setValueAs: (value) => parseFloat(value) || 0
              })}
              className={cn(errors.price && "border-destructive")}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          {/* Duração */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duração *</Label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger className={cn(errors.duration && "border-destructive")}>
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
              )}
            />
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição opcional do serviço..."
              rows={3}
              {...register("description")}
              className={cn(errors.description && "border-destructive")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
