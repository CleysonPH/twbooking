"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, parseISO } from "date-fns"
import { type PeriodFilter, type RevenueChartData } from "@/lib/dashboard-types"
import { PeriodFilter as PeriodFilterComponent } from "./period-filter"

interface RevenueChartProps {
  initialData: RevenueChartData
  initialPeriod?: PeriodFilter
}

export function RevenueChart({ initialData, initialPeriod = 7 }: RevenueChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>(initialPeriod)
  const [chartData, setChartData] = useState<RevenueChartData>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    return format(date, 'dd/MM')
  }

  const handlePeriodChange = async (newPeriod: PeriodFilter) => {
    if (newPeriod === selectedPeriod) return

    setIsLoading(true)
    setSelectedPeriod(newPeriod)

    try {
      const response = await fetch(`/api/dashboard/revenue-chart?period=${newPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setChartData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ payload: { revenue: number; completed: number; cancelled: number; noShow: number } }>
    label?: string
  }) => {
    if (active && payload && payload.length && label) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-600">
              Faturamento: {formatCurrency(data.revenue)}
            </p>
            <p className="text-blue-600">
              Concluídos: {data.completed}
            </p>
            <p className="text-red-600">
              Cancelados: {data.cancelled}
            </p>
            <p className="text-orange-600">
              Faltas: {data.noShow}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Faturamento por Dia</h2>
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(chartData.totalRevenue)} • {chartData.totalAppointments} agendamentos
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <PeriodFilterComponent
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Carregando dados...</div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
