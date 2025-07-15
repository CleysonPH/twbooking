import { prisma } from "./prisma"
import { ServiceCreateFormData, ServiceUpdateFormData } from "./validations"

export async function getProviderServices(providerId: string) {
  return await prisma.service.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getServiceById(serviceId: string, providerId: string) {
  return await prisma.service.findFirst({
    where: { 
      id: serviceId,
      providerId 
    }
  })
}

export async function createService(data: ServiceCreateFormData, providerId: string) {
  return await prisma.service.create({
    data: {
      ...data,
      providerId,
      description: data.description || null
    }
  })
}

export async function updateService(serviceId: string, data: ServiceUpdateFormData, providerId: string) {
  // Verificar se o serviço pertence ao provider
  const existingService = await getServiceById(serviceId, providerId)
  if (!existingService) {
    throw new Error("Serviço não encontrado")
  }

  return await prisma.service.update({
    where: { id: serviceId },
    data: {
      ...data,
      description: data.description || null
    }
  })
}

export async function toggleServiceStatus(serviceId: string, isActive: boolean, providerId: string) {
  // Verificar se o serviço pertence ao provider
  const existingService = await getServiceById(serviceId, providerId)
  if (!existingService) {
    throw new Error("Serviço não encontrado")
  }

  return await prisma.service.update({
    where: { id: serviceId },
    data: { isActive }
  })
}
