import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const inputVariants = cva(
  'w-full rounded-lg border bg-white px-4 py-2 text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
        error: 'border-error focus:border-error focus:ring-error',
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-base min-h-[44px]',
        lg: 'h-12 text-lg min-h-[48px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={inputVariants({ 
          variant: error ? 'error' : variant, 
          size, 
          className 
        })}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={inputVariants({ 
          variant: error ? 'error' : variant, 
          size, 
          className: `resize-none ${className}` 
        })}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm sm:text-sm font-medium text-neutral-700 mb-1 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  )
}

interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  )
}