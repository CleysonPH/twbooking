"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react"

interface AppointmentFormProps {
  providerId: string
  serviceId: string
  availability: Array<{
    weekday: string
    startTime: string
    endTime: string
  }>
  selectedDate?: string
  selectedTime?: string
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
  isLoading?: boolean
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

interface Availability {
  weekday: string
  startTime: string
  endTime: string
}

export function AppointmentForm({ 
  providerId, 
  serviceId, 
  availability,
  selectedDate, 
  selectedTime, 
  onDateSelect, 
  onTimeSelect,
  isLoading = false
}: AppointmentFormProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Obter dias da semana que têm disponibilidade
  const availableWeekdays = availability.map(avail => avail.weekday)

  // Buscar horários disponíveis quando uma data é selecionada
  useEffect(() => {
    if (!selectedDate || !providerId || !serviceId) {
      setAvailableSlots([])
      return
    }

    const fetchAvailableSlots = async () => {
      try {
        setLoadingSlots(true)
        const response = await fetch(
          `/api/available-slots?providerId=${providerId}&serviceId=${serviceId}&date=${selectedDate}`
        )
        
        if (!response.ok) {
          throw new Error('Erro ao buscar horários disponíveis')
        }
        
        const data = await response.json()
        setAvailableSlots(data.availableSlots || [])
      } catch (error) {
        console.error('Erro ao buscar horários disponíveis:', error)
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [selectedDate, providerId, serviceId])

  // Verificar se uma data está disponível
  const isDateAvailable = (date: Date) => {
    const weekday = WEEKDAYS[date.getDay()]
    return availableWeekdays.includes(weekday) && date >= today
  }

  // Navegar entre meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  // Gerar dias do calendário
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Dias da semana anterior para completar a primeira linha
    const startPadding = firstDay.getDay()
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    
    const days = []
    
    // Dias do mês anterior
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isAvailable: false
      })
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        isAvailable: isDateAvailable(date)
      })
    }
    
    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length // 6 semanas × 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isAvailable: false
      })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date) && !isLoading) {
      const dateString = date.toISOString().split('T')[0]
      onDateSelect(dateString)
    }
  }

  const handleTimeClick = (time: string) => {
    if (!isLoading) {
      onTimeSelect(time)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
  }

  return (
    <div className="space-y-6">
      {/* Calendário */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Selecionar Data</h3>
          <p className="text-sm text-muted-foreground">
            Escolha uma data disponível para o agendamento.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          {/* Header do calendário */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <h3 className="font-semibold">
                {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Headers dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAY_NAMES.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate === day.date.toISOString().split('T')[0]
              const isToday = day.date.toDateString() === today.toDateString()
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={`
                    h-10 p-0 relative
                    ${!day.isCurrentMonth ? 'text-muted-foreground/50' : ''}
                    ${day.isAvailable ? 'hover:bg-primary/10' : 'cursor-not-allowed opacity-50'}
                    ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                    ${isToday && !isSelected ? 'ring-2 ring-primary ring-inset' : ''}
                  `}
                  onClick={() => handleDateClick(day.date)}
                  disabled={!day.isAvailable || isLoading}
                >
                  {day.date.getDate()}
                  {isToday && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Button>
              )
            })}
          </div>

          {availability.length > 0 && (
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Dias disponíveis: {availability.map(a => {
                const dayIndex = WEEKDAYS.indexOf(a.weekday)
                return WEEKDAY_NAMES[dayIndex]
              }).join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Horários disponíveis */}
      {selectedDate && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Selecionar Horário</h3>
            <p className="text-sm text-muted-foreground">
              Escolha um horário disponível para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}.
            </p>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Carregando horários...</span>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedTime === slot ? "default" : "outline"}
                  size="sm"
                  className="h-12"
                  onClick={() => handleTimeClick(slot)}
                  disabled={isLoading}
                >
                  {formatTime(slot)}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum horário disponível para esta data.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente selecionar outra data.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
