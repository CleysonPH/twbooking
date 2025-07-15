import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { 
  updateAvailability, 
  deleteAvailability 
} from '@/lib/availability'
import { availabilityUpdateSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'

// GET: Buscar disponibilidade do prestador
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params

    if (!providerId) {
      return NextResponse.json(
        { error: 'ID do prestador é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar disponibilidade do prestador
    const availability = await prisma.availability.findMany({
      where: {
        providerId: providerId
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

    return NextResponse.json(availability)
    
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT: Atualizar disponibilidade específica
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar o provider associado ao usuário logado
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider não encontrado' },
        { status: 404 }
      )
    }

    const { id } = await params
    const body = await request.json()
    
    // Validar dados
    const validatedData = availabilityUpdateSchema.parse(body)
    
    // Atualizar disponibilidade
    const availability = await updateAvailability(
      id, 
      validatedData, 
      provider.id
    )
    
    return NextResponse.json(availability)
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message.includes('não encontrada') || error.message.includes('não autorizada')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      
      if (error.message.includes('sobrepõe')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Excluir disponibilidade específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar o provider associado ao usuário logado
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider não encontrado' },
        { status: 404 }
      )
    }

    const { id } = await params

    // Excluir disponibilidade
    await deleteAvailability(id, provider.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir disponibilidade:', error)
    
    if (error instanceof Error && 
        (error.message.includes('não encontrada') || error.message.includes('não autorizada'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
