import { FieldPath, FieldValues } from "react-hook-form"
import { toast } from "sonner"

// Tipo para erros de campo da API
export interface ApiFieldError {
  field: string
  message: string
}

// Tipo para resposta de erro da API
export interface ApiErrorResponse {
  error: string
  fieldErrors?: ApiFieldError[]
}

// Função para lidar com erros de API e definir erros de campo
export function handleApiErrors<T extends FieldValues>(
  error: ApiErrorResponse,
  setError: (name: FieldPath<T>, error: { message: string }) => void
) {
  // Se há erros de campo específicos, aplicá-los
  if (error.fieldErrors && error.fieldErrors.length > 0) {
    error.fieldErrors.forEach(fieldError => {
      setError(fieldError.field as FieldPath<T>, {
        message: fieldError.message
      })
    })
    
    // Mostrar apenas o primeiro erro como toast
    toast.error(error.fieldErrors[0].message)
  } else {
    // Mostrar erro geral
    toast.error(error.error || 'Erro desconhecido')
  }
}

// Função para resetar erros de formulário
export function clearFormErrors<T extends FieldValues>(
  fieldErrors: ApiFieldError[] | undefined,
  clearErrors: (name?: FieldPath<T> | FieldPath<T>[]) => void
) {
  if (fieldErrors && fieldErrors.length > 0) {
    const fieldsToReset = fieldErrors.map(fe => fe.field as FieldPath<T>)
    clearErrors(fieldsToReset)
  }
}
