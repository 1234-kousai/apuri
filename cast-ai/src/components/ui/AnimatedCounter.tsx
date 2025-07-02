import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  separator?: string
  className?: string
}

export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  separator = ',',
  className = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = easeOutQuart * value
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])
  
  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals)
    const parts = fixed.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    return parts.join('.')
  }
  
  return (
    <span className={`counter-premium ${className}`} data-suffix={suffix}>
      {prefix}{formatNumber(displayValue)}
    </span>
  )
}

interface AnimatedProgressRingProps {
  value: number
  maxValue?: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function AnimatedProgressRing({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 8,
  className = ''
}: AnimatedProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = (animatedValue / maxValue) * 100
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)
    
    return () => clearTimeout(timeout)
  }, [value])
  
  return (
    <div className={`progress-ring ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <AnimatedCounter 
            value={animatedValue} 
            suffix="%" 
            className="text-2xl font-bold"
          />
          <p className="text-xs text-neutral-500 mt-1">完了率</p>
        </div>
      </div>
    </div>
  )
}