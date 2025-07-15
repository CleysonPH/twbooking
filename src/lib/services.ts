import { prisma } from "./prisma"
import { ServiceCreateFormData } from "./validations"

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
