import { CalendarIcon, PhoneIcon, TrendingUpIcon, ClockIcon, ChevronRightIcon } from './ui/Icons'
import type { Customer } from '../lib/db'
import type { AISuggestion } from '../lib/ai-enhanced'
import { LuxuryCard, LuxuryCardContent } from './LuxuryCard'
import { LuxuryButton } from './LuxuryButton'

interface LuxurySuggestionCardProps {
  suggestion: AISuggestion
  onCustomerClick: (customer: Customer) => void
  onActionClick: (customer: Customer, action: AISuggestion['actions'][0]) => void
}

export function LuxurySuggestionCard({ suggestion, onCustomerClick, onActionClick }: LuxurySuggestionCardProps) {
  const { customer, score, primaryReason, actions, category } = suggestion
  
  const categoryConfig = {
    urgent: {
      gradient: 'from-red-600/20 to-orange-600/20',
      borderColor: 'border-red-500/30',
      icon: <ClockIcon size={16} />,
      iconColor: 'text-red-400',
      label: '緊急'
    },
    opportunity: {
      gradient: 'from-[#d4af37]/20 to-[#f9e4aa]/20',
      borderColor: 'border-[#d4af37]/30',
      icon: <TrendingUpIcon size={16} />,
      iconColor: 'text-[#d4af37]',
      label: '商機'
    },
    relationship: {
      gradient: 'from-blue-600/20 to-cyan-600/20',
      borderColor: 'border-blue-500/30',
      icon: <CalendarIcon size={16} />,
      iconColor: 'text-blue-400',
      label: '関係'
    },
    surprise: {
      gradient: 'from-emerald-600/20 to-green-600/20',
      borderColor: 'border-emerald-500/30',
      icon: <TrendingUpIcon size={16} />,
      iconColor: 'text-emerald-400',
      label: '驚き'
    }
  }
  
  const config = categoryConfig[category]
  
  return (
    <LuxuryCard variant="default" className="group">
      <LuxuryCardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => onCustomerClick(customer)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full
                bg-gradient-to-r ${config.gradient}
                border ${config.borderColor}
                ${config.iconColor}
                shadow-sm
              `}>
                {config.icon}
                <span className="text-xs font-medium tracking-wide uppercase">{config.label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-1 h-1 bg-gray-500 rounded-full" />
                <span>スコア: {Math.round(score * 100)}%</span>
              </div>
            </div>
            
            <h3 className="text-xl font-light text-white mb-2 group-hover:text-[#d4af37] transition-colors duration-300">
              {customer.name}
            </h3>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              {primaryReason}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-6">
          {actions.map((action, index) => (
            <LuxuryButton
              key={index}
              onClick={() => onActionClick(customer, action)}
              variant={action.priority === 'high' ? 'primary' : 'outline'}
              size="sm"
              icon={
                action.type === 'contact' ? <PhoneIcon size={14} /> :
                action.type === 'special_offer' ? <CalendarIcon size={14} /> :
                action.type === 'birthday' ? <CalendarIcon size={14} /> :
                <ChevronRightIcon size={14} />
              }
            >
              {action.message}
            </LuxuryButton>
          ))}
        </div>
      </LuxuryCardContent>
    </LuxuryCard>
  )
}