import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import LogoutButton from "./logout-button"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo, {session.user?.name || session.user?.email}!
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-2">Agendamentos Hoje</h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje</p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-2">Próximos Agendamentos</h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-2">Faturamento do Mês</h3>
            <p className="text-3xl font-bold text-primary">R$ 0,00</p>
            <p className="text-sm text-muted-foreground">Nenhum faturamento registrado</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard em Desenvolvimento</h2>
          <p className="text-muted-foreground">
            Esta é uma versão placeholder do dashboard. As funcionalidades completas 
            serão implementadas nas próximas iterações do projeto.
          </p>
          
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Informações da Sessão:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>ID:</strong> {session.user?.id}</li>
              <li><strong>Email:</strong> {session.user?.email}</li>
              <li><strong>Nome:</strong> {session.user?.name || "Não informado"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
