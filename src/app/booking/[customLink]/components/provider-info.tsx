import { MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProviderInfoProps {
  provider: {
    name: string
    businessName: string
    address: string
    phone: string
  }
}

export function ProviderInfo({ provider }: ProviderInfoProps) {
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanPhone}`
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {provider.businessName}
        </CardTitle>
        <p className="text-center text-muted-foreground">
          {provider.name}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm">{provider.address}</p>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <a 
            href={formatPhoneForWhatsApp(provider.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline text-primary"
          >
            {provider.phone}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
