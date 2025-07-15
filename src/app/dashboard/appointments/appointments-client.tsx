"use client"

import { useState, useEffect } from 'react'
import { BookingStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { AppointmentWithDetails, AppointmentFilters } from '@/lib/appointment-types'
import { AppointmentCard } from './components/appointment-card'
import { AppointmentFiltersComponent } from './components/appointment-filters'
import { CreateAppointmentModal } from './components/create-appointment-modal'
import { DashboardNav } from '../components/dashboard-nav'
import LogoutButton from '../logout-button'
import { Plus } from 'lucide-react'

interface AppointmentsClientProps {
  providerName: string
  providerId: string
}

export function AppointmentsClient({ providerName, providerId }: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<AppointmentFilters>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchAppointments = async (filters: AppointmentFilters = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.status) params.append('status', filters.status)
      
      const response = await fetch(`/api/bookings?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar agendamentos')
      }
      
      const data = await response.json()
      setAppointments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (appointmentId: string, status: BookingStatus) => {
    try {
      const response = await fetch(`/api/bookings/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar status')
      }

      const updatedAppointment = await response.json()
      
      // Atualizar o appointment na lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, ...updatedAppointment } : apt
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }

  const handleFilterChange = (filters: AppointmentFilters) => {
    setCurrentFilters(filters)
    fetchAppointments(filters)
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  if (isLoading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">Agendamentos</h1>
              <p className="text-muted-foreground mt-2 break-words">
                Gerencie seus agendamentos, {providerName}
              </p>
            </div>
            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-8">
            <DashboardNav />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div></div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Carregando agendamentos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">Agendamentos</h1>
              <p className="text-muted-foreground mt-2 break-words">
                Gerencie seus agendamentos, {providerName}
              </p>
            </div>
            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-8">
            <DashboardNav />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div></div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <p className="text-red-600">Erro: {error}</p>
            <Button onClick={() => fetchAppointments(currentFilters)}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">Agendamentos</h1>
            <p className="text-muted-foreground mt-2 break-words">
              Gerencie seus agendamentos, {providerName}
            </p>
          </div>
          <div className="shrink-0">
            <LogoutButton />
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <DashboardNav />
        </div>

        {/* Add Appointment Button */}
        <div className="mb-6 flex justify-end">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <AppointmentFiltersComponent 
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <p className="text-muted-foreground text-lg">
              Nenhum agendamento encontrado
            </p>
            <p className="text-muted-foreground text-sm">
              {Object.keys(currentFilters).length > 0 
                ? 'Tente ajustar os filtros ou criar um novo agendamento.'
                : 'Quando você tiver agendamentos, eles aparecerão aqui.'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação de Agendamento */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          fetchAppointments(currentFilters) // Recarregar lista
        }}
        providerId={providerId}
      />
    </div>
  )
}
