import { prisma } from "./prisma"

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
