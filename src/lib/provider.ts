import { prisma } from "@/lib/prisma"
import { hash, compare } from "bcryptjs"
import type { ProviderUpdateFormData } from "@/lib/validations"

export interface ProviderProfile {
  id: string
  name: string
  businessName: string
  email: string
  phone: string
  customLink: string
  address: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Buscar dados do provider pelo ID
 */
export async function getProviderProfile(providerId: string): Promise<ProviderProfile | null> {
  try {
    const provider = await prisma.provider.findUnique({
      where: {
        id: providerId
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        phone: true,
        customLink: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return provider
  } catch (error) {
    console.error('Erro ao buscar dados do provider:', error)
    return null
  }
}

/**
 * Buscar dados do provider pelo ID do usuário
 */
export async function getProviderProfileByUserId(userId: string): Promise<ProviderProfile | null> {
  try {
    const provider = await prisma.provider.findUnique({
      where: {
        userId: userId
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        phone: true,
        customLink: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return provider
  } catch (error) {
    console.error('Erro ao buscar dados do provider:', error)
    return null
  }
}

/**
 * Atualizar dados do provider
 */
export async function updateProviderProfile(
  providerId: string, 
  data: ProviderUpdateFormData
): Promise<ProviderProfile> {
  try {
    // Verificar se o customLink já está em uso por outro provider
    const existingProvider = await prisma.provider.findFirst({
      where: {
        customLink: data.customLink,
        NOT: {
          id: providerId
        }
      }
    })

    if (existingProvider) {
      throw new Error('Link personalizado já está em uso')
    }

    const updatedProvider = await prisma.provider.update({
      where: {
        id: providerId
      },
      data: {
        name: data.name,
        businessName: data.businessName,
        phone: data.phone,
        customLink: data.customLink,
        address: data.address
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        phone: true,
        customLink: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return updatedProvider
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro ao atualizar dados do provider')
  }
}

/**
 * Alterar senha do provider
 */
export async function changeProviderPassword(
  providerId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    // Buscar a senha atual do provider
    const provider = await prisma.provider.findUnique({
      where: {
        id: providerId
      },
      select: {
        password: true
      }
    })

    if (!provider) {
      throw new Error('Provider não encontrado')
    }

    // Verificar se a senha atual está correta
    const isCurrentPasswordValid = await compare(currentPassword, provider.password)
    
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual está incorreta')
    }

    // Hash da nova senha
    const hashedNewPassword = await hash(newPassword, 12)

    // Atualizar a senha no banco
    await prisma.provider.update({
      where: {
        id: providerId
      },
      data: {
        password: hashedNewPassword
      }
    })

    return true
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro ao alterar senha')
  }
}

/**
 * Buscar ID do provider pelo ID do usuário
 */
async function getProviderIdFromUserId(userId: string): Promise<string | null> {
  try {
    const provider = await prisma.provider.findUnique({
      where: {
        userId: userId
      },
      select: {
        id: true
      }
    })

    return provider?.id || null
  } catch (error) {
    console.error('Erro ao buscar ID do provider:', error)
    return null
  }
}

/**
 * Atualizar dados do provider pelo ID do usuário
 */
export async function updateProviderProfileByUserId(
  userId: string, 
  data: ProviderUpdateFormData
): Promise<ProviderProfile> {
  try {
    const providerId = await getProviderIdFromUserId(userId)
    
    if (!providerId) {
      throw new Error('Provider não encontrado')
    }

    return await updateProviderProfile(providerId, data)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro ao atualizar dados do provider')
  }
}

/**
 * Alterar senha do provider pelo ID do usuário
 */
export async function changeProviderPasswordByUserId(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const providerId = await getProviderIdFromUserId(userId)
    
    if (!providerId) {
      throw new Error('Provider não encontrado')
    }

    return await changeProviderPassword(providerId, currentPassword, newPassword)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Erro ao alterar senha')
  }
}
