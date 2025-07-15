'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur"
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmittedEmail(data.email)
        setIsSubmitted(true)
        toast.success('Instruções enviadas! Verifique seu e-mail.')
      } else {
        toast.error(result.error || 'Erro ao enviar instruções')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao enviar instruções. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setIsSubmitted(false)
    setSubmittedEmail('')
    reset()
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
                Se o e-mail <strong>{submittedEmail}</strong> estiver cadastrado em nosso sistema, 
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
                onClick={handleTryAgain}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              id="email"
              label="E-mail"
              type="email"
              placeholder="Digite seu e-mail"
              error={errors.email?.message}
              disabled={isLoading}
              {...register("email")}
            />

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
