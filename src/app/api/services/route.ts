import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../auth"
import { prisma } from "@/lib/prisma"
import { serviceCreateSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET() {
  try {
    // Verificar autenticação
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Prestador não encontrado" },
        { status: 404 }
      )
    }

    // Buscar serviços do prestador
    const services = await prisma.service.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(services)

  } catch (error) {
    console.error("Erro ao buscar serviços:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    // Buscar provider do usuário
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Prestador não encontrado" },
        { status: 404 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = serviceCreateSchema.parse(body)

    // Criar serviço
    const service = await prisma.service.create({
      data: {
        ...validatedData,
        providerId: provider.id,
        description: validatedData.description || null
      }
    })

    return NextResponse.json(service, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Erro ao criar serviço:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
