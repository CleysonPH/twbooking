"use client"

import { useState } from 'react'
import { BookingStatus } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (status: BookingStatus) => void
  currentStatus: BookingStatus
  isLoading?: boolean
}

const statusOptions = [
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'Não compareceu' },
] as const

export function StatusUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  isLoading = false
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | ''>('')

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus as BookingStatus)
    }
  }

  const handleClose = () => {
    setSelectedStatus('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Status do Agendamento</DialogTitle>
          <DialogDescription>
            Selecione o novo status para este agendamento. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as BookingStatus)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={option.value === currentStatus}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedStatus || isLoading}
          >
            {isLoading ? 'Atualizando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
