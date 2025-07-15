import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  id: string
  showRequired?: boolean
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className, showRequired = false, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className={cn(
          showRequired && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}>
          {label}
        </Label>
        <Input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField }
