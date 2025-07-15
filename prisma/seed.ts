import { PrismaClient, BookingStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (opcional - remova se não quiser limpar)
  await prisma.booking.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.service.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.provider.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Dados existentes removidos')

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      emailVerified: new Date(),
    }
  })

  // Hash da senha
  const hashedPassword = await bcrypt.hash('123456789', 10)

  // Criar prestador de serviço
  const provider = await prisma.provider.create({
    data: {
      name: 'João Silva',
      businessName: 'Salão de Beleza João Silva',
      email: 'joao@exemplo.com',
      password: hashedPassword,
      phone: '(11) 99999-9999',
      customLink: 'joao-silva-salao',
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01234-567',
      userId: user.id,
    }
  })

  console.log('👤 Prestador de serviço criado')

  // Criar serviços
  const services = await Promise.all([
    prisma.service.create({
      data: {
        providerId: provider.id,
        name: 'Corte de Cabelo Masculino',
        price: 35.00,
        duration: 30,
        description: 'Corte de cabelo masculino tradicional e moderno',
        isActive: true,
      }
    }),
    prisma.service.create({
      data: {
        providerId: provider.id,
        name: 'Corte de Cabelo Feminino',
        price: 45.00,
        duration: 45,
        description: 'Corte de cabelo feminino com acabamento',
        isActive: true,
      }
    }),
    prisma.service.create({
      data: {
        providerId: provider.id,
        name: 'Barba e Bigode',
        price: 25.00,
        duration: 20,
        description: 'Aparar barba e bigode com navalha',
        isActive: true,
      }
    }),
    prisma.service.create({
      data: {
        providerId: provider.id,
        name: 'Escova Progressiva',
        price: 120.00,
        duration: 120,
        description: 'Tratamento de alisamento capilar',
        isActive: false, // Serviço inativo
      }
    }),
  ])

  console.log('✂️ Serviços criados')

  // Criar disponibilidade (Segunda a Sexta: 8h às 18h, Sábado: 8h às 14h)
  await Promise.all([
    // Segunda-feira
    prisma.availability.create({
      data: {
        providerId: provider.id,
        weekday: 'monday',
        startTime: '08:00',
        endTime: '18:00',
      }
    }),
    // Terça-feira
    prisma.availability.create({
      data: {
        providerId: provider.id,
        weekday: 'tuesday',
        startTime: '08:00',
        endTime: '18:00',
      }
    }),
    // Quarta-feira
    prisma.availability.create({
      data: {
        providerId: provider.id,
        weekday: 'wednesday',
        startTime: '08:00',
        endTime: '18:00',
      }
    }),
    // Quinta-feira
    prisma.availability.create({
      data: {
        providerId: provider.id,
        weekday: 'thursday',
        startTime: '08:00',
        endTime: '18:00',
      }
    }),
    // Sexta-feira
    prisma.availability.create({
      data: {
        providerId: provider.id,
        weekday: 'friday',
        startTime: '08:00',
        endTime: '18:00',
      }
    }),
    // Sábado
    prisma.availability.create({
      data: {
        providerId: provider.id,
        weekday: 'saturday',
        startTime: '08:00',
        endTime: '14:00',
      }
    }),
  ])

  console.log('⏰ Disponibilidade criada')

  // Função para gerar nomes aleatórios
  const firstNames = ['Ana', 'Carlos', 'Maria', 'José', 'Fernanda', 'Ricardo', 'Juliana', 'Roberto', 'Patrícia', 'Marcos', 'Larissa', 'Diego', 'Camila', 'Bruno', 'Gabriela', 'Thiago', 'Amanda', 'Felipe', 'Beatriz', 'Lucas']
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa']

  function generateRandomName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    return `${firstName} ${lastName}`
  }

  function generateRandomEmail(name: string) {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.')
    const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com']
    const domain = domains[Math.floor(Math.random() * domains.length)]
    return `${cleanName}@${domain}`
  }

  function generateRandomPhone() {
    const area = Math.floor(Math.random() * 89) + 11 // DDD de 11 a 99
    const number = Math.floor(Math.random() * 900000000) + 100000000 // 9 dígitos
    return `(${area}) 9${number.toString().substring(0, 4)}-${number.toString().substring(4, 8)}`
  }

  // Função para gerar horários de trabalho
  function getWorkingHours(date: Date) {
    const dayOfWeek = date.getDay() // 0 = domingo, 1 = segunda, etc.
    
    // Não trabalha domingo
    if (dayOfWeek === 0) return []
    
    // Sábado: 8h às 14h
    if (dayOfWeek === 6) {
      return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30']
    }
    
    // Segunda a sexta: 8h às 18h
    return [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ]
  }

  // Criar clientes e agendamentos dos últimos 7 dias (60 serviços realizados)
  console.log('📅 Criando agendamentos dos últimos 7 dias...')
  
  const today = new Date()
  const pastBookings = []
  
  for (let i = 0; i < 60; i++) {
    // Data aleatória nos últimos 7 dias
    const daysAgo = Math.floor(Math.random() * 7) + 1
    const bookingDate = new Date(today)
    bookingDate.setDate(today.getDate() - daysAgo)
    
    // Verificar se é dia de trabalho
    const workingHours = getWorkingHours(bookingDate)
    if (workingHours.length === 0) {
      i-- // Tentar novamente se for domingo
      continue
    }
    
    // Horário aleatório
    const randomHour = workingHours[Math.floor(Math.random() * workingHours.length)]
    const [hours, minutes] = randomHour.split(':').map(Number)
    bookingDate.setHours(hours, minutes, 0, 0)
    
    // Serviço aleatório (apenas ativos)
    const activeServices = services.filter(s => s.isActive)
    const randomService = activeServices[Math.floor(Math.random() * activeServices.length)]
    
    // Criar cliente
    const customerName = generateRandomName()
    const customer = await prisma.customer.create({
      data: {
        name: customerName,
        email: generateRandomEmail(customerName),
        phone: generateRandomPhone(),
      }
    })
    
    // Status aleatório para agendamentos passados
    const statuses = [BookingStatus.COMPLETED, BookingStatus.COMPLETED, BookingStatus.COMPLETED, BookingStatus.NO_SHOW, BookingStatus.CANCELLED]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    pastBookings.push({
      providerId: provider.id,
      serviceId: randomService.id,
      customerId: customer.id,
      dateTime: bookingDate,
      status: randomStatus,
      createdBy: Math.random() > 0.7 ? 'provider' : 'customer',
      addressSnapshot: provider.address,
      serviceNameSnapshot: randomService.name,
      servicePriceSnapshot: randomService.price,
      serviceDescriptionSnapshot: randomService.description,
      customerNameSnapshot: customerName,
      customerEmailSnapshot: generateRandomEmail(customerName),
    })
  }
  
  // Inserir agendamentos passados em lotes
  for (let i = 0; i < pastBookings.length; i += 10) {
    const batch = pastBookings.slice(i, i + 10)
    await prisma.booking.createMany({
      data: batch
    })
  }
  
  console.log('✅ 60 agendamentos dos últimos 7 dias criados')
  
  // Criar agendamentos dos próximos 7 dias (30 serviços agendados)
  console.log('📅 Criando agendamentos dos próximos 7 dias...')
  
  const futureBookings = []
  
  for (let i = 0; i < 30; i++) {
    // Data aleatória nos próximos 7 dias
    const daysAhead = Math.floor(Math.random() * 7) + 1
    const bookingDate = new Date(today)
    bookingDate.setDate(today.getDate() + daysAhead)
    
    // Verificar se é dia de trabalho
    const workingHours = getWorkingHours(bookingDate)
    if (workingHours.length === 0) {
      i-- // Tentar novamente se for domingo
      continue
    }
    
    // Horário aleatório
    const randomHour = workingHours[Math.floor(Math.random() * workingHours.length)]
    const [hours, minutes] = randomHour.split(':').map(Number)
    bookingDate.setHours(hours, minutes, 0, 0)
    
    // Serviço aleatório (apenas ativos)
    const activeServices = services.filter(s => s.isActive)
    const randomService = activeServices[Math.floor(Math.random() * activeServices.length)]
    
    // Criar cliente
    const customerName = generateRandomName()
    const customer = await prisma.customer.create({
      data: {
        name: customerName,
        email: generateRandomEmail(customerName),
        phone: generateRandomPhone(),
      }
    })
    
    futureBookings.push({
      providerId: provider.id,
      serviceId: randomService.id,
      customerId: customer.id,
      dateTime: bookingDate,
      status: BookingStatus.SCHEDULED,
      createdBy: Math.random() > 0.3 ? 'customer' : 'provider',
      addressSnapshot: provider.address,
      serviceNameSnapshot: randomService.name,
      servicePriceSnapshot: randomService.price,
      serviceDescriptionSnapshot: randomService.description,
      customerNameSnapshot: customerName,
      customerEmailSnapshot: generateRandomEmail(customerName),
    })
  }
  
  // Inserir agendamentos futuros em lotes
  for (let i = 0; i < futureBookings.length; i += 10) {
    const batch = futureBookings.slice(i, i + 10)
    await prisma.booking.createMany({
      data: batch
    })
  }
  
  console.log('✅ 30 agendamentos dos próximos 7 dias criados')
  
  console.log('🎉 Seed completado com sucesso!')
  console.log('📊 Resumo:')
  console.log('  - 1 prestador de serviço')
  console.log('  - 4 serviços (1 inativo)')
  console.log('  - 6 horários de disponibilidade')
  console.log('  - 90 clientes')
  console.log('  - 60 agendamentos dos últimos 7 dias')
  console.log('  - 30 agendamentos dos próximos 7 dias')
  console.log('')
  console.log('🔐 Credenciais de acesso:')
  console.log('  Email: joao@exemplo.com')
  console.log('  Senha: 123456789')
  console.log('  Link público: http://localhost:3000/booking/joao-silva-salao')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
