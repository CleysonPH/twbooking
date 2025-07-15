interface RateLimitEntry {
  count: number
  resetTime: number
}

// Armazenamento em memória para rate limiting (em produção, usar Redis)
const attempts: Map<string, RateLimitEntry> = new Map()

/**
 * Implementa rate limiting simples
 * @param key - Chave única (email ou IP)
 * @param maxAttempts - Número máximo de tentativas
 * @param windowMs - Janela de tempo em milissegundos
 * @returns true se permitido, false se excedeu o limite
 */
export function checkRateLimit(key: string, maxAttempts: number = 3, windowMs: number = 60 * 60 * 1000): boolean {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry) {
    attempts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (now > entry.resetTime) {
    // Reset do contador após a janela de tempo
    attempts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxAttempts) {
    return false
  }

  entry.count++
  return true
}

/**
 * Limpa entradas expiradas do rate limiter
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of attempts.entries()) {
    if (now > entry.resetTime) {
      attempts.delete(key)
    }
  }
}

// Limpa entradas expiradas a cada 10 minutos
setInterval(cleanupExpiredEntries, 10 * 60 * 1000)
