"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Availability } from "@prisma/client"
import { availabilityCreateSchema, AvailabilityFormData } from "@/lib/validations"

interface AvailabilityFormProps {
  initialData?: Availability
  onSubmit: (data: AvailabilityFormData) => Promise<void>
  loading?: boolean
}

const weekdayOptions = [
  { value: 'MONDAY', label: 'Segunda-feira' },
  { value: 'TUESDAY', label: 'Terça-feira' },
  { value: 'WEDNESDAY', label: 'Quarta-feira' },
  { value: 'THURSDAY', label: 'Quinta-feira' },
  { value: 'FRIDAY', label: 'Sexta-feira' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
]

export function AvailabilityForm({ 
  initialData, 
  onSubmit, 
  loading = false 
}: AvailabilityFormProps) {
  const [weekday, setWeekday] = useState<AvailabilityFormData['weekday']>(
    initialData?.weekday as AvailabilityFormData['weekday'] || 'MONDAY'
  )
  const [startTime, setStartTime] = useState(
    initialData?.startTime.substring(0, 5) || '09:00'
  )
  const [endTime, setEndTime] = useState(
    initialData?.endTime.substring(0, 5) || '18:00'
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const data = { weekday, startTime, endTime }
    
    try {
      // Validar com Zod
      const validatedData = availabilityCreateSchema.parse(data)
      await onSubmit(validatedData)
      
      // Limpar formulário se for criação
      if (!initialData) {
        setWeekday('MONDAY')
        setStartTime('09:00')
        setEndTime('18:00')
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        // Erro de validação Zod
        const formattedErrors: Record<string, string> = {}
        const zodError = error as { errors: Array<{ path: string[]; message: string }> }
        zodError.errors.forEach((err) => {
          if (err.path?.length > 0) {
            formattedErrors[err.path[0]] = err.message
          }
        })
        setErrors(formattedErrors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weekday">Dia da Semana</Label>
        <Select value={weekday} onValueChange={(value) => setWeekday(value as AvailabilityFormData['weekday'])}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o dia" />
          </SelectTrigger>
          <SelectContent>
            {weekdayOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.weekday && (
          <p className="text-sm text-destructive">{errors.weekday}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Horário de Início</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          {errors.startTime && (
            <p className="text-sm text-destructive">{errors.startTime}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Horário de Término</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          {errors.endTime && (
            <p className="text-sm text-destructive">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Preview do horário selecionado */}
      <div className="p-3 bg-muted rounded-md">
        <p className="text-sm font-medium">Preview:</p>
        <p className="text-sm text-muted-foreground">
          {weekdayOptions.find(opt => opt.value === weekday)?.label} - {startTime} às {endTime}
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')}
        </Button>
      </div>
    </form>
  )
}
