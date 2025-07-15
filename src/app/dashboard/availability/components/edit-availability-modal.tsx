"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Availability } from "@prisma/client"
import { AvailabilityForm } from "./availability-form"
import { AvailabilityFormData } from "@/lib/validations"

interface EditAvailabilityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availability: Availability
  onSubmit: (data: AvailabilityFormData) => Promise<void>
}

export function EditAvailabilityModal({
  open,
  onOpenChange,
  availability,
  onSubmit
}: EditAvailabilityModalProps) {
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
          <DialogTitle>Editar Horário</DialogTitle>
          <DialogDescription>
            Modifique os detalhes deste horário de disponibilidade.
          </DialogDescription>
        </DialogHeader>
        
        <AvailabilityForm
          initialData={availability}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}
