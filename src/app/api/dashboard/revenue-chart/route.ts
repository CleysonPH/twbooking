import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../auth"
import { getRevenueChartData } from "@/lib/dashboard-stats"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get("period")
    const period = periodParam ? parseInt(periodParam) : 7

    // Validar período
    if (![7, 30, 60].includes(period)) {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 })
    }

    const data = await getRevenueChartData(session.user.id, period)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao buscar dados do gráfico:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
