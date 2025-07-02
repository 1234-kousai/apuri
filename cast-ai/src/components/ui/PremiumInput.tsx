import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label-premium">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input-premium ${icon ? 'pl-10' : ''} ${error ? 'border-error focus:border-error' : ''} ${className || ''}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-error mt-1" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-neutral-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

PremiumInput.displayName = 'PremiumInput'

interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label-premium">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`input-premium resize-none ${error ? 'border-error focus:border-error' : ''} ${className || ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-error mt-1" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="text-sm text-neutral-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

PremiumTextarea.displayName = 'PremiumTextarea'