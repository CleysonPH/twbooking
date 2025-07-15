import { BookingStatus } from '@prisma/client'

export interface AppointmentWithDetails {
  id: string
  dateTime: Date
  status: BookingStatus
  customerNameSnapshot: string
  customerEmailSnapshot: string
  serviceNameSnapshot: string
  servicePriceSnapshot: number
  serviceDescriptionSnapshot: string | null
  addressSnapshot: string
  createdAt: Date
  updatedAt: Date
}

export interface AppointmentFilters {
  startDate?: string
  endDate?: string
  status?: BookingStatus
}

export interface StatusUpdateData {
  status: BookingStatus
}
