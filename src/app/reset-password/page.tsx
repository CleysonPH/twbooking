'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur"
  })

  useEffect(() => {
    if (!token) {
      toast.error('Token inválido')
      router.push('/forgot-password')
    } else {
      setValue('token', token)
    }
  }, [token, router, setValue])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success('Senha alterada com sucesso!')
        
        // Redireciona para login após 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        toast.error(result.error || 'Erro ao alterar senha')
        
        if (result.error?.includes('Token inválido') || result.error?.includes('expirado')) {
          setTimeout(() => {
            router.push('/forgot-password')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao alterar senha. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">
              Token inválido
            </CardTitle>
            <CardDescription>
              Redirecionando...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              Senha alterada!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">
                Você será redirecionado para a página de login em alguns segundos...
              </p>
            </div>

            <Link href="/login">
              <Button className="w-full">
                Ir para login agora
              </Button>
            </Link>
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
            Redefinir senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              id="password"
              label="Nova senha"
              type="password"
              placeholder="Digite sua nova senha"
              error={errors.password?.message}
              disabled={isLoading}
              {...register("password")}
            />
            <p className="text-xs text-gray-500 -mt-2">
              Mínimo 8 caracteres, incluindo letras e números
            </p>

            <FormField
              id="confirmPassword"
              label="Confirmar senha"
              type="password"
              placeholder="Confirme sua nova senha"
              error={errors.confirmPassword?.message}
              disabled={isLoading}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Alterando...' : 'Alterar senha'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Carregando...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
