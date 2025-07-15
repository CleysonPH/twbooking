import { prisma } from '@/lib/prisma'

/**
 * Converte uma data para o nome do dia da semana em inglês (formato do banco)
 */
export function getWeekdayFromDate(date: Date): string {
  const weekdays = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
  ]
  return weekdays[date.getDay()]
}

/**
 * Busca todas as disponibilidades do prestador para um dia da semana específico
 */
export async function getProviderAvailabilitiesByWeekday(
  providerId: string,
  weekday: string
) {
  return await prisma.availability.findMany({
    where: {
      providerId,
      weekday
    },
    orderBy: {
      startTime: 'asc'
    }
  })
}

/**
 * Busca agendamentos existentes do prestador para uma data específica
 */
export async function getBookingsByDate(
  providerId: string,
  date: Date
) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.booking.findMany({
    where: {
      providerId,
      dateTime: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: {
        in: ['SCHEDULED', 'COMPLETED'] // Considerar apenas agendamentos válidos
      }
    },
    select: {
      dateTime: true,
      service: {
        select: {
          duration: true
        }
      }
    }
  })
}

/**
 * Converte horário no formato "HH:MM" para minutos desde o início do dia
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Converte minutos desde o início do dia para formato "HH:MM"
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Calcula horários disponíveis baseado nas disponibilidades do prestador e agendamentos existentes
 */
export function calculateAvailableSlots(
  availabilities: Array<{ startTime: string; endTime: string }>,
  serviceDuration: number,
  existingBookings: { dateTime: Date; service: { duration: number } }[],
  slotInterval: number = 30 // Intervalo entre slots em minutos
): string[] {
  if (!availabilities || availabilities.length === 0) {
    return []
  }

  // Converter agendamentos existentes para array de intervalos ocupados
  const occupiedSlots = existingBookings.map(booking => {
    const bookingTime = new Date(booking.dateTime)
    const bookingMinutes = bookingTime.getHours() * 60 + bookingTime.getMinutes()
    return {
      start: bookingMinutes,
      end: bookingMinutes + booking.service.duration
    }
  })

  const availableSlots: string[] = []

  // Processar cada período de disponibilidade
  for (const availability of availabilities) {
    const startMinutes = timeToMinutes(availability.startTime)
    const endMinutes = timeToMinutes(availability.endTime)
    
    // Gerar slots possíveis dentro desta disponibilidade
    for (let currentMinutes = startMinutes; currentMinutes + serviceDuration <= endMinutes; currentMinutes += slotInterval) {
      const slotEnd = currentMinutes + serviceDuration
      
      // Verificar se o slot não conflita com nenhum agendamento existente
      const hasConflict = occupiedSlots.some(occupied => {
        return (
          (currentMinutes >= occupied.start && currentMinutes < occupied.end) ||
          (slotEnd > occupied.start && slotEnd <= occupied.end) ||
          (currentMinutes <= occupied.start && slotEnd >= occupied.end)
        )
      })

      const timeString = minutesToTime(currentMinutes)
      
      // Evitar duplicatas (caso haja sobreposição de horários em diferentes períodos)
      if (!hasConflict && !availableSlots.includes(timeString)) {
        availableSlots.push(timeString)
      }
    }
  }

  // Ordenar os horários
  return availableSlots.sort()
}

/**
 * Busca horários disponíveis para um serviço em uma data específica
 */
export async function getAvailableSlots(
  providerId: string,
  serviceId: string,
  date: Date
): Promise<string[]> {
  const weekday = getWeekdayFromDate(date)
  
  // Buscar todas as disponibilidades do prestador para este dia da semana
  const availabilities = await getProviderAvailabilitiesByWeekday(providerId, weekday)
  
  if (!availabilities || availabilities.length === 0) {
    return []
  }

  // Buscar dados do serviço
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { duration: true, isActive: true }
  })

  if (!service || !service.isActive) {
    return []
  }

  // Buscar agendamentos existentes
  const existingBookings = await getBookingsByDate(providerId, date)

  // Calcular e retornar slots disponíveis
  return calculateAvailableSlots(
    availabilities,
    service.duration,
    existingBookings
  )
}

/**
 * Verifica se um horário específico está disponível
 */
export async function isTimeSlotAvailable(
  providerId: string,
  serviceId: string,
  dateTime: Date
): Promise<boolean> {
  const date = new Date(dateTime)
  date.setHours(0, 0, 0, 0)
  
  const timeString = `${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`
  
  const availableSlots = await getAvailableSlots(providerId, serviceId, date)
  
  return availableSlots.includes(timeString)
}

/**
 * Cria um novo agendamento
 */
export async function createBooking(data: {
  providerId: string
  serviceId: string
  customerId: string
  dateTime: Date
  customerName: string
  customerEmail: string
  providerAddress: string
  serviceName: string
  servicePrice: number
  serviceDescription?: string | null
  createdBy?: 'customer' | 'provider'
}) {
  return await prisma.booking.create({
    data: {
      providerId: data.providerId,
      serviceId: data.serviceId,
      customerId: data.customerId,
      dateTime: data.dateTime,
      status: 'SCHEDULED',
      createdBy: data.createdBy || 'customer',
      // Snapshots para histórico
      addressSnapshot: data.providerAddress,
      serviceNameSnapshot: data.serviceName,
      servicePriceSnapshot: data.servicePrice,
      serviceDescriptionSnapshot: data.serviceDescription,
      customerNameSnapshot: data.customerName,
      customerEmailSnapshot: data.customerEmail
    },
    include: {
      provider: {
        select: {
          name: true,
          businessName: true,
          address: true,
          phone: true,
          email: true
        }
      },
      service: {
        select: {
          name: true,
          price: true,
          duration: true,
          description: true
        }
      },
      customer: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      }
    }
  })
}

/**
 * Encontra ou cria um cliente baseado no email
 */
export async function findOrCreateCustomer(
  name: string,
  email: string,
  phone: string
) {
  // Primeiro tenta encontrar o cliente pelo email
  let customer = await prisma.customer.findFirst({
    where: { email }
  })

  // Se não encontrar, cria um novo
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone
      }
    })
  } else {
    // Se encontrar, atualiza os dados para manter sempre os mais recentes
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name,
        phone
      }
    })
  }

  return customer
}
