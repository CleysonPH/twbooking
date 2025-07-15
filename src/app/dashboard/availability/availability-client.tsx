"use client"

import { useState, useEffect } from "react"
import { Availability } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { DashboardNav } from "../components/dashboard-nav"
import LogoutButton from "../logout-button"
import { CreateAvailabilityModal } from "./components/create-availability-modal"
import { EditAvailabilityModal } from "./components/edit-availability-modal"
import { DeleteConfirmationModal } from "./components/delete-confirmation-modal"
import { formatAvailabilityForDisplay, formatTimeForDisplay } from "@/lib/availability"
import { AvailabilityFormData } from "@/lib/validations"

interface GroupedAvailability {
  weekday: string
  label: string
  slots: Availability[]
}

interface AvailabilityClientProps {
  providerName: string
}

export function AvailabilityClient({ providerName }: AvailabilityClientProps) {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [groupedAvailability, setGroupedAvailability] = useState<GroupedAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [availabilityToDelete, setAvailabilityToDelete] = useState<Availability | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar disponibilidades
  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/availability')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar disponibilidades')
      }
      
      const data = await response.json()
      setAvailability(data)
      
      // Agrupar e formatar para exibição
      const grouped = formatAvailabilityForDisplay(data)
      setGroupedAvailability(grouped)
    } catch (error) {
      console.error('Erro ao buscar disponibilidades:', error)
      toast.error('Erro ao carregar disponibilidades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  // Criar disponibilidade
  const handleCreate = async (data: AvailabilityFormData) => {
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar disponibilidade')
      }

      toast.success('Disponibilidade criada com sucesso!')
      setCreateModalOpen(false)
      fetchAvailability()
    } catch (error) {
      console.error('Erro ao criar disponibilidade:', error)
      const message = error instanceof Error ? error.message : 'Erro ao criar disponibilidade'
      toast.error(message)
    }
  }

  // Atualizar disponibilidade
  const handleUpdate = async (id: string, data: AvailabilityFormData) => {
    try {
      const response = await fetch(`/api/availability/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar disponibilidade')
      }

      toast.success('Disponibilidade atualizada com sucesso!')
      setEditModalOpen(false)
      setEditingAvailability(null)
      fetchAvailability()
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error)
      const message = error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade'
      toast.error(message)
    }
  }

  // Excluir disponibilidade
  const handleDelete = async (availability: Availability) => {
    setAvailabilityToDelete(availability)
    setDeleteModalOpen(true)
  }

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!availabilityToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/availability/${availabilityToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir disponibilidade')
      }

      toast.success('Disponibilidade excluída com sucesso!')
      fetchAvailability()
      setAvailabilityToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir disponibilidade:', error)
      const message = error instanceof Error ? error.message : 'Erro ao excluir disponibilidade'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Abrir modal de edição
  const handleEdit = (availability: Availability) => {
    setEditingAvailability(availability)
    setEditModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">Disponibilidade</h1>
              <p className="text-muted-foreground mt-2 break-words">
                Gerencie seus horários, {providerName}
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

          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando disponibilidades...</div>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">Disponibilidade</h1>
            <p className="text-muted-foreground mt-2 break-words">
              Configure os dias e horários em que você está disponível para atendimento, {providerName}
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

        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Seus Horários</h2>
          <p className="text-sm text-muted-foreground">
            {availability.length === 0 
              ? "Nenhuma disponibilidade configurada" 
              : `${availability.length} horário(s) configurado(s)`
            }
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Horário
        </Button>
      </div>

      {groupedAvailability.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Nenhuma disponibilidade configurada</h3>
                <p className="text-muted-foreground">
                  Configure seus horários de disponibilidade para que os clientes possam agendar serviços.
                </p>
              </div>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Horário
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groupedAvailability.map((day) => (
            <Card key={day.weekday}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{day.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {day.slots.map((slot) => (
                  <div 
                    key={slot.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <Badge variant="outline">
                      {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(slot)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(slot)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAvailabilityModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
      />

      {editingAvailability && (
        <EditAvailabilityModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          availability={editingAvailability}
          onSubmit={(data: AvailabilityFormData) => handleUpdate(editingAvailability.id, data)}
        />
      )}

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Disponibilidade"
        description={
          availabilityToDelete 
            ? `Tem certeza que deseja excluir o horário ${formatTimeForDisplay(availabilityToDelete.startTime)} - ${formatTimeForDisplay(availabilityToDelete.endTime)}? Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir esta disponibilidade?"
        }
        confirmText="Excluir Horário"
        isLoading={isDeleting}
      />
        </div>
      </div>
    </div>
  )
}
