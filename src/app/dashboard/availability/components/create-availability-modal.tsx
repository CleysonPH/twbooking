"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AvailabilityForm } from "./availability-form"
import { AvailabilityFormData } from "@/lib/validations"

interface CreateAvailabilityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AvailabilityFormData) => Promise<void>
}

export function CreateAvailabilityModal({
  open,
  onOpenChange,
  onSubmit
}: CreateAvailabilityModalProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: AvailabilityFormData) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Horário</DialogTitle>
          <DialogDescription>
            Configure um novo horário de disponibilidade para seus serviços.
          </DialogDescription>
        </DialogHeader>
        
        <AvailabilityForm
          onSubmit={handleSubmit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}
