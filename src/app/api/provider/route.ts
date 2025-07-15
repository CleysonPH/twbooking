import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../auth"
import { getProviderProfileByUserId, updateProviderProfileByUserId } from "@/lib/provider"
import { providerUpdateSchema } from "@/lib/validations"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const provider = await getProviderProfileByUserId(session.user.id)
    
    if (!provider) {
      return NextResponse.json(
        { error: "Provider não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(provider)
  } catch (error) {
    console.error('Erro ao buscar dados do provider:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validar dados de entrada
    const validationResult = providerUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Dados inválidos",
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const updatedProvider = await updateProviderProfileByUserId(
      session.user.id,
      validationResult.data
    )

    return NextResponse.json(updatedProvider)
  } catch (error) {
    console.error('Erro ao atualizar dados do provider:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Link personalizado já está em uso') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
