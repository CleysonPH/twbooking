"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Loader2 } from "lucide-react"

interface TimeSlotsProps {
  providerId: string
  serviceId: string
  selectedDate: Date
  onTimeSelect: (time: string) => void
  onAvailableSlotsUpdate: (slots: string[]) => void
  onLoadingChange: (loading: boolean) => void
}

export function TimeSlots({ 
  providerId, 
  serviceId, 
  selectedDate, 
  onTimeSelect, 
  onAvailableSlotsUpdate,
  onLoadingChange
}: TimeSlotsProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long", 
      day: "numeric"
    }).format(date)
  }

  const formatTime = (time: string) => {
    return time
  }

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setIsLoading(true)
      onLoadingChange(true)
      setError(null)

      try {
        // Corrigir problema de timezone - usar data local ao invés de UTC
        const year = selectedDate.getFullYear()
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
        const day = selectedDate.getDate().toString().padStart(2, '0')
        const dateString = `${year}-${month}-${day}` // YYYY-MM-DD
        
        const response = await fetch(
          `/api/available-slots?providerId=${providerId}&serviceId=${serviceId}&date=${dateString}`
        )

        if (!response.ok) {
          throw new Error('Erro ao buscar horários disponíveis')
        }

        const data = await response.json()
        setAvailableSlots(data.availableSlots)
        onAvailableSlotsUpdate(data.availableSlots)
      } catch (err) {
        console.error('Erro ao buscar slots:', err)
        setError('Não foi possível carregar os horários disponíveis. Tente novamente.')
        setAvailableSlots([])
        onAvailableSlotsUpdate([])
      } finally {
        setIsLoading(false)
        onLoadingChange(false)
      }
    }

    fetchAvailableSlots()
  }, [providerId, serviceId, selectedDate, onAvailableSlotsUpdate, onLoadingChange])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Escolha um horário</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(selectedDate)}
          </p>
        </div>

        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Carregando horários disponíveis...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Escolha um horário</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(selectedDate)}
          </p>
        </div>

        <div className="text-center py-8">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Escolha um horário</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(selectedDate)}
        </p>
      </div>

      {availableSlots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-2">
            Não há horários disponíveis para esta data.
          </p>
          <p className="text-xs text-muted-foreground">
            Escolha outra data ou entre em contato diretamente com o prestador.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-md mx-auto">
          {availableSlots.map((time) => (
            <Button
              key={time}
              variant="outline"
              onClick={() => onTimeSelect(time)}
              className="h-12 text-sm font-medium hover:bg-primary hover:text-primary-foreground"
            >
              {formatTime(time)}
            </Button>
          ))}
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Todos os horários são no fuso horário de Brasília (GMT-3)
        </p>
      </div>
    </div>
  )
}
