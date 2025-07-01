import { useCountUp } from '../hooks/useCountUp'
import { formatCurrency } from '../utils/format'

interface AnimatedStatProps {
  value: number
  isCurrency?: boolean
  suffix?: string
}

export function AnimatedStat({ value, isCurrency = false, suffix = '' }: AnimatedStatProps) {
  const animatedValue = useCountUp({ end: value, duration: 1500 })
  
  const displayValue = isCurrency 
    ? formatCurrency(Number(animatedValue))
    : animatedValue + suffix
  
  return <span className="animate-count">{displayValue}</span>
}