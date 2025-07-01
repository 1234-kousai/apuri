import { forwardRef } from 'react'
import type { ReactNode, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const glassCardVariants = cva(
  'relative overflow-hidden backdrop-blur-xl transition-all duration-500',
  {
    variants: {
      variant: {
        default: 'bg-white/10 border border-white/20 shadow-xl',
        primary: 'bg-primary-500/10 border border-primary-500/20 shadow-primary-500/20 shadow-xl',
        secondary: 'bg-secondary-500/10 border border-secondary-500/20 shadow-secondary-500/20 shadow-xl',
        dark: 'bg-black/20 border border-white/10 shadow-2xl',
        light: 'bg-white/30 border border-white/40 shadow-lg',
      },
      size: {
        sm: 'p-4 rounded-xl',
        md: 'p-6 rounded-2xl',
        lg: 'p-8 rounded-3xl',
      },
      hover: {
        true: 'hover:scale-[1.02] hover:shadow-2xl hover:bg-white/20',
        glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]',
        lift: 'hover:-translate-y-2 hover:shadow-2xl',
      },
      animated: {
        true: 'animate-float',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: true,
      animated: false,
    },
  }
)

interface GlassCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children: ReactNode
  gradient?: boolean
  particles?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, hover, animated, gradient, particles, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={glassCardVariants({ variant, size, hover, animated, className })}
        {...props}
      >
        {/* グラデーションオーバーレイ */}
        {gradient && (
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-secondary-500/20" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-wave" />
          </div>
        )}
        
        {/* パーティクル効果 */}
        {particles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="particle animate-float"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* ネオンボーダー効果 */}
        <div className="absolute inset-0 rounded-inherit opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-[-1px] bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-inherit blur-sm" />
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'