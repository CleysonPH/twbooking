import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '../../../../../auth'
import { z } from 'zod'
import { BookingStatus } from '@prisma/client'

// Schema para validação da atualização de status
const updateStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Validar dados de entrada
    const body = await request.json()
    const { status } = updateStatusSchema.parse(body)

    // Buscar o agendamento
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        providerId: true,
        status: true,
        dateTime: true,
        customerEmailSnapshot: true,
        customerNameSnapshot: true,
        serviceNameSnapshot: true,
        addressSnapshot: true,
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    // Verificar se o agendamento pertence ao prestador
    if (booking.providerId !== provider.id) {
      return NextResponse.json({ error: 'Agendamento não pertence ao prestador' }, { status: 403 })
    }

    // Validar transições de status permitidas
    const currentStatus = booking.status
    if (currentStatus !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'Não é possível alterar o status de agendamentos que não estão agendados' },
        { status: 400 }
      )
    }

    // Não permitir alterações em agendamentos muito antigos (> 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    if (booking.dateTime < thirtyDaysAgo) {
      return NextResponse.json(
        { error: 'Não é possível alterar agendamentos com mais de 30 dias' },
        { status: 400 }
      )
    }

    // Atualizar o status do agendamento
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status: status as BookingStatus,
        updatedAt: new Date()
      },
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

    // TODO: Enviar notificação por e-mail se cancelado pelo prestador
    // if (status === 'CANCELLED') {
    //   await sendCancellationNotificationToCustomer(booking)
    // }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
