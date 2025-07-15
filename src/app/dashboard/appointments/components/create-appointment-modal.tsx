"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ServiceSelector } from './service-selector'
import { CustomerSelector } from './customer-selector'
import { AppointmentForm } from './appointment-form'
import { ChevronLeft, ChevronRight, Check, Calendar, User, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  isActive: boolean
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  _count?: {
    bookings: number
  }
}

interface CustomerData {
  name: string
  email: string
  phone: string
}

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  providerId: string
}

type Step = 'service' | 'datetime' | 'customer' | 'confirmation'

export function CreateAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  providerId 
}: CreateAppointmentModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerData, setCustomerData] = useState<CustomerData>({ name: '', email: '', phone: '' })
  const [availability, setAvailability] = useState<Array<{weekday: string, startTime: string, endTime: string}>>([])
  const [isCreating, setIsCreating] = useState(false)

  const steps: { id: Step; title: string; description: string }[] = [
    { id: 'service', title: 'Serviço', description: 'Escolha o serviço' },
    { id: 'datetime', title: 'Data e Hora', description: 'Selecione data e horário' },
    { id: 'customer', title: 'Cliente', description: 'Busque ou crie cliente' },
    { id: 'confirmation', title: 'Confirmação', description: 'Revise e confirme' }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  // Buscar disponibilidade do prestador ao abrir o modal
  useEffect(() => {
    if (isOpen && providerId) {
      const fetchAvailability = async () => {
        try {
          const response = await fetch(`/api/availability/${providerId}`)
          
          if (!response.ok) {
            throw new Error('Erro ao buscar disponibilidade')
          }
          
          const data = await response.json()
          setAvailability(data)
        } catch (error) {
          console.error('Erro ao buscar disponibilidade:', error)
          setAvailability([])
        }
      }

      fetchAvailability()
    }
  }, [isOpen, providerId])

  const canProceedFromService = selectedService !== null
  const canProceedFromDateTime = selectedDate && selectedTime
  const canProceedFromCustomer = selectedCustomer !== null || (
    customerData.name.trim() && 
    customerData.email.trim() && 
    customerData.phone.trim()
  )

  const handleNext = () => {
    if (currentStep === 'service' && canProceedFromService) {
      setCurrentStep('datetime')
    } else if (currentStep === 'datetime' && canProceedFromDateTime) {
      setCurrentStep('customer')
    } else if (currentStep === 'customer' && canProceedFromCustomer) {
      setCurrentStep('confirmation')
    }
  }

  const handleBack = () => {
    if (currentStep === 'datetime') {
      setCurrentStep('service')
    } else if (currentStep === 'customer') {
      setCurrentStep('datetime')
    } else if (currentStep === 'confirmation') {
      setCurrentStep('customer')
    }
  }

  const handleCreate = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Dados incompletos')
      return
    }

    try {
      setIsCreating(true)

      const bookingData = {
        serviceId: selectedService.id,
        selectedDate,
        selectedTime,
        createdBy: 'provider' as const,
        ...(selectedCustomer 
          ? { customerId: selectedCustomer.id }
          : { customerData }
        )
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar agendamento')
      }

      toast.success('Agendamento criado com sucesso!')
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (isCreating) return
    
    setCurrentStep('service')
    setSelectedService(null)
    setSelectedDate('')
    setSelectedTime('')
    setSelectedCustomer(null)
    setCustomerData({ name: '', email: '', phone: '' })
    onClose()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${minutes}min`
    }
  }

  const formatDateTime = () => {
    if (!selectedDate || !selectedTime) return ''
    
    const date = new Date(selectedDate + 'T00:00:00')
    const [hours, minutes] = selectedTime.split(':')
    
    return `${date.toLocaleDateString('pt-BR')} às ${hours}:${minutes}`
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'service':
        return (
          <ServiceSelector
            selectedServiceId={selectedService?.id}
            onServiceSelect={setSelectedService}
            isLoading={isCreating}
          />
        )

      case 'datetime':
        return selectedService ? (
          <AppointmentForm
            providerId={providerId}
            serviceId={selectedService.id}
            availability={availability}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
            isLoading={isCreating}
          />
        ) : null

      case 'customer':
        return (
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            customerData={customerData}
            onCustomerSelect={setSelectedCustomer}
            onCustomerDataChange={setCustomerData}
            isLoading={isCreating}
          />
        )

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Confirmar Agendamento</h3>
              <p className="text-sm text-muted-foreground">
                Revise as informações antes de confirmar.
              </p>
            </div>

            {/* Resumo do Serviço */}
            {selectedService && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{selectedService.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {formatPrice(selectedService.price)}
                        </Badge>
                        <Badge variant="outline">
                          {formatDuration(selectedService.duration)}
                        </Badge>
                      </div>
                    </div>
                    {selectedService.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedService.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumo da Data/Hora */}
            {selectedDate && selectedTime && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Data e Horário
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="font-medium">{formatDateTime()}</p>
                </CardContent>
              </Card>
            )}

            {/* Resumo do Cliente */}
            {(selectedCustomer || (customerData.name && customerData.email)) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {selectedCustomer?.name || customerData.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📧 {selectedCustomer?.email || customerData.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📱 {selectedCustomer?.phone || customerData.phone}
                    </p>
                    {selectedCustomer?._count && (
                      <Badge variant="outline" className="text-xs">
                        {selectedCustomer._count.bookings} agendamento{selectedCustomer._count.bookings !== 1 ? 's' : ''} anterior{selectedCustomer._count.bookings !== 1 ? 'es' : ''}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                ${index <= currentStepIndex 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'border-muted-foreground/30 text-muted-foreground'
                }
              `}>
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-px mx-2
                  ${index < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30'}
                `} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">{steps[currentStepIndex].title}</h3>
          <p className="text-sm text-muted-foreground">{steps[currentStepIndex].description}</p>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 'service' ? handleClose : handleBack}
            disabled={isCreating}
          >
            {currentStep === 'service' ? 'Cancelar' : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </>
            )}
          </Button>

          <div className="flex items-center space-x-3">
            {currentStep === 'confirmation' ? (
              <Button 
                onClick={handleCreate}
                disabled={isCreating}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  isCreating ||
                  (currentStep === 'service' && !canProceedFromService) ||
                  (currentStep === 'datetime' && !canProceedFromDateTime) ||
                  (currentStep === 'customer' && !canProceedFromCustomer)
                }
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
