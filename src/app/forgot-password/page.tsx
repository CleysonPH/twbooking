'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Por favor, insira seu e-mail')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast.success('Instruções enviadas! Verifique seu e-mail.')
      } else {
        toast.error(data.error || 'Erro ao enviar instruções')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao enviar instruções. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              E-mail enviado!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Instruções para recuperação de senha foram enviadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">
                Se o e-mail <strong>{email}</strong> estiver cadastrado em nosso sistema, 
                você receberá instruções para redefinir sua senha.
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Verifique sua caixa de entrada e spam</p>
              <p>• O link é válido por apenas 1 hora</p>
              <p>• Pode ser usado apenas uma vez</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
                variant="outline"
                className="w-full"
              >
                Tentar outro e-mail
              </Button>
              
              <Link href="/login">
                <Button className="w-full">
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Esqueci minha senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite seu e-mail para receber instruções de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              ← Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
