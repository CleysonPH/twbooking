import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { 
  getProviderAvailability, 
  createAvailability 
} from '@/lib/availability'
import { availabilityCreateSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'

// GET: Listar disponibilidade do prestador logado
export async function GET() {
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

    const availability = await getProviderAvailability(provider.id)
    
    return NextResponse.json(availability)
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST: Criar nova disponibilidade
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    // Validar dados
    const validatedData = availabilityCreateSchema.parse(body)
    
    // Criar disponibilidade
    const availability = await createAvailability(validatedData, provider.id)
    
    return NextResponse.json(availability, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar disponibilidade:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message.includes('sobrepõe')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
