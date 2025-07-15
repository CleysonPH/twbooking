import { BookingStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: BookingStatus
}

const statusConfig = {
  SCHEDULED: {
    label: 'Agendado',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  COMPLETED: {
    label: 'Concluído',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  CANCELLED: {
    label: 'Cancelado',
    variant: 'default' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  NO_SHOW: {
    label: 'Não compareceu',
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant}
      className={config.className}
    >
      {config.label}
    </Badge>
  )
}
