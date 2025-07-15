import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import LogoutButton from "./logout-button"
import { DashboardNav } from "./components/dashboard-nav"
import { StatsCards } from "./components/stats-cards"
import { RevenueChart } from "./components/revenue-chart"
import { PublicLinkCard } from "./components/public-link-card"
import { getDashboardStats, getRevenueChartData } from "@/lib/dashboard-stats"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Buscar dados do dashboard
  const [stats, chartData] = await Promise.all([
    getDashboardStats(session.user.id),
    getRevenueChartData(session.user.id, 7)
  ])

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

        {/* Navigation */}
        <div className="mb-8">
          <DashboardNav />
        </div>

        {/* Public Link Card */}
        <div className="mb-8">
          <PublicLinkCard customLink={stats.customLink} />
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <RevenueChart initialData={chartData} />
        </div>
      </div>
    </div>
  )
}
