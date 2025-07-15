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
import { z } from 'zod'

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
