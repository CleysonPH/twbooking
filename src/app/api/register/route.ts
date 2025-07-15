import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerApiSchema } from '@/lib/validations'
import { ZodError } from 'zod'

// Função para gerar customLink único
function generateCustomLink(businessName: string): string {
  return businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, '') // Remove hífens do início e fim
}

async function ensureUniqueCustomLink(baseLink: string): Promise<string> {
  let customLink = baseLink
  let counter = 1

  while (true) {
    const existing = await prisma.provider.findUnique({
      where: { customLink }
    })

    if (!existing) {
      return customLink
    }

    customLink = `${baseLink}-${counter}`
    counter++
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validar dados com Zod
    const validatedData = registerApiSchema.parse(body)
    const { name, businessName, email, password, phone, address } = validatedData

    // Verificar se o email já existe
    const existingProvider = await prisma.provider.findUnique({
      where: { email }
    })

    if (existingProvider) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Gerar customLink único
    const baseCustomLink = generateCustomLink(businessName)
    const customLink = await ensureUniqueCustomLink(baseCustomLink)

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário e prestador em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar o usuário para Auth.js
      const user = await tx.user.create({
        data: {
          name,
          email,
        }
      })

      // Criar o prestador
      const provider = await tx.provider.create({
        data: {
          name,
          businessName,
          email,
          password: hashedPassword,
          phone,
          address,
          customLink,
          userId: user.id,
        }
      })

      return { user, provider }
    })

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso!',
      customLink: result.provider.customLink
    })

  } catch (error) {
    console.error('Erro ao criar conta:', error)
    
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
