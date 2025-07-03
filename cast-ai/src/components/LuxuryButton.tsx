import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

interface LuxuryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
  glow?: boolean
}

export function LuxuryButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  glow = false,
  disabled,
  ...props
}: LuxuryButtonProps) {
  const baseStyles = `
    luxury-button relative inline-flex items-center justify-center
    font-medium tracking-wider uppercase
    transition-all duration-500 ease-out
    disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
  `

  const variants = {
    primary: `
      luxury-button-primary
      bg-gradient-to-r from-[#d4af37] via-[#f9e4aa] to-[#d4af37]
      text-black shadow-lg
      hover:shadow-2xl hover:-translate-y-0.5
      focus:ring-[#d4af37]
      ${glow ? 'shadow-[0_0_30px_rgba(212,175,55,0.5)]' : ''}
    `,
    dark: `
      luxury-button-dark
      bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
      text-gray-100 border border-gray-700
      hover:border-gray-600 hover:text-white
      focus:ring-gray-700
    `,
    ghost: `
      luxury-button-ghost
      bg-transparent text-gray-300
      border border-gray-700/50 backdrop-blur-sm
      hover:bg-white/5 hover:text-white hover:border-gray-600
      focus:ring-gray-700
    `,
    outline: `
      bg-transparent text-[#d4af37]
      border-2 border-[#d4af37]/50
      hover:bg-[#d4af37]/10 hover:border-[#d4af37]
      hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]
      focus:ring-[#d4af37]
    `
  }

  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    sm: 'px-4 py-2 text-xs gap-2 rounded-xl',
    md: 'px-6 py-2.5 text-sm gap-2.5 rounded-xl',
    lg: 'px-8 py-3 text-base gap-3 rounded-2xl',
    xl: 'px-10 py-4 text-lg gap-3.5 rounded-2xl'
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Premium shine effect */}
      <div className="absolute inset-0 rounded-inherit overflow-hidden">
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-r from-transparent via-white/20 to-transparent",
          "-skew-x-12 group-hover:opacity-100"
        )} />
      </div>

      {/* Button content */}
      <span className="relative flex items-center justify-center gap-inherit">
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            <span className="truncate">{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
          </>
        )}
      </span>

      {/* Glow effect for primary variant */}
      {variant === 'primary' && glow && (
        <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] to-[#f9e4aa] rounded-inherit opacity-30 blur-md animate-pulse" />
      )}
    </button>
  )
}