import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface UltraModernCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient'
  hover?: boolean
  delay?: number
}

export function UltraModernCard({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  delay = 0
}: UltraModernCardProps) {
  const variants = {
    default: 'ultra-glass',
    glass: 'ultra-glass-dark',
    gradient: 'ultra-gradient-border'
  }
  
  return (
    <div 
      className={cn(
        'relative rounded-3xl overflow-hidden',
        'transform transition-all duration-500',
        hover && 'hover:scale-[1.01] hover:shadow-ultra',
        'animate-ultra-entrance',
        variants[variant],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 ultra-grid opacity-5" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface UltraModernCardContentProps {
  children: ReactNode
  className?: string
  padded?: boolean
}

export function UltraModernCardContent({ 
  children, 
  className = '', 
  padded = true 
}: UltraModernCardContentProps) {
  return (
    <div className={cn(
      padded && 'p-6 sm:p-8',
      className
    )}>
      {children}
    </div>
  )
}