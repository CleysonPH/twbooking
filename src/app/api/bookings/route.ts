import { NextRequest, NextResponse } from 'next/server'
import { customerBookingSchema } from '@/lib/validations'
import { 
  findOrCreateCustomer, 
  createBooking, 
  isTimeSlotAvailable 
} from '@/lib/booking'
import { 
  sendBookingConfirmationToCustomer,
  sendBookingNotificationToProvider
} from '@/lib/email-service'
import { prisma } from '@/lib/prisma'
import { auth } from '../../../../auth'
import { z } from 'zod'

// Schema para validação dos filtros de agendamentos
const appointmentFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar o prestador
    const provider = await prisma.provider.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!provider) {
      return NextResponse.json({ error: 'Prestador não encontrado' }, { status: 404 })
    }

    // Validar filtros da query string
    const { searchParams } = new URL(request.url)
    const filters = appointmentFiltersSchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') || undefined,
    })

    // Construir filtros para a query
    const whereClause: { 
      providerId: string
      dateTime?: { gte?: Date; lte?: Date }
      status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
    } = {
      providerId: provider.id
    }

    if (filters.startDate || filters.endDate) {
      whereClause.dateTime = {}
      if (filters.startDate) {
        whereClause.dateTime.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // Incluir o dia inteiro
        whereClause.dateTime.lte = endDate
      }
    }

    if (filters.status) {
      whereClause.status = filters.status as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
    }

    // Buscar agendamentos
    const appointments = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { dateTime: 'desc' },
      select: {
        id: true,
        dateTime: true,
        status: true,
        customerNameSnapshot: true,
        customerEmailSnapshot: true,
        serviceNameSnapshot: true,
        servicePriceSnapshot: true,
        serviceDescriptionSnapshot: true,
        addressSnapshot: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = customerBookingSchema.parse(body)
    
    // Converter data e hora para objeto Date
    const [year, month, day] = validatedData.selectedDate.split('-').map(Number)
    const [hours, minutes] = validatedData.selectedTime.split(':').map(Number)
    
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes)
    
    // Verificar se a data/hora não é no passado
    if (appointmentDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'Não é possível agendar para datas passadas' },
        { status: 400 }
      )
    }

    // Buscar informações do serviço e prestador
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            businessName: true,
            address: true,
            phone: true,
            email: true
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    if (!service.isActive) {
      return NextResponse.json(
        { error: 'Serviço não está disponível para agendamento' },
        { status: 400 }
      )
    }

    // Verificar se o horário ainda está disponível
    const isAvailable = await isTimeSlotAvailable(
      service.provider.id,
      validatedData.serviceId,
      appointmentDateTime
    )

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Horário não está mais disponível. Por favor, escolha outro horário.' },
        { status: 409 }
      )
    }

    // Encontrar ou criar cliente
    const customer = await findOrCreateCustomer(
      validatedData.name,
      validatedData.email,
      validatedData.phone
    )

    // Criar agendamento
    const booking = await createBooking({
      providerId: service.provider.id,
      serviceId: service.id,
      customerId: customer.id,
      dateTime: appointmentDateTime,
      customerName: validatedData.name,
      customerEmail: validatedData.email,
      providerAddress: service.provider.address,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDescription: service.description
    })

    // Enviar e-mails de confirmação (em background)
    try {
      await Promise.all([
        sendBookingConfirmationToCustomer(booking),
        sendBookingNotificationToProvider(booking)
      ])
    } catch (emailError) {
      console.error('Erro ao enviar e-mails de confirmação:', emailError)
      // Não falha a criação do agendamento se houver erro no e-mail
    }

    // Retornar dados do agendamento criado
    return NextResponse.json({
      bookingId: booking.id,
      message: 'Agendamento criado com sucesso!',
      booking: {
        id: booking.id,
        dateTime: booking.dateTime,
        status: booking.status,
        service: {
          name: booking.serviceNameSnapshot,
          price: booking.servicePriceSnapshot,
          description: booking.serviceDescriptionSnapshot
        },
        provider: {
          name: booking.provider.businessName,
          address: booking.addressSnapshot,
          phone: booking.provider.phone
        },
        customer: {
          name: booking.customerNameSnapshot,
          email: booking.customerEmailSnapshot
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
