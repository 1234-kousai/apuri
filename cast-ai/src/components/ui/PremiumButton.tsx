import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useRipple } from '../../hooks/useRipple'

const premiumButtonVariants = cva(
  'btn-premium inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        primary: 'btn-premium-primary',
        secondary: 'btn-premium-secondary',
        gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600',
        outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
        ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
      },
      size: {
        sm: 'text-xs py-2 px-4',
        md: 'text-sm py-2.5 px-5',
        lg: 'text-base py-3 px-6',
        icon: 'p-2.5',
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

interface PremiumButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, disabled, onClick, icon, iconPosition = 'left', ...props }, ref) => {
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
        className={premiumButtonVariants({ variant, size, fullWidth, className })}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        <div ref={rippleContainerRef} className="absolute inset-0 pointer-events-none" />
        <span className="relative z-10 flex items-center justify-center">
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
            <>
              {icon && iconPosition === 'left' && (
                <span className="mr-2">{icon}</span>
              )}
              {children}
              {icon && iconPosition === 'right' && (
                <span className="ml-2">{icon}</span>
              )}
            </>
          )}
        </span>
      </button>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'