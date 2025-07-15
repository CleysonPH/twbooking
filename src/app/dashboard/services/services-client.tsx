"use client"

import { useState } from "react"
import { DashboardNav } from "../components/dashboard-nav"
import { ServiceCard } from "../components/service-card"
import { ServiceDetailModal } from "../components/service-detail-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import LogoutButton from "../logout-button"

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

export default function ServicesPageClient({ services, providerName }: ServicesPageClientProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedServiceId(null)
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
          <Button disabled className="flex items-center gap-2">
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
              <Button disabled>
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
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  )
}
