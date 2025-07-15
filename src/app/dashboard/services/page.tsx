import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import { getProviderServices } from "@/lib/services"
import { prisma } from "@/lib/prisma"
import ServicesPageClient from "./services-client"

export default async function ServicesPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Buscar o provider associado ao usuário logado
  const provider = await prisma.provider.findUnique({
    where: { userId: session.user?.id }
  })

  if (!provider) {
    redirect("/login")
  }

  // Buscar os serviços do provider
  const services = await getProviderServices(provider.id)

  return (
    <ServicesPageClient 
      services={services}
      providerName={provider.name}
    />
  )
}
