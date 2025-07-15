"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  ArrowLeft,
  MessageCircle
} from "lucide-react"
import Link from "next/link"

interface ConfirmationClientProps {
  booking: {
    id: string
    dateTime: Date
    status: string
    serviceNameSnapshot: string
    servicePriceSnapshot: number
    serviceDescriptionSnapshot?: string | null
    customerNameSnapshot: string
    customerEmailSnapshot: string
    addressSnapshot: string
    createdAt: Date
    provider: {
      name: string
      businessName: string
      phone: string
      customLink: string
    }
  }
}

export function ConfirmationClient({ booking }: ConfirmationClientProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price)
  }

  const formatDateTime = (dateTime: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo"
    }).format(dateTime)
  }

  const formatPhoneForWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá! Gostaria de confirmar meu agendamento para ${booking.serviceNameSnapshot} no dia ${formatDateTime(booking.dateTime)}. Agendamento #${booking.id}`
    )
    return `https://wa.me/${cleanPhone}?text=${message}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agendamento Confirmado!
          </h1>
          <p className="text-muted-foreground">
            Seu agendamento foi criado com sucesso
          </p>
        </div>

        {/* Booking Details */}
        <div className="space-y-6">
          {/* Service Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Detalhes do Serviço</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviço:</span>
                  <span className="font-medium">{booking.serviceNameSnapshot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(booking.servicePriceSnapshot)}
                  </span>
                </div>
                {booking.serviceDescriptionSnapshot && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground text-sm">Descrição:</span>
                    <p className="text-sm mt-1">{booking.serviceDescriptionSnapshot}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Data e Horário</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <Clock className="h-4 w-4" />
                </div>
                <span className="font-medium">
                  {formatDateTime(booking.dateTime)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Provider Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Informações do Prestador</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium">{booking.provider.businessName}</div>
                    <div className="text-sm text-muted-foreground">{booking.provider.name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="text-sm">{booking.addressSnapshot}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.provider.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Seus Dados</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.customerNameSnapshot}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.customerEmailSnapshot}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4 text-blue-900">📋 Orientações Importantes</h2>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Chegue pontualmente no horário agendado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Um e-mail de confirmação foi enviado para {booking.customerEmailSnapshot}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Confirme seu agendamento entrando em contato com o prestador</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Em caso de cancelamento, avise com antecedência</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            asChild
            variant="outline"
            className="flex-1"
          >
            <Link href={`/booking/${booking.provider.customLink}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à página inicial
            </Link>
          </Button>
          
          <Button
            asChild
            className="flex-1"
          >
            <a
              href={formatPhoneForWhatsApp(booking.provider.phone)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Confirmar no WhatsApp
            </a>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground">
            Agendamento #{booking.id} criado em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short"
            }).format(booking.createdAt)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by{" "}
            <span className="font-semibold text-primary">TWBooking</span>
          </p>
        </div>
      </div>
    </div>
  )
}
