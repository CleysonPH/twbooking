"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppointmentFilters } from '@/lib/appointment-types'
import { BookingStatus } from '@prisma/client'

interface AppointmentFiltersProps {
  onFilterChange: (filters: AppointmentFilters) => void
  isLoading?: boolean
}

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'Não compareceu' },
]

export function AppointmentFiltersComponent({ onFilterChange, isLoading }: AppointmentFiltersProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<string>('all')

  const handleApplyFilters = () => {
    onFilterChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status && status !== 'all' ? (status as BookingStatus) : undefined,
    })
  }

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setStatus('all')
    onFilterChange({})
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">Data final</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="flex-1"
            >
              Aplicar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              disabled={isLoading}
              className="flex-1"
            >
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
