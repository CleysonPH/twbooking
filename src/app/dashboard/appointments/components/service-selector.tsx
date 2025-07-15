"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string | null
  isActive: boolean
}

interface ServiceSelectorProps {
  selectedServiceId?: string
  onServiceSelect: (service: Service) => void
  isLoading?: boolean
}

export function ServiceSelector({ selectedServiceId, onServiceSelect, isLoading = false }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/services')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar serviços')
      }
      
      const data = await response.json()
      // Filtrar apenas serviços ativos
      setServices(data.filter((service: Service) => service.isActive))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando serviços...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-red-600">Erro: {error}</p>
        <Button onClick={fetchServices} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-muted-foreground">Nenhum serviço ativo encontrado</p>
        <p className="text-sm text-muted-foreground">
          Você precisa ter pelo menos um serviço ativo para criar agendamentos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Selecione o Serviço</h3>
        <p className="text-sm text-muted-foreground">
          Escolha qual serviço será agendado para o cliente.
        </p>
      </div>

      <div className="grid gap-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id
          
          return (
            <Card 
              key={service.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary shadow-md' : ''
              } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => !isLoading && onServiceSelect(service)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {formatPrice(service.price)}
                    </Badge>
                    <Badge variant="outline">
                      {formatDuration(service.duration)}
                    </Badge>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {service.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
