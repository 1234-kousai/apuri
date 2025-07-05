import { useState } from 'react'
import { ChevronDownIcon } from './ui/Icons'

export type StatsPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

interface StatsPeriodSelectorProps {
  value: StatsPeriod
  onChange: (period: StatsPeriod) => void
}

const periods: { value: StatsPeriod; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '今週' },
  { value: 'month', label: '今月' },
  { value: 'quarter', label: '四半期' },
  { value: 'year', label: '今年' },
  { value: 'all', label: '全期間' }
]

export function StatsPeriodSelector({ value, onChange }: StatsPeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentPeriod = periods.find(p => p.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <span className="text-sm">{currentPeriod?.label}</span>
        <ChevronDownIcon size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-40 rounded-xl bg-[#0a0a0a] border border-white/10 shadow-2xl z-50 overflow-hidden">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => {
                  onChange(period.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors ${
                  value === period.value ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#9945ff]/20 text-[#00d4ff]' : ''
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}