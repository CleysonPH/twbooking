import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password-utils'
import { sendPasswordChangedEmail } from '@/lib/email-service'
import { resetPasswordSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados com Zod
    const { token, password } = resetPasswordSchema.parse(body)

    // Verificar se o token existe e não expirou
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    // Verificar se o token não expirou
    if (verificationToken.expires < new Date()) {
      // Remove token expirado
      await prisma.verificationToken.delete({
        where: { token }
      })
      
      return NextResponse.json(
        { error: 'Token expirado. Solicite uma nova recuperação de senha.' },
        { status: 400 }
      )
    }

    // Buscar o provider pelo e-mail
    const provider = await prisma.provider.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(password)

    // Atualizar a senha e registrar timestamp da alteração
    await prisma.provider.update({
      where: { id: provider.id },
      data: {
        password: hashedPassword,
        passwordResetAt: new Date()
      }
    })

    // Invalidar o token usado
    await prisma.verificationToken.delete({
      where: { token }
    })

    // Enviar e-mail de confirmação
    try {
      await sendPasswordChangedEmail(provider.email)
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de confirmação:', emailError)
      // Não falhamos a operação se o e-mail não for enviado
    }

    return NextResponse.json({
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('Erro na API reset-password:', error)
    
    // Tratar erros de validação do Zod
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
      
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          fieldErrors 
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
