import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const ultraPremiumCardVariants = cva(
  'relative transition-all duration-500',
  {
    variants: {
      variant: {
        default: 'card-ultra-premium',
        holographic: 'card-holographic',
        glass: 'panel-glass',
        neo: 'bg-neutral-100 rounded-[32px] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        lift: 'hover:translate-y-[-8px] hover:scale-[1.02]',
        glow: 'hover:shadow-[0_0_60px_rgba(124,58,237,0.3)]',
        rotate: 'hover:rotate-1',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: 'lift',
    },
  }
)

interface UltraPremiumCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof ultraPremiumCardVariants> {
  glowColor?: 'primary' | 'gold' | 'gradient'
  animated?: boolean
}

export const UltraPremiumCard = forwardRef<HTMLDivElement, UltraPremiumCardProps>(
  ({ className, variant, size, hover, children, glowColor, animated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          ${ultraPremiumCardVariants({ variant, size, hover, className })}
          ${animated ? 'animate-gradient-shift' : ''}
          ${glowColor === 'primary' ? 'shadow-[0_0_40px_rgba(124,58,237,0.2)]' : ''}
          ${glowColor === 'gold' ? 'shadow-[0_0_40px_rgba(217,119,6,0.2)]' : ''}
          ${glowColor === 'gradient' ? 'shadow-[0_0_40px_rgba(124,58,237,0.2),0_0_80px_rgba(217,119,6,0.1)]' : ''}
        `}
        {...props}
      >
        {/* Premium border gradient */}
        <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-purple-600 via-gold-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Holographic overlay for holographic variant */}
        {variant === 'holographic' && (
          <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
        )}
      </div>
    )
  }
)

UltraPremiumCard.displayName = 'UltraPremiumCard'

interface UltraPremiumCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  gradient?: boolean
}

export const UltraPremiumCardHeader = forwardRef<HTMLDivElement, UltraPremiumCardHeaderProps>(
  ({ className, title, subtitle, icon, action, gradient = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between mb-8 ${className || ''}`}
        {...props}
      >
        {children || (
          <>
            <div className="flex items-start gap-4">
              {icon && (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className={`text-2xl font-bold ${gradient ? 'text-gradient' : 'text-neutral-900'} font-poppins`}>
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-neutral-500 mt-1 font-medium">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {action && <div>{action}</div>}
          </>
        )}
      </div>
    )
  }
)

UltraPremiumCardHeader.displayName = 'UltraPremiumCardHeader'

interface UltraPremiumCardContentProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
}

export const UltraPremiumCardContent = forwardRef<HTMLDivElement, UltraPremiumCardContentProps>(
  ({ className, padded = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${padded ? 'px-2' : ''} ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

UltraPremiumCardContent.displayName = 'UltraPremiumCardContent'

interface UltraPremiumCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

export const UltraPremiumCardFooter = forwardRef<HTMLDivElement, UltraPremiumCardFooterProps>(
  ({ className, bordered = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          mt-8 pt-6 
          ${bordered ? 'border-t border-neutral-200/50' : ''} 
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

UltraPremiumCardFooter.displayName = 'UltraPremiumCardFooter'