import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, MapPin, Phone, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface ServiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  service: {
    id: string
    name: string
    price: number
    duration: number
    description?: string | null
  }
  provider: {
    name: string
    businessName: string
    address: string
    phone: string
    customLink: string
  }
}

export function ServiceDetailModal({ 
  isOpen, 
  onClose, 
  service, 
  provider 
}: ServiceDetailModalProps) {
  const router = useRouter()

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

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanPhone}`
  }

  const handleScheduleAppointment = () => {
    onClose()
    router.push(`/booking/${provider.customLink}/appointment/${service.id}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{service.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preço e Duração */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-600 text-lg">
                {formatPrice(service.price)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>{formatDuration(service.duration)}</span>
            </div>
          </div>

          {/* Descrição */}
          {service.description && (
            <div>
              <h4 className="font-medium mb-2">Descrição do Serviço</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          )}

          {/* Informações do Prestador */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Informações do Prestador</h4>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{provider.businessName}</p>
                <p className="text-sm text-muted-foreground">{provider.name}</p>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{provider.address}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a 
                  href={formatPhoneForWhatsApp(provider.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline text-primary"
                >
                  {provider.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-blue-50 rounded-lg p-4">
            <Button 
              onClick={handleScheduleAppointment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Serviço
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
