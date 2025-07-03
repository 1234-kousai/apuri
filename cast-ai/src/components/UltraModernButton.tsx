import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/utils'

interface UltraModernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'gradient' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  glow?: boolean
  fullWidth?: boolean
}

export function UltraModernButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  glow = false,
  fullWidth = false,
  disabled,
  ...props
}: UltraModernButtonProps) {
  const variants = {
    primary: `
      bg-gradient-to-r from-purple-600 to-indigo-600
      text-white font-medium
      shadow-lg hover:shadow-xl
      hover:from-purple-700 hover:to-indigo-700
      active:scale-[0.98]
    `,
    secondary: `
      ultra-glass-dark backdrop-blur-xl
      text-gray-300 hover:text-white
      hover:bg-white/10
      active:scale-[0.98]
    `,
    glass: `
      ultra-glass backdrop-blur-xl
      text-gray-300 hover:text-white
      hover:bg-white/10
      active:scale-[0.98]
    `,
    gradient: `
      bg-gradient-to-r from-purple-600 via-pink-600 to-red-600
      text-white font-medium
      shadow-lg hover:shadow-xl
      hover:from-purple-700 hover:via-pink-700 hover:to-red-700
      active:scale-[0.98]
    `,
    ghost: `
      text-gray-400 hover:text-white
      hover:bg-white/5
      active:scale-[0.98]
    `
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  }

  const glowEffect = glow && variant === 'primary' 
    ? 'shadow-purple-500/25 hover:shadow-purple-500/40' 
    : ''

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center',
        'rounded-2xl font-medium',
        'transition-all duration-300 transform',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
        variants[variant],
        sizes[size],
        glowEffect,
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {/* Glow Background */}
      {glow && variant === 'primary' && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-70 blur-sm animate-pulse" />
      )}
      
      {/* Button Content */}
      <span className="relative flex items-center gap-2">
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
      
      {/* Hover Shine Effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      </div>
    </button>
  )
}