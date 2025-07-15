import { getProviderByCustomLink } from "@/lib/services"
import { PublicProviderClient } from "./components/public-provider-client"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface PublicProviderPageProps {
  params: Promise<{
    customLink: string
  }>
}

export async function generateMetadata({ params }: PublicProviderPageProps): Promise<Metadata> {
  const { customLink } = await params
  const provider = await getProviderByCustomLink(customLink)
  
  if (!provider) {
    return {
      title: "Prestador não encontrado - TWBooking"
    }
  }

  return {
    title: `${provider.businessName} - Agendamento Online`,
    description: `Agende seus serviços com ${provider.businessName}. Confira nossos serviços disponíveis e faça seu agendamento online.`,
  }
}

export default async function PublicProviderPage({ params }: PublicProviderPageProps) {
  const { customLink } = await params
  const provider = await getProviderByCustomLink(customLink)

  if (!provider) {
    notFound()
  }

  return <PublicProviderClient provider={provider} />
}
