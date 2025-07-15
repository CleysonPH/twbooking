import { prisma } from './prisma'
import { Availability } from '@prisma/client'
import { AvailabilityCreateData, AvailabilityUpdateData } from './validations'

// Buscar toda disponibilidade do prestador
export async function getProviderAvailability(providerId: string): Promise<Availability[]> {
  return await prisma.availability.findMany({
    where: {
      providerId
    },
    orderBy: [
      { weekday: 'asc' },
      { startTime: 'asc' }
    ]
  })
}

// Criar nova disponibilidade
export async function createAvailability(
  data: AvailabilityCreateData,
  providerId: string
): Promise<Availability> {
  // Verificar sobreposição antes de criar
  const hasOverlap = await validateTimeOverlap(
    providerId,
    data.weekday,
    data.startTime,
    data.endTime
  )

  if (hasOverlap) {
    throw new Error('Este horário sobrepõe com uma disponibilidade existente')
  }

  return await prisma.availability.create({
    data: {
      ...data,
      providerId
    }
  })
}

// Atualizar disponibilidade
export async function updateAvailability(
  availabilityId: string,
  data: AvailabilityUpdateData,
  providerId: string
): Promise<Availability> {
  // Verificar se a disponibilidade pertence ao prestador
  const existing = await prisma.availability.findUnique({
    where: { id: availabilityId }
  })

  if (!existing || existing.providerId !== providerId) {
    throw new Error('Disponibilidade não encontrada ou não autorizada')
  }

  // Verificar sobreposição (excluindo a própria disponibilidade)
  const hasOverlap = await validateTimeOverlap(
    providerId,
    data.weekday,
    data.startTime,
    data.endTime,
    availabilityId
  )

  if (hasOverlap) {
    throw new Error('Este horário sobrepõe com uma disponibilidade existente')
  }

  return await prisma.availability.update({
    where: { id: availabilityId },
    data
  })
}

// Excluir disponibilidade
export async function deleteAvailability(
  availabilityId: string,
  providerId: string
): Promise<void> {
  // Verificar se a disponibilidade pertence ao prestador
  const existing = await prisma.availability.findUnique({
    where: { id: availabilityId }
  })

  if (!existing || existing.providerId !== providerId) {
    throw new Error('Disponibilidade não encontrada ou não autorizada')
  }

  await prisma.availability.delete({
    where: { id: availabilityId }
  })
}

// Validar sobreposição de horários
export async function validateTimeOverlap(
  providerId: string,
  weekday: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<boolean> {
  const baseWhereClause = {
    providerId,
    weekday,
    OR: [
      // Novo horário inicia dentro de um existente
      {
        AND: [
          { startTime: { lte: startTime } },
          { endTime: { gt: startTime } }
        ]
      },
      // Novo horário termina dentro de um existente
      {
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gte: endTime } }
        ]
      },
      // Novo horário engloba um existente
      {
        AND: [
          { startTime: { gte: startTime } },
          { endTime: { lte: endTime } }
        ]
      }
    ]
  }

  // Excluir a própria disponibilidade em caso de atualização
  const whereClause = excludeId 
    ? { ...baseWhereClause, id: { not: excludeId } }
    : baseWhereClause

  const overlapping = await prisma.availability.findFirst({
    where: whereClause
  })

  return !!overlapping
}

// Formatar disponibilidade para exibição
export function formatAvailabilityForDisplay(availability: Availability[]) {
  const weekdayLabels: Record<string, string> = {
    MONDAY: 'Segunda-feira',
    TUESDAY: 'Terça-feira',
    WEDNESDAY: 'Quarta-feira',
    THURSDAY: 'Quinta-feira',
    FRIDAY: 'Sexta-feira',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo'
  }

  const weekdayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

  // Agrupar por dia da semana
  const groupedByWeekday = availability.reduce((acc, item) => {
    if (!acc[item.weekday]) {
      acc[item.weekday] = []
    }
    acc[item.weekday].push(item)
    return acc
  }, {} as Record<string, Availability[]>)

  // Ordenar por dia da semana e horário
  return weekdayOrder.map(weekday => ({
    weekday,
    label: weekdayLabels[weekday],
    slots: (groupedByWeekday[weekday] || []).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    )
  })).filter(day => day.slots.length > 0)
}

// Formatar horário para exibição (HH:MM)
export function formatTimeForDisplay(time: string): string {
  return time.substring(0, 5) // Remove segundos se existirem
}

// Validar se horário está no formato correto
export function isValidTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
}
