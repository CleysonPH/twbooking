"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  Loader2
} from "lucide-react"

interface BookingSummaryProps {
  provider: {
    id: string
    name: string
    businessName: string
    address: string
    phone: string
    customLink: string
  }
  service: {
    id: string
    name: string
    price: number
    duration: number
    description?: string | null
  }
  selectedDate: Date
  selectedTime: string
  customerData: {
    name: string
    email: string
    phone: string
  }
  onComplete: (bookingId: string) => void
  onLoadingChange: (loading: boolean) => void
  isLoading: boolean
}

export function BookingSummary({
  provider,
  service,
  selectedDate,
  selectedTime,
  customerData,
  onComplete,
  onLoadingChange,
  isLoading
}: BookingSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date)
  }

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration}min`
    }
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
  }

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    onLoadingChange(true)
    setError(null)

    try {
      // Validar se a data/hora não é no passado
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const appointmentDateTime = new Date(selectedDate)
      appointmentDateTime.setHours(hours, minutes, 0, 0)
      
      if (appointmentDateTime <= new Date()) {
        toast.error("⚠️ Não é possível agendar para datas e horários passados. Por favor, escolha uma data e horário futuros.")
        return
      }

      // Corrigir problema de timezone - usar data local ao invés de UTC
      const year = selectedDate.getFullYear()
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
      const day = selectedDate.getDate().toString().padStart(2, '0')
      const dateString = `${year}-${month}-${day}` // YYYY-MM-DD
      
      const bookingData = {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        selectedDate: dateString,
        selectedTime: selectedTime,
        serviceId: service.id
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error === 'Não é possível agendar para datas passadas') {
          toast.error("⚠️ Não é possível agendar para datas e horários passados. Por favor, escolha uma data e horário futuros.")
          return
        }
        throw new Error(result.error || 'Erro ao criar agendamento')
      }

      onComplete(result.bookingId)
    } catch (err) {
      console.error('Erro ao confirmar agendamento:', err)
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setIsSubmitting(false)
      onLoadingChange(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Confirmar agendamento</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Revise os dados antes de confirmar
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        {/* Resumo do Serviço */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Serviço</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço:</span>
                <span className="font-medium text-green-600">{formatPrice(service.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duração:</span>
                <span className="font-medium">{formatDuration(service.duration)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data e Horário */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Data e Horário</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prestador */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Prestador</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{provider.businessName}</div>
                  <div className="text-muted-foreground">{provider.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{provider.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{provider.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seus Dados */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Seus dados</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customerData.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Erro */}
      {error && (
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Botão de Confirmação */}
      <div className="max-w-md mx-auto">
        <Button
          onClick={handleConfirmBooking}
          disabled={isSubmitting || isLoading}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Confirmando agendamento...
            </>
          ) : (
            "Confirmar agendamento"
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Você receberá um e-mail de confirmação após finalizar o agendamento
        </p>
      </div>
    </div>
  )
}
