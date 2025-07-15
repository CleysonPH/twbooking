import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AvailabilityClient } from "./availability-client"

export const metadata = {
  title: "Disponibilidade | TW Booking",
  description: "Configure seus horários de disponibilidade",
}

export default async function AvailabilityPage() {
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

  return (
    <AvailabilityClient providerName={provider.name} />
  )
}
