"use client"

import { useState } from "react"
import { DashboardNav } from "../components/dashboard-nav"
import { ServiceCard } from "../components/service-card"
import { ServiceDetailModal } from "../components/service-detail-modal"
import { CreateServiceModal } from "./components/create-service-modal"
import { EditServiceModal } from "./components/edit-service-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import LogoutButton from "../logout-button"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ServicesPageClientProps {
  services: Service[]
  providerName: string
}

export default function ServicesPageClient({ services: initialServices, providerName }: ServicesPageClientProps) {
  const [services, setServices] = useState(initialServices)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null)

  const handleCardClick = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedServiceId(null)
  }

  const handleCreateService = () => {
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleEditService = () => {
    // Encontrar o serviço selecionado
    const service = services.find(s => s.id === selectedServiceId)
    if (service) {
      setServiceToEdit(service)
      setIsEditModalOpen(true)
      setIsDetailModalOpen(false) // Fechar modal de detalhes
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setServiceToEdit(null)
  }

  const handleServiceUpdatedFromEdit = async () => {
    // Atualizar lista de serviços
    await handleServiceUpdated()
    
    // Reabrir modal de detalhes se havia um serviço selecionado
    if (selectedServiceId) {
      setIsDetailModalOpen(true)
    }
  }

  const handleServiceCreated = async () => {
    try {
      // Recarregar os serviços após criar um novo
      const response = await fetch('/api/services')
      if (response.ok) {
        const newServices = await response.json()
        setServices(newServices)
      }
    } catch (error) {
      console.error('Erro ao recarregar serviços:', error)
      toast.error('Erro ao atualizar lista de serviços')
    }
  }

  const handleServiceUpdated = async () => {
    try {
      // Recarregar os serviços após atualizar um existente
      const response = await fetch('/api/services')
      if (response.ok) {
        const newServices = await response.json()
        setServices(newServices)
      }
    } catch (error) {
      console.error('Erro ao recarregar serviços:', error)
      toast.error('Erro ao atualizar lista de serviços')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Serviços</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus serviços, {providerName}
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <DashboardNav />
        </div>

        {/* Add Service Button */}
        <div className="mb-6">
          <Button onClick={handleCreateService} className="flex items-center gap-2">
            <Plus size={16} />
            Adicionar Novo Serviço
          </Button>
        </div>

        {/* Services List */}
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Plus size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não possui serviços cadastrados. Comece criando seu primeiro serviço.
              </p>
              <Button onClick={handleCreateService}>
                <Plus size={16} className="mr-2" />
                Criar Primeiro Serviço
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {/* Service Detail Modal */}
        <ServiceDetailModal
          serviceId={selectedServiceId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onEdit={handleEditService}
          onUpdate={handleServiceUpdated}
        />

        {/* Create Service Modal */}
        <CreateServiceModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleServiceCreated}
        />

        {/* Edit Service Modal */}
        <EditServiceModal
          service={serviceToEdit}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleServiceUpdatedFromEdit}
        />
      </div>
    </div>
  )
}
