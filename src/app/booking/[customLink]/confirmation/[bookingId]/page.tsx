import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ConfirmationClient } from "./components/confirmation-client"

interface ConfirmationPageProps {
  params: Promise<{
    customLink: string
    bookingId: string
  }>
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { customLink, bookingId } = await params
  
  // Buscar o agendamento com dados do prestador
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      provider: {
        customLink: customLink
      }
    },
    select: {
      id: true,
      dateTime: true,
      status: true,
      serviceNameSnapshot: true,
      servicePriceSnapshot: true,
      serviceDescriptionSnapshot: true,
      customerNameSnapshot: true,
      customerEmailSnapshot: true,
      addressSnapshot: true,
      createdAt: true,
      provider: {
        select: {
          name: true,
          businessName: true,
          phone: true,
          customLink: true
        }
      }
    }
  })

  if (!booking) {
    notFound()
  }

  return (
    <ConfirmationClient 
      booking={booking}
    />
  )
}
