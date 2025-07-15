import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AppointmentClient } from "./components/appointment-client"

interface AppointmentPageProps {
  params: Promise<{
    customLink: string
    serviceId: string
  }>
}

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const { customLink, serviceId } = await params
  // Buscar prestador pelo customLink
  const provider = await prisma.provider.findUnique({
    where: {
      customLink: customLink
    },
    select: {
      id: true,
      name: true,
      businessName: true,
      address: true,
      phone: true,
      customLink: true
    }
  })

  if (!provider) {
    notFound()
  }

  // Buscar serviço específico
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      providerId: provider.id,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      description: true
    }
  })

  if (!service) {
    notFound()
  }

  // Buscar disponibilidade do prestador
  const availability = await prisma.availability.findMany({
    where: {
      providerId: provider.id
    },
    select: {
      weekday: true,
      startTime: true,
      endTime: true
    },
    orderBy: [
      { weekday: 'asc' },
      { startTime: 'asc' }
    ]
  })

  return (
    <AppointmentClient 
      provider={provider}
      service={service}
      availability={availability}
    />
  )
}
