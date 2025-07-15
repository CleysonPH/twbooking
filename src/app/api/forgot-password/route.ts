import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limiter'
import { generateSecureToken, getTokenExpiration } from '@/lib/password-utils'
import { sendPasswordResetEmail } from '@/lib/email-service'
import { forgotPasswordSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados com Zod
    const { email } = forgotPasswordSchema.parse(body)

    // Rate limiting - máximo 3 tentativas por hora por e-mail
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `forgot-password:${email}:${clientIp}`
    
    if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 1 hora.' },
        { status: 429 }
      )
    }

    // Verificar se o e-mail existe na base de dados
    const provider = await prisma.provider.findUnique({
      where: { email }
    })

    // Por segurança, sempre retornamos sucesso (evita enumeration attack)
    if (!provider) {
      return NextResponse.json({
        message: 'Se o e-mail estiver cadastrado, você receberá instruções para recuperação de senha.'
      })
    }

    // Gerar token seguro
    const token = generateSecureToken()
    const expires = getTokenExpiration()

    // Salvar token na base de dados
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    })

    // Enviar e-mail com link de recuperação
    try {
      await sendPasswordResetEmail(email, token)
    } catch (emailError) {
      console.error('Erro ao enviar e-mail:', emailError)
      
      // Remove o token se o e-mail falhar
      await prisma.verificationToken.delete({
        where: { token }
      }).catch(() => {}) // Ignora erro se token já foi removido
      
      // Verificar se é erro de configuração SMTP
      if (emailError instanceof Error && emailError.message.includes('Missing credentials')) {
        console.error('❌ Erro de configuração SMTP. Verifique as variáveis de ambiente SMTP_HOST, SMTP_USER, SMTP_PASS')
        return NextResponse.json(
          { error: 'Serviço de e-mail temporariamente indisponível. Tente novamente mais tarde.' },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: 'Erro interno do servidor. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Se o e-mail estiver cadastrado, você receberá instruções para recuperação de senha.'
    })

  } catch (error) {
    console.error('Erro na API forgot-password:', error)
    
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
