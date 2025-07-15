import { redirect } from 'next/navigation'
import { auth } from '../../../../auth'
import { prisma } from '@/lib/prisma'
import { AppointmentsClient } from './appointments-client'

export default async function AppointmentsPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  // Buscar o provider associado ao usuário logado
  const provider = await prisma.provider.findUnique({
    where: { userId: session.user?.id }
  })

  if (!provider) {
    redirect('/login')
  }

  return (
    <AppointmentsClient 
      providerName={provider.name}
      providerId={provider.id}
    />
  )
}
