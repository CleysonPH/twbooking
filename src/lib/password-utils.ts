import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

/**
 * Valida a força da senha
 */
export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres')
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra')
  }

  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Gera um token seguro para recuperação de senha
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Faz hash da senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Verifica se a senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Calcula o tempo de expiração do token (1 hora)
 */
export function getTokenExpiration(): Date {
  return new Date(Date.now() + 60 * 60 * 1000) // 1 hora
}
