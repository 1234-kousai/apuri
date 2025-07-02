import { useEffect, useState } from 'react'

interface PremiumStatCardProps {
  title: string
  value: number | string
  icon?: React.ReactNode
  prefix?: string
  suffix?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export function PremiumStatCard({ 
  title, 
  value, 
  icon, 
  prefix = '', 
  suffix = '',
  trend,
  color = 'primary'
}: PremiumStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0
  
  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = numericValue / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [numericValue])
  
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    success: 'from-success to-emerald-600',
    warning: 'from-warning to-amber-600',
    error: 'from-error to-red-600'
  }
  
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gradient">
              {prefix}{typeof value === 'number' ? displayValue.toLocaleString() : value}{suffix}
            </span>
            {trend && (
              <span className={`ml-3 text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-error'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white transform transition-all group-hover:scale-110 group-hover:rotate-12`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}