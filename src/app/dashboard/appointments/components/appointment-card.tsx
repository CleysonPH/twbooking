"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookingStatus } from '@prisma/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppointmentWithDetails } from '@/lib/appointment-types'
import { StatusBadge } from './status-badge'
import { StatusUpdateModal } from './status-update-modal'

interface AppointmentCardProps {
  appointment: AppointmentWithDetails
  onStatusUpdate: (appointmentId: string, status: BookingStatus) => Promise<void>
}

export function AppointmentCard({ appointment, onStatusUpdate }: AppointmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (status: BookingStatus) => {
    setIsUpdating(true)
    try {
      await onStatusUpdate(appointment.id, status)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const canUpdateStatus = appointment.status === 'SCHEDULED'

  const formatDateTime = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{appointment.serviceNameSnapshot}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(appointment.dateTime)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={appointment.status} />
              <Badge variant="outline" className="ml-2">
                {formatPrice(appointment.servicePriceSnapshot)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1">Cliente</h4>
              <p className="text-sm">{appointment.customerNameSnapshot}</p>
              <p className="text-sm text-muted-foreground">{appointment.customerEmailSnapshot}</p>
            </div>
            
            {appointment.serviceDescriptionSnapshot && (
              <div>
                <h4 className="font-medium text-sm mb-1">Descrição do Serviço</h4>
                <p className="text-sm text-muted-foreground">
                  {appointment.serviceDescriptionSnapshot}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-sm mb-1">Local</h4>
              <p className="text-sm text-muted-foreground">{appointment.addressSnapshot}</p>
            </div>
            
            {canUpdateStatus && (
              <div className="pt-2 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full"
                >
                  Alterar Status
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <StatusUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleStatusUpdate}
        currentStatus={appointment.status}
        isLoading={isUpdating}
      />
    </>
  )
}
