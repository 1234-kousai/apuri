import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const ultraPremiumButtonVariants = cva(
  'btn-ultra-premium relative group',
  {
    variants: {
      variant: {
        primary: 'btn-ultra-premium-primary',
        gold: 'btn-ultra-premium-gold',
        glass: 'btn-ultra-premium-glass',
        neo: 'btn-neo',
      },
      size: {
        sm: 'text-xs py-2.5 px-5',
        md: 'text-sm py-3 px-6',
        lg: 'text-base py-4 px-8',
        xl: 'text-lg py-5 px-10',
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

interface UltraPremiumButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ultraPremiumButtonVariants> {
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  glow?: boolean
  pulse?: boolean
}

export const UltraPremiumButton = forwardRef<HTMLButtonElement, UltraPremiumButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    isLoading, 
    children, 
    disabled, 
    onClick, 
    icon, 
    iconPosition = 'left',
    glow = false,
    pulse = false,
    ...props 
  }, ref) => {
    
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        // Create premium ripple effect
        const button = e.currentTarget
        const rect = button.getBoundingClientRect()
        const ripple = document.createElement('span')
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2
        
        ripple.style.width = ripple.style.height = size + 'px'
        ripple.style.left = x + 'px'
        ripple.style.top = y + 'px'
        ripple.classList.add('ripple-premium')
        
        button.appendChild(ripple)
        
        setTimeout(() => {
          ripple.remove()
        }, 800)
        
        onClick?.(e)
      }
    }
    
    return (
      <button
        ref={ref}
        className={`
          ${ultraPremiumButtonVariants({ variant, size, fullWidth, className })}
          ${glow ? 'animation-pulse-glow' : ''}
          ${pulse ? 'animate-pulse' : ''}
        `}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2 font-poppins">
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
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
              <span className="animate-pulse">処理中...</span>
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <span className="transition-transform group-hover:scale-110 group-hover:rotate-12">{icon}</span>
              )}
              {children}
              {icon && iconPosition === 'right' && (
                <span className="transition-transform group-hover:scale-110 group-hover:-rotate-12">{icon}</span>
              )}
            </>
          )}
        </span>
      </button>
    )
  }
)

UltraPremiumButton.displayName = 'UltraPremiumButton'