"use client"

import { useState } from "react"
import { ProviderInfo } from "./provider-info"
import { PublicServiceCard } from "./public-service-card"
import { ServiceDetailModal } from "./service-detail-modal"

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  providerId: string
}

interface Provider {
  id: string
  name: string
  businessName: string
  email: string
  phone: string
  customLink: string
  address: string
  services: Service[]
}

interface PublicProviderClientProps {
  provider: Provider
}

export function PublicProviderClient({ provider }: PublicProviderClientProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleServiceClick = (service: Service) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedService(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agendamento Online
          </h1>
          <p className="text-muted-foreground">
            Escolha o serviço e agende seu horário
          </p>
        </div>

        {/* Informações do Prestador */}
        <ProviderInfo provider={provider} />

        {/* Lista de Serviços */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Serviços Disponíveis
          </h2>
          
          {provider.services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No momento não há serviços disponíveis para agendamento.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {provider.services.map((service) => (
                <PublicServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => handleServiceClick(service)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <span className="font-semibold text-primary">TWBooking</span>
          </p>
        </div>
      </div>

      {/* Modal de Detalhes do Serviço */}
      {selectedService && (
        <ServiceDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          service={selectedService}
          provider={provider}
        />
      )}
    </div>
  )
}
