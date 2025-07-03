import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface UltraStatCardProps {
  label: string
  value: string | ReactNode
  change?: string
  icon: ReactNode
  gradient: string
  delay?: number
}

export function UltraStatCard({ label, value, change, icon, gradient, delay = 0 }: UltraStatCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <div className={`
      relative group
      transform transition-all duration-500
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
    `}>
      {/* Background Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`} />
      
      {/* Card Content */}
      <div className="relative ultra-glass rounded-3xl p-6 h-full group-hover:scale-[1.02] transition-transform duration-300">
        {/* Decorative Grid */}
        <div className="absolute inset-0 ultra-grid opacity-5 rounded-3xl" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-gray-400">{label}</p>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg transform group-hover:rotate-3 transition-transform duration-300`}>
              {icon}
            </div>
          </div>
          
          {/* Value */}
          <div className="mb-3">
            {typeof value === 'string' ? (
              <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            ) : (
              value
            )}
          </div>
          
          {/* Change Indicator */}
          {change && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${change.includes('+') ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
              <p className={`text-xs font-medium ${change.includes('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {change}
              </p>
            </div>
          )}
        </div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  )
}