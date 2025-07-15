"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
    control,
    reset,
    formState: { errors }
  } = useForm<ServiceCreateFormData>({
    resolver: zodResolver(serviceCreateSchema)
  })

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
          <div className="space-y-2">
            <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-destructive">
              Nome do Serviço
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Corte de cabelo masculino"
              disabled={isLoading}
              className={cn(
                errors.name && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="after:content-['*'] after:ml-0.5 after:text-destructive">
              Preço (R$)
            </Label>
            <Input
              id="price"
              {...register("price", { 
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? undefined : parseFloat(value)
              })}
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 35.00"
              disabled={isLoading}
              className={cn(
                errors.price && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.price && (
              <p className="text-sm text-destructive" role="alert">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="after:content-['*'] after:ml-0.5 after:text-destructive">
              Duração
            </Label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value?.toString()} 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn(
                    errors.duration && "border-destructive focus-visible:ring-destructive"
                  )}>
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
              <p className="text-sm text-destructive" role="alert">
                {errors.duration.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva os detalhes do serviço..."
              rows={3}
              disabled={isLoading}
              className={cn(
                errors.description && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

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
