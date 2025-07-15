"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AppointmentCalendar } from "./appointment-calendar"
import { TimeSlots } from "./time-slots"
import { CustomerForm } from "./customer-form"
import { BookingSummary } from "./booking-summary"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, DollarSign } from "lucide-react"

interface AppointmentClientProps {
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
  availability: Array<{
    weekday: string
    startTime: string
    endTime: string
  }>
}

interface AppointmentState {
  selectedDate: Date | null
  selectedTime: string | null
  availableSlots: string[]
  customerData: {
    name: string
    email: string
    phone: string
  }
  isLoading: boolean
  step: 'date' | 'time' | 'customer' | 'summary'
}

export function AppointmentClient({ provider, service, availability }: AppointmentClientProps) {
  const router = useRouter()
  
  const [state, setState] = useState<AppointmentState>({
    selectedDate: null,
    selectedTime: null,
    availableSlots: [],
    customerData: {
      name: '',
      email: '',
      phone: ''
    },
    isLoading: false,
    step: 'date'
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price)
  }

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration}min`
    }
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
  }

  const handleDateSelect = (date: Date) => {
    setState(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: null,
      step: 'time'
    }))
  }

  const handleTimeSelect = (time: string) => {
    setState(prev => ({
      ...prev,
      selectedTime: time,
      step: 'customer'
    }))
  }

  const handleCustomerDataSubmit = (customerData: { name: string; email: string; phone: string }) => {
    setState(prev => ({
      ...prev,
      customerData,
      step: 'summary'
    }))
  }

  const handleBack = () => {
    switch (state.step) {
      case 'time':
        setState(prev => ({ ...prev, step: 'date', selectedTime: null }))
        break
      case 'customer':
        setState(prev => ({ ...prev, step: 'time' }))
        break
      case 'summary':
        setState(prev => ({ ...prev, step: 'customer' }))
        break
      default:
        router.push(`/booking/${provider.customLink}`)
    }
  }

  const handleBookingComplete = (bookingId: string) => {
    router.push(`/booking/${provider.customLink}/confirmation/${bookingId}`)
  }

  const updateAvailableSlots = useCallback((slots: string[]) => {
    setState(prev => ({ ...prev, availableSlots: slots }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agendar Serviço
            </h1>
            <p className="text-muted-foreground">
              {provider.businessName}
            </p>
          </div>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{service.name}</h2>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {service.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  {formatPrice(service.price)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(service.duration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {state.step === 'date' && (
            <AppointmentCalendar
              provider={provider}
              availability={availability}
              onDateSelect={handleDateSelect}
            />
          )}

          {state.step === 'time' && state.selectedDate && (
            <TimeSlots
              providerId={provider.id}
              serviceId={service.id}
              selectedDate={state.selectedDate}
              onTimeSelect={handleTimeSelect}
              onAvailableSlotsUpdate={updateAvailableSlots}
              onLoadingChange={setLoading}
            />
          )}

          {state.step === 'customer' && (
            <CustomerForm
              onSubmit={handleCustomerDataSubmit}
              isLoading={state.isLoading}
            />
          )}

          {state.step === 'summary' && state.selectedDate && state.selectedTime && (
            <BookingSummary
              provider={provider}
              service={service}
              selectedDate={state.selectedDate}
              selectedTime={state.selectedTime}
              customerData={state.customerData}
              onComplete={handleBookingComplete}
              onLoadingChange={setLoading}
              isLoading={state.isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
