import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../auth"
import { getServiceById, updateService, toggleServiceStatus } from "@/lib/services"
import { serviceUpdateSchema, serviceToggleStatusSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Buscar o provider do usuário logado
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user?.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      )
    }

    // Buscar o serviço
    const service = await getServiceById(id, provider.id)

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Buscar o provider do usuário logado
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user?.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = serviceUpdateSchema.parse(body)

    // Atualizar o serviço
    const updatedService = await updateService(id, validatedData, provider.id)

    return NextResponse.json(updatedService)
  } catch (error) {
    if (error instanceof Error && error.message === "Serviço não encontrado") {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Buscar o provider do usuário logado
    const provider = await prisma.provider.findUnique({
      where: { userId: session.user?.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validatedData = serviceToggleStatusSchema.parse(body)

    // Atualizar status do serviço
    const updatedService = await toggleServiceStatus(id, validatedData.isActive, provider.id)

    return NextResponse.json(updatedService)
  } catch (error) {
    if (error instanceof Error && error.message === "Serviço não encontrado") {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    console.error("Error toggling service status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
