export interface DashboardStats {
  todayAppointments: number
  upcomingAppointments: number
  monthlyRevenue: number
  activeServices: number
  customLink: string
}

export interface ChartDataPoint {
  date: string
  revenue: number
  completed: number
  cancelled: number
  noShow: number
}

export type PeriodFilter = 7 | 30 | 60

export interface RevenueChartData {
  data: ChartDataPoint[]
  totalRevenue: number
  totalAppointments: number
}
