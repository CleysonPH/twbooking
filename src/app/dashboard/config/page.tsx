import { auth } from "../../../../auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "../components/dashboard-nav"
import { ConfigForm } from "./components/config-form"
import { getProviderProfileByUserId } from "@/lib/provider"
import LogoutButton from "../logout-button"

export default async function ConfigPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Buscar dados do provider pelo userId
  const provider = await getProviderProfileByUserId(session.user.id)

  if (!provider) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas informações pessoais e configurações da conta
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <DashboardNav />
        </div>

        {/* Configuration Form */}
        <div className="space-y-6">
          <ConfigForm provider={provider} />
        </div>
      </div>
    </div>
  )
}
