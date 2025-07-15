import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { changeProviderPasswordByUserId } from "@/lib/provider"
import { changePasswordSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
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
    const validationResult = changePasswordSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Dados inválidos",
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validationResult.data

    await changeProviderPasswordByUserId(
      session.user.id,
      currentPassword,
      newPassword
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Senha atual está incorreta') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      if (error.message === 'Provider não encontrado') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
