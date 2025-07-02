import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const premiumCardVariants = cva(
  'card-premium',
  {
    variants: {
      variant: {
        default: '',
        hover: 'hover:shadow-2xl',
        glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface PremiumCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumCardVariants> {}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={premiumCardVariants({ variant, size, className })}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PremiumCard.displayName = 'PremiumCard'

interface PremiumCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const PremiumCardHeader = forwardRef<HTMLDivElement, PremiumCardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between mb-6 ${className || ''}`}
        {...props}
      >
        {children || (
          <>
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gradient">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
              )}
            </div>
            {action && <div>{action}</div>}
          </>
        )}
      </div>
    )
  }
)

PremiumCardHeader.displayName = 'PremiumCardHeader'

interface PremiumCardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const PremiumCardContent = forwardRef<HTMLDivElement, PremiumCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${className || ''}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PremiumCardContent.displayName = 'PremiumCardContent'