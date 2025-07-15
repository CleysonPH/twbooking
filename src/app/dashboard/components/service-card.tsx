"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign } from "lucide-react"

interface ServiceCardProps {
  service: {
    id: string
    name: string
    price: number
    duration: number
    isActive: boolean
  }
  onCardClick: (serviceId: string) => void
}

export function ServiceCard({ service, onCardClick }: ServiceCardProps) {
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

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:scale-105"
      onClick={() => onCardClick(service.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{service.name}</CardTitle>
          <Badge variant={service.isActive ? "default" : "secondary"}>
            {service.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <DollarSign size={16} />
            <span className="font-medium text-foreground">{formatPrice(service.price)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{formatDuration(service.duration)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
