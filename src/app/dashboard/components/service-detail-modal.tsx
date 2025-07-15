"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Clock, DollarSign, Calendar, Edit } from "lucide-react"

interface ServiceDetailModalProps {
  serviceId: string | null
  isOpen: boolean
  onClose: () => void
}

interface ServiceDetail {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function ServiceDetailModal({ serviceId, isOpen, onClose }: ServiceDetailModalProps) {
  const [service, setService] = useState<ServiceDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (serviceId && isOpen) {
      setLoading(true)
      setError(null)
      
      // Buscar serviço via API
      fetch(`/api/services/${serviceId}`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar serviço')
          }
          return response.json()
        })
        .then((data) => {
          setService({
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
          })
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching service:', error)
          setError('Erro ao carregar detalhes do serviço')
          setLoading(false)
        })
    }
  }, [serviceId, isOpen])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price)
  }

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration} minutos`
    }
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours} hora${hours > 1 ? 's' : ''}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Serviço</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={onClose}
              className="mt-4"
            >
              Fechar
            </Button>
          </div>
        )}

        {service && !loading && !error && (
          <div className="space-y-6">
            {/* Header com nome e status */}
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold">{service.name}</h3>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {/* Informações principais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Preço</p>
                  <p className="font-semibold">{formatPrice(service.price)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="font-semibold">{formatDuration(service.duration)}</p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            {service.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                <p className="text-sm">{service.description}</p>
              </div>
            )}

            {/* Controle de status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="service-active"
                checked={service.isActive}
                disabled // Placeholder - não funcional ainda
              />
              <Label htmlFor="service-active">
                Serviço {service.isActive ? "ativo" : "inativo"}
              </Label>
            </div>

            {/* Datas */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Criado em: {formatDate(service.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Atualizado em: {formatDate(service.updatedAt)}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" disabled>
                <Edit size={16} className="mr-2" />
                Editar Serviço
              </Button>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
