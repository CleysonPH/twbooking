import { z } from "zod"

// Enum para dias da semana
export const WeekdayEnum = z.enum([
  'MONDAY',
  'TUESDAY', 
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
])

// Schema de validação de horário (formato HH:MM)
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de horário inválido (use HH:MM)")

// Schema para registro de usuário
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  businessName: z
    .string()
    .min(2, "Nome do negócio deve ter pelo menos 2 caracteres")
    .max(100, "Nome do negócio deve ter no máximo 100 caracteres")
    .trim(),
  address: z
    .string()
    .min(5, "Endereço deve ter pelo menos 5 caracteres")
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .trim(),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone deve ter no máximo 15 dígitos")
    .regex(/^[\d\s\(\)\-\+]+$/, "Formato de telefone inválido")
    .trim(),
  email: z
    .email("Formato de email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .regex(/[a-zA-Z]/, "Senha deve conter pelo menos uma letra")
    .regex(/\d/, "Senha deve conter pelo menos um número"),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
  }
)

export type RegisterFormData = z.infer<typeof registerSchema>

// Schema para login
export const loginSchema = z.object({
  email: z
    .email("Formato de email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .max(100, "Senha deve ter no máximo 100 caracteres")
})

export type LoginFormData = z.infer<typeof loginSchema>

// Schema para esqueci minha senha
export const forgotPasswordSchema = z.object({
  email: z
    .email("Formato de email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres")
    .trim()
    .toLowerCase()
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Schema para resetar senha
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .regex(/[a-zA-Z]/, "Senha deve conter pelo menos uma letra")
    .regex(/\d/, "Senha deve conter pelo menos um número"),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
  }
)

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Schema para detalhes de serviço (apenas leitura)
export const serviceDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  duration: z.number(),
  description: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type ServiceDetail = z.infer<typeof serviceDetailSchema>

// Schema para criação de serviço
export const serviceCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  price: z
    .number({
      message: "Preço é obrigatório"
    })
    .positive("Preço deve ser positivo")
    .max(99999.99, "Preço deve ser menor que R$ 99.999,99"),
  duration: z
    .number({
      message: "Duração é obrigatória"
    })
    .min(15, "Duração mínima é de 15 minutos")
    .max(480, "Duração máxima é de 8 horas (480 minutos)")
    .refine(
      (value) => value % 15 === 0,
      {
        message: "Duração deve ser um múltiplo de 15 minutos"
      }
    ),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .trim()
    .optional()
    .or(z.literal(""))
})

export type ServiceCreateFormData = z.infer<typeof serviceCreateSchema>

// Schema para atualização de serviço (baseado no schema de criação)
export const serviceUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  price: z
    .number({
      message: "Preço é obrigatório"
    })
    .positive("Preço deve ser positivo")
    .max(99999.99, "Preço deve ser menor que R$ 99.999,99"),
  duration: z
    .number({
      message: "Duração é obrigatória"
    })
    .min(15, "Duração mínima é de 15 minutos")
    .max(480, "Duração máxima é de 8 horas (480 minutos)")
    .refine(
      (value) => value % 15 === 0,
      {
        message: "Duração deve ser um múltiplo de 15 minutos"
      }
    ),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .trim()
    .optional()
    .or(z.literal(""))
})

export type ServiceUpdateFormData = z.infer<typeof serviceUpdateSchema>

// Schema para toggle de status do serviço
export const serviceToggleStatusSchema = z.object({
  isActive: z.boolean()
})

export type ServiceToggleStatusData = z.infer<typeof serviceToggleStatusSchema>

// Schemas para disponibilidade do prestador
export const availabilityCreateSchema = z.object({
  weekday: WeekdayEnum,
  startTime: timeSchema,
  endTime: timeSchema
}).refine(data => data.startTime < data.endTime, {
  message: "Horário de início deve ser anterior ao horário de término",
  path: ["endTime"]
})

export const availabilityUpdateSchema = availabilityCreateSchema

export type AvailabilityFormData = z.infer<typeof availabilityCreateSchema>
export type AvailabilityCreateData = z.infer<typeof availabilityCreateSchema>
export type AvailabilityUpdateData = z.infer<typeof availabilityUpdateSchema>

// Schema para disponibilidade de serviço
export const serviceAvailabilitySchema = z.object({
  weekday: WeekdayEnum,
  startTime: timeSchema,
  endTime: timeSchema
}).refine(data => data.startTime < data.endTime, {
  message: "Hora de início deve ser anterior à hora de término"
})

export type ServiceAvailabilityFormData = z.infer<typeof serviceAvailabilitySchema>

// Schema para agendamento público do cliente
export const customerBookingSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  email: z
    .email("E-mail inválido")
    .max(255, "E-mail deve ter no máximo 255 caracteres")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone deve ter no máximo 15 dígitos")
    .regex(/^[\d\s\(\)\-\+]+$/, "Formato de telefone inválido")
    .trim(),
  selectedDate: z.string().min(1, "Data é obrigatória"),
  selectedTime: z.string().min(1, "Horário é obrigatório"),
  serviceId: z.string().min(1, "ID do serviço é obrigatório")
})

export type CustomerBookingData = z.infer<typeof customerBookingSchema>

// Schema para buscar horários disponíveis
export const availableSlotsSchema = z.object({
  providerId: z.string().min(1, "ID do prestador é obrigatório"),
  serviceId: z.string().min(1, "ID do serviço é obrigatório"),
  date: z.string().min(1, "Data é obrigatória")
})

export type AvailableSlotsParams = z.infer<typeof availableSlotsSchema>

// Schema para agendamento criado pelo prestador
export const providerBookingSchema = z.object({
  serviceId: z.string().min(1, "ID do serviço é obrigatório"),
  customerId: z.string().optional(), // Se cliente já existe
  customerData: z.object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres")
      .trim(),
    email: z
      .email("E-mail inválido")
      .max(255, "E-mail deve ter no máximo 255 caracteres")
      .trim()
      .toLowerCase(),
    phone: z
      .string()
      .min(10, "Telefone deve ter pelo menos 10 dígitos")
      .max(15, "Telefone deve ter no máximo 15 dígitos")
      .regex(/^[\d\s\(\)\-\+]+$/, "Formato de telefone inválido")
      .trim(),
  }).optional(),
  selectedDate: z.string().min(1, "Data é obrigatória"),
  selectedTime: z.string().min(1, "Horário é obrigatório"),
  createdBy: z.literal('provider')
})

export type ProviderBookingData = z.infer<typeof providerBookingSchema>

// Schema para atualização de dados do provider
export const providerUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  businessName: z
    .string()
    .min(2, "Nome do negócio deve ter pelo menos 2 caracteres")
    .max(100, "Nome do negócio deve ter no máximo 100 caracteres")
    .trim(),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone deve ter no máximo 15 dígitos")
    .regex(/^[\d\s\(\)\-\+]+$/, "Formato de telefone inválido")
    .trim(),
  customLink: z
    .string()
    .min(3, "Link personalizado deve ter pelo menos 3 caracteres")
    .max(50, "Link personalizado deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9\-_]+$/, "Link personalizado deve conter apenas letras, números, hífen e underscore")
    .trim()
    .toLowerCase(),
  address: z
    .string()
    .min(5, "Endereço deve ter pelo menos 5 caracteres")
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .trim()
})

export type ProviderUpdateFormData = z.infer<typeof providerUpdateSchema>

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z
    .string()
    .min(8, "Nova senha deve ter pelo menos 8 caracteres")
    .max(100, "Nova senha deve ter no máximo 100 caracteres")
    .regex(/[a-zA-Z]/, "Nova senha deve conter pelo menos uma letra")
    .regex(/\d/, "Nova senha deve conter pelo menos um número"),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As senhas não coincidem",
  path: ["confirmNewPassword"]
})

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
