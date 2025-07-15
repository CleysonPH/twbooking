import { prisma } from "./prisma"
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from "date-fns"
import { DashboardStats, ChartDataPoint, RevenueChartData } from "./dashboard-types"

async function getProviderFromUserId(userId: string): Promise<{ id: string; customLink: string } | null> {
  const provider = await prisma.provider.findUnique({
    where: { userId },
    select: { id: true, customLink: true }
  })
  return provider
}

async function getProviderIdFromUserId(userId: string): Promise<string | null> {
  const provider = await prisma.provider.findUnique({
    where: { userId },
    select: { id: true }
  })
  return provider?.id || null
}

export async function getTodayAppointments(userId: string): Promise<number> {
  const providerId = await getProviderIdFromUserId(userId)
  if (!providerId) return 0
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)

  const count = await prisma.booking.count({
    where: {
      providerId,
      dateTime: {
        gte: todayStart,
        lte: todayEnd
      }
    }
  })

  return count
}

export async function getUpcomingAppointments(userId: string): Promise<number> {
  const providerId = await getProviderIdFromUserId(userId)
  if (!providerId) return 0
  const today = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(today.getDate() + 7)

  const count = await prisma.booking.count({
    where: {
      providerId,
      dateTime: {
        gte: today,
        lte: endOfDay(sevenDaysFromNow)
      }
    }
  })

  return count
}

export async function getMonthlyRevenue(userId: string): Promise<number> {
  const providerId = await getProviderIdFromUserId(userId)
  if (!providerId) return 0
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  const result = await prisma.booking.aggregate({
    where: {
      providerId,
      status: 'COMPLETED',
      dateTime: {
        gte: monthStart,
        lte: monthEnd
      }
    },
    _sum: {
      servicePriceSnapshot: true
    }
  })

  return result._sum.servicePriceSnapshot || 0
}

export async function getActiveServicesCount(userId: string): Promise<number> {
  const providerId = await getProviderIdFromUserId(userId)
  if (!providerId) return 0
  const count = await prisma.service.count({
    where: {
      providerId,
      isActive: true
    }
  })

  return count
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const provider = await getProviderFromUserId(userId)
  
  if (!provider) {
    return {
      todayAppointments: 0,
      upcomingAppointments: 0,
      monthlyRevenue: 0,
      activeServices: 0,
      customLink: ''
    }
  }

  const [todayAppointments, upcomingAppointments, monthlyRevenue, activeServices] = await Promise.all([
    getTodayAppointments(userId),
    getUpcomingAppointments(userId),
    getMonthlyRevenue(userId),
    getActiveServicesCount(userId)
  ])

  return {
    todayAppointments,
    upcomingAppointments,
    monthlyRevenue,
    activeServices,
    customLink: provider.customLink
  }
}

export async function getRevenueChartData(userId: string, days: number): Promise<RevenueChartData> {
  const providerId = await getProviderIdFromUserId(userId)
  if (!providerId) {
    return {
      data: [],
      totalRevenue: 0,
      totalAppointments: 0
    }
  }
  const endDate = new Date()
  const startDate = subDays(endDate, days - 1)

  // Buscar todos os agendamentos no período
  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      dateTime: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate)
      }
    },
    select: {
      dateTime: true,
      status: true,
      servicePriceSnapshot: true
    }
  })

  // Criar um mapa para agrupar dados por data
  const dataMap = new Map<string, ChartDataPoint>()

  // Inicializar todas as datas no período com valores zero
  for (let i = 0; i < days; i++) {
    const currentDate = subDays(endDate, days - 1 - i)
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    dataMap.set(dateKey, {
      date: dateKey,
      revenue: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0
    })
  }

  // Processar os agendamentos e preencher os dados
  bookings.forEach(booking => {
    const dateKey = format(booking.dateTime, 'yyyy-MM-dd')
    const dataPoint = dataMap.get(dateKey)
    
    if (dataPoint) {
      switch (booking.status) {
        case 'COMPLETED':
          dataPoint.completed += 1
          dataPoint.revenue += booking.servicePriceSnapshot || 0
          break
        case 'CANCELLED':
          dataPoint.cancelled += 1
          break
        case 'NO_SHOW':
          dataPoint.noShow += 1
          break
      }
    }
  })

  // Converter para array e ordenar por data
  const data = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // Calcular totais
  const totalRevenue = data.reduce((sum, point) => sum + point.revenue, 0)
  const totalAppointments = data.reduce((sum, point) => sum + point.completed + point.cancelled + point.noShow, 0)

  return {
    data,
    totalRevenue,
    totalAppointments
  }
}
