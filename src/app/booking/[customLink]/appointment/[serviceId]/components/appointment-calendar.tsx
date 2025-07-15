"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface AppointmentCalendarProps {
  provider: {
    id: string
  }
  availability: Array<{
    weekday: string
    startTime: string
    endTime: string
  }>
  onDateSelect: (date: Date) => void
}

const WEEKDAYS = [
  'SUNDAY',
  'MONDAY', 
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
]

const WEEKDAY_NAMES = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb'
]

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function AppointmentCalendar({ availability, onDateSelect }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Obter dias da semana que têm disponibilidade
  const availableWeekdays = new Set(availability.map(a => a.weekday))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Primeiro dia do mês e último dia do mês
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  // Primeiro dia da semana a ser exibido (pode ser do mês anterior)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())
  
  // Último dia da semana a ser exibido (pode ser do próximo mês)
  const endDate = new Date(lastDayOfMonth)
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()))

  // Gerar array de dias para exibir
  const days = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  const isDateAvailable = (date: Date) => {
    // Não permite datas passadas
    if (date < today) {
      return false
    }

    const weekday = WEEKDAYS[date.getDay()]
    return availableWeekdays.has(weekday)
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date) && isCurrentMonth(date)) {
      onDateSelect(date)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Escolha uma data</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Apenas datas com disponibilidade podem ser selecionadas
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {/* Header do calendário */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h4 className="font-semibold">
            {MONTH_NAMES[month]} {year}
          </h4>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAY_NAMES.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isAvailable = isDateAvailable(date)
            const isCurrentMonthDate = isCurrentMonth(date)
            const isToday = date.getTime() === today.getTime()

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={!isAvailable || !isCurrentMonthDate}
                className={`
                  h-10 w-10 text-sm rounded-md transition-colors
                  ${!isCurrentMonthDate 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : isAvailable
                      ? 'hover:bg-primary hover:text-primary-foreground cursor-pointer border border-primary/20'
                      : 'text-gray-400 cursor-not-allowed'
                  }
                  ${isToday && isCurrentMonthDate ? 'bg-gray-100 font-bold' : ''}
                  ${isAvailable && isCurrentMonthDate ? 'text-primary font-medium' : ''}
                `}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-primary/20"></div>
            <span>Datas disponíveis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-100"></div>
            <span>Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-300"></div>
            <span>Datas indisponíveis</span>
          </div>
        </div>
      </div>
    </div>
  )
}
