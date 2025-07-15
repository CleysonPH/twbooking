import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '../../../../../auth'
import { z } from 'zod'

const searchCustomersSchema = z.object({
  q: z.string().min(1, "Query de busca é obrigatória")
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

    // Validar parâmetros de busca
    const { searchParams } = new URL(request.url)
    const { q } = searchCustomersSchema.parse({
      q: searchParams.get('q')
    })

    // Buscar clientes que já agendaram com este prestador
    const customers = await prisma.customer.findMany({
      where: {
        AND: [
          {
            bookings: {
              some: {
                providerId: provider.id
              }
            }
          },
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        _count: {
          select: {
            bookings: {
              where: {
                providerId: provider.id
              }
            }
          }
        }
      },
      take: 10,
      orderBy: [
        { name: 'asc' }
      ]
    })

    return NextResponse.json(customers)
    
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    
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
