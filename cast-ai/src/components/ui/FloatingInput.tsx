import { forwardRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
  success?: boolean
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, icon, success, id, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const inputId = id || `floating-input-${Math.random().toString(36).substr(2, 9)}`
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      onBlur?.(e)
    }
    
    return (
      <div className="input-group-floating">
        <div className="relative">
          {icon && (
            <div className={`
              absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300
              ${focused ? 'text-purple-600' : 'text-neutral-400'}
              ${error ? 'text-red-500' : ''}
              ${success ? 'text-green-500' : ''}
            `}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              input-ultra-premium
              ${icon ? 'pl-12' : ''}
              ${error ? 'border-red-500' : ''}
              ${success ? 'border-green-500' : ''}
              ${className || ''}
            `}
            placeholder=" "
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <label 
            htmlFor={inputId}
            className={`
              ${icon ? 'left-12' : ''}
              ${error ? 'text-red-500' : ''}
              ${success ? 'text-green-500' : ''}
            `}
          >
            {label}
          </label>
          
          {/* Animated border */}
          <div className={`
            absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-gold-500 transition-all duration-300
            ${focused ? 'w-full' : 'w-0'}
          `} />
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500 mt-2 flex items-center gap-1" role="alert">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            入力が確認されました
          </p>
        )}
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  success?: boolean
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, error, success, id, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const textareaId = id || `floating-textarea-${Math.random().toString(36).substr(2, 9)}`
    
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true)
      onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false)
      onBlur?.(e)
    }
    
    return (
      <div className="input-group-floating">
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={`
              input-ultra-premium resize-none
              ${error ? 'border-red-500' : ''}
              ${success ? 'border-green-500' : ''}
              ${className || ''}
            `}
            placeholder=" "
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${textareaId}-error` : undefined}
            {...props}
          />
          <label 
            htmlFor={textareaId}
            className={`
              ${error ? 'text-red-500' : ''}
              ${success ? 'text-green-500' : ''}
            `}
          >
            {label}
          </label>
          
          {/* Animated border */}
          <div className={`
            absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-gold-500 transition-all duration-300
            ${focused ? 'w-full' : 'w-0'}
          `} />
        </div>
        
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-red-500 mt-2 flex items-center gap-1" role="alert">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            入力が確認されました
          </p>
        )}
      </div>
    )
  }
)

FloatingTextarea.displayName = 'FloatingTextarea'