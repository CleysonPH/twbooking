import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, DollarSign, Eye } from "lucide-react"

interface PublicServiceCardProps {
  service: {
    id: string
    name: string
    price: number
    duration: number
    description?: string | null
  }
  onClick: () => void
}

export function PublicServiceCard({ service, onClick }: PublicServiceCardProps) {
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
      className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-105 group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {service.name}
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <DollarSign size={16} className="text-green-600" />
            <span className="font-medium text-green-600">{formatPrice(service.price)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={16} />
            <span>{formatDuration(service.duration)}</span>
          </div>
        </div>
        
        {/* Indicador visual de clique */}
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
            Clique para ver detalhes
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
