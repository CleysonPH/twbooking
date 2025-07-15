import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/booking'
import { availableSlotsSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validar parâmetros da query string
    const params = {
      providerId: searchParams.get('providerId'),
      serviceId: searchParams.get('serviceId'),
      date: searchParams.get('date')
    }

    const validatedParams = availableSlotsSchema.parse(params)
    
    // Converter string de data para objeto Date, forçando timezone local
    // Para evitar problemas de fuso horário, vamos construir a data manualmente
    const [year, month, day] = validatedParams.date.split('-').map(Number)
    const requestedDate = new Date(year, month - 1, day) // month é 0-indexed
    
    // Verificar se a data é válida
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { error: 'Data inválida' },
        { status: 400 }
      )
    }

    // Buscar horários disponíveis
    const availableSlots = await getAvailableSlots(
      validatedParams.providerId,
      validatedParams.serviceId,
      requestedDate
    )

    return NextResponse.json({
      date: validatedParams.date,
      availableSlots
    })

  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos',
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
