import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useRipple } from '../../hooks/useRipple'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-soft hover:shadow-medium',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 shadow-soft hover:shadow-medium',
        outline: 'border-2 border-neutral-300 bg-transparent hover:bg-neutral-50 focus:ring-neutral-500',
        ghost: 'hover:bg-neutral-100 focus:ring-neutral-500',
        danger: 'bg-error text-white hover:bg-red-600 focus:ring-error shadow-soft hover:shadow-medium',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, disabled, onClick, ...props }, ref) => {
    const { rippleContainerRef, createRipple } = useRipple()
    
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        createRipple(e)
        onClick?.(e)
      }
    }
    
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, fullWidth, className }) + ' relative overflow-hidden'}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        <div ref={rippleContainerRef} className="absolute inset-0 pointer-events-none" />
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            読み込み中...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'