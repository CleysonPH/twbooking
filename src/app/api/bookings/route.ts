import { NextRequest, NextResponse } from 'next/server'
import { customerBookingSchema, providerBookingSchema } from '@/lib/validations'
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
        // Forçar timezone local para evitar problemas de fuso
        const [year, month, day] = filters.startDate.split('-').map(Number)
        whereClause.dateTime.gte = new Date(year, month - 1, day)
      }
      if (filters.endDate) {
        // Forçar timezone local para evitar problemas de fuso
        const [year, month, day] = filters.endDate.split('-').map(Number)
        const endDate = new Date(year, month - 1, day)
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
    
    // Verificar se é um agendamento criado pelo prestador
    const isProviderBooking = body.createdBy === 'provider'
    
    if (isProviderBooking) {
      // Verificar autenticação do prestador
      const session = await auth()
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }

      // Buscar o prestador
      const provider = await prisma.provider.findUnique({
        where: { email: session.user.email },
        select: { 
          id: true,
          name: true,
          businessName: true,
          address: true,
          phone: true,
          email: true
        }
      })

      if (!provider) {
        return NextResponse.json({ error: 'Prestador não encontrado' }, { status: 404 })
      }

      // Validar dados de entrada para prestador
      const validatedData = providerBookingSchema.parse(body)
      
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

      // Buscar informações do serviço
      const service = await prisma.service.findUnique({
        where: { 
          id: validatedData.serviceId,
          providerId: provider.id // Garantir que o serviço pertence ao prestador
        }
      })

      if (!service) {
        return NextResponse.json(
          { error: 'Serviço não encontrado ou não pertence a você' },
          { status: 404 }
        )
      }

      if (!service.isActive) {
        return NextResponse.json(
          { error: 'Serviço não está ativo' },
          { status: 400 }
        )
      }

      // Verificar se o horário ainda está disponível
      const isAvailable = await isTimeSlotAvailable(
        provider.id,
        validatedData.serviceId,
        appointmentDateTime
      )

      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Horário não está mais disponível. Por favor, escolha outro horário.' },
          { status: 409 }
        )
      }

      let customer
      
      // Se foi fornecido customerId, buscar cliente existente
      if (validatedData.customerId) {
        customer = await prisma.customer.findUnique({
          where: { id: validatedData.customerId }
        })
        
        if (!customer) {
          return NextResponse.json(
            { error: 'Cliente não encontrado' },
            { status: 404 }
          )
        }
      } else if (validatedData.customerData) {
        // Encontrar ou criar cliente com os dados fornecidos
        customer = await findOrCreateCustomer(
          validatedData.customerData.name,
          validatedData.customerData.email,
          validatedData.customerData.phone
        )
      } else {
        return NextResponse.json(
          { error: 'Dados do cliente são obrigatórios' },
          { status: 400 }
        )
      }

      // Criar agendamento
      const booking = await createBooking({
        providerId: provider.id,
        serviceId: service.id,
        customerId: customer.id,
        dateTime: appointmentDateTime,
        customerName: customer.name,
        customerEmail: customer.email,
        providerAddress: provider.address,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDescription: service.description,
        createdBy: 'provider'
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
          customerNameSnapshot: booking.customerNameSnapshot,
          customerEmailSnapshot: booking.customerEmailSnapshot,
          serviceNameSnapshot: booking.serviceNameSnapshot,
          servicePriceSnapshot: booking.servicePriceSnapshot,
          serviceDescriptionSnapshot: booking.serviceDescriptionSnapshot,
          addressSnapshot: booking.addressSnapshot,
        }
      }, { status: 201 })
    }
    
    // Agendamento público (cliente) - código existente
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
