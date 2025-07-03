import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface LuxuryStatCardProps {
  label: string
  value: string | ReactNode
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: ReactNode
  delay?: number
}

export function LuxuryStatCard({ 
  label, 
  value, 
  change, 
  trend = 'neutral',
  icon, 
  delay = 0 
}: LuxuryStatCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <div className={`
      relative group
      transform transition-all duration-700 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {/* Premium card background */}
      <div className="
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90
        backdrop-blur-xl border border-white/10
        shadow-xl group-hover:shadow-2xl
        transition-all duration-500 ease-out
        group-hover:-translate-y-1
      ">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                {label}
              </p>
              <div className="luxury-shimmer h-[1px] w-12 opacity-30" />
            </div>
            
            <div className="
              p-3 rounded-xl
              bg-gradient-to-br from-[#d4af37]/20 to-[#f9e4aa]/10
              border border-[#d4af37]/20
              shadow-lg group-hover:shadow-[#d4af37]/20
              transform transition-all duration-500
              group-hover:scale-110 group-hover:rotate-3
            ">
              <div className="text-[#d4af37]">
                {icon}
              </div>
            </div>
          </div>
          
          {/* Value */}
          <div className="mb-4">
            {typeof value === 'string' ? (
              <h3 className="text-3xl font-light tracking-tight text-white">
                {value}
              </h3>
            ) : (
              value
            )}
          </div>
          
          {/* Change indicator */}
          {change && (
            <div className="flex items-center gap-2">
              <div className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-full
                text-xs font-medium
                ${trend === 'up' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : trend === 'down'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                }
              `}>
                {trend === 'up' && (
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 001.414 0L10 6.414l3.293 3.293a1 1 0 001.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 000 1.414z" clipRule="evenodd" />
                  </svg>
                )}
                {trend === 'down' && (
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 00-1.414 0L10 13.586 6.707 10.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{change}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Hover glow effect */}
        <div className="
          absolute inset-0 rounded-2xl opacity-0
          bg-gradient-to-br from-[#d4af37]/5 to-transparent
          group-hover:opacity-100 transition-opacity duration-500
        " />
        
        {/* Animated border gradient */}
        <div className="
          absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
          transition-opacity duration-500
        ">
          <div className="
            absolute inset-[1px] rounded-[14px] bg-gray-900
          " />
          <div className="
            absolute inset-0 rounded-2xl
            bg-gradient-to-r from-[#d4af37] via-[#f9e4aa] to-[#d4af37]
            animate-pulse
          " />
        </div>
      </div>
    </div>
  )
}