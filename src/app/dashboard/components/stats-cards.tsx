import { DashboardStats } from "@/lib/dashboard-types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-2">Agendamentos Hoje</h3>
        <p className="text-3xl font-bold text-primary">{stats.todayAppointments}</p>
        <p className="text-sm text-muted-foreground">
          {stats.todayAppointments === 0 
            ? "Nenhum agendamento para hoje" 
            : stats.todayAppointments === 1 
            ? "1 agendamento para hoje"
            : `${stats.todayAppointments} agendamentos para hoje`
          }
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-2">Próximos 7 Dias</h3>
        <p className="text-3xl font-bold text-primary">{stats.upcomingAppointments}</p>
        <p className="text-sm text-muted-foreground">
          {stats.upcomingAppointments === 0 
            ? "Nenhum agendamento próximo" 
            : stats.upcomingAppointments === 1 
            ? "1 agendamento próximo"
            : `${stats.upcomingAppointments} agendamentos próximos`
          }
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-2">Faturamento do Mês</h3>
        <p className="text-3xl font-bold text-primary">{formatCurrency(stats.monthlyRevenue)}</p>
        <p className="text-sm text-muted-foreground">
          {stats.monthlyRevenue === 0 
            ? "Nenhum faturamento registrado" 
            : "Apenas agendamentos concluídos"
          }
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-2">Serviços Ativos</h3>
        <p className="text-3xl font-bold text-primary">{stats.activeServices}</p>
        <p className="text-sm text-muted-foreground">
          {stats.activeServices === 0 
            ? "Nenhum serviço cadastrado" 
            : stats.activeServices === 1 
            ? "1 serviço disponível"
            : `${stats.activeServices} serviços disponíveis`
          }
        </p>
      </div>
    </div>
  )
}
