import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limiter'
import { generateSecureToken, getTokenExpiration } from '@/lib/password-utils'
import { sendPasswordResetEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validação básica do e-mail
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    // Validação do formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de e-mail inválido' },
        { status: 400 }
      )
    }

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
      where: { email: email.toLowerCase().trim() }
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
        identifier: email.toLowerCase().trim(),
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
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
