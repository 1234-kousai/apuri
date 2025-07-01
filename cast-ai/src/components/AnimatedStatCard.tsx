import { useEffect, useRef, useState } from 'react'
import { GlassCard } from './ui/GlassCard'

interface AnimatedStatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  suffix?: string
  prefix?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning'
  delay?: number
}

export function AnimatedStatCard({
  title,
  value,
  icon,
  suffix = '',
  prefix = '',
  color = 'primary',
  delay = 0
}: AnimatedStatCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, ''))
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )
    
    if (cardRef.current) {
      observer.observe(cardRef.current)
    }
    
    return () => observer.disconnect()
  }, [delay])
  
  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      const duration = 2000
      const steps = 60
      const increment = numericValue / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= numericValue) {
          setAnimatedValue(numericValue)
          clearInterval(timer)
        } else {
          setAnimatedValue(current)
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    } else if (isVisible) {
      setAnimatedValue(numericValue)
    }
  }, [isVisible, numericValue, value])
  
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/25',
    secondary: 'from-secondary-500 to-secondary-600 shadow-secondary-500/25',
    success: 'from-success to-emerald-600 shadow-success/25',
    warning: 'from-warning to-orange-600 shadow-warning/25',
  }
  
  return (
    <div
      ref={cardRef}
      className={`transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <GlassCard
        variant="light"
        hover="lift"
        gradient
        className="group cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
                {prefix}
                {typeof value === 'number' 
                  ? animatedValue.toLocaleString('ja-JP', { maximumFractionDigits: 0 })
                  : value
                }
                {suffix}
              </span>
            </div>
            
            {/* プログレスバー */}
            <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out`}
                style={{
                  width: isVisible ? '100%' : '0%',
                  transform: `scaleX(${isVisible ? 1 : 0})`,
                  transformOrigin: 'left',
                }}
              />
            </div>
          </div>
          
          {/* アイコン */}
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]}
            flex items-center justify-center text-white
            transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12
            shadow-lg
          `}>
            {icon}
          </div>
        </div>
        
        {/* ホバーエフェクト */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
          -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </GlassCard>
    </div>
  )
}