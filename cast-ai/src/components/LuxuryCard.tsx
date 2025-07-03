import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface LuxuryCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient'
  hover?: boolean
  delay?: number
}

export function LuxuryCard({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  delay = 0
}: LuxuryCardProps) {
  const variants = {
    default: 'luxury-card',
    glass: 'luxury-glass',
    gradient: 'luxury-card luxury-card-hover'
  }
  
  return (
    <div 
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'transition-all duration-500 ease-out',
        hover && 'luxury-card-hover',
        'luxury-animate-in',
        variants[variant],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

interface LuxuryCardContentProps {
  children: ReactNode
  className?: string
  padded?: boolean
}

export function LuxuryCardContent({ 
  children, 
  className = '', 
  padded = true 
}: LuxuryCardContentProps) {
  return (
    <div className={cn(
      'relative z-10',
      padded && 'p-6 sm:p-8',
      className
    )}>
      {children}
    </div>
  )
}