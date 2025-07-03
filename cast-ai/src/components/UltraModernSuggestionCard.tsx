import { CalendarIcon, PhoneIcon, TrendingUpIcon, ClockIcon, ChevronRightIcon } from './ui/Icons'
import type { Customer } from '../lib/db'
import type { AISuggestion } from '../lib/ai-enhanced'
import { UltraModernCard, UltraModernCardContent } from './UltraModernCard'

interface UltraModernSuggestionCardProps {
  suggestion: AISuggestion
  onCustomerClick: (customer: Customer) => void
  onActionClick: (customer: Customer, action: AISuggestion['actions'][0]) => void
}

export function UltraModernSuggestionCard({ suggestion, onCustomerClick, onActionClick }: UltraModernSuggestionCardProps) {
  const { customer, score, primaryReason, actions, category } = suggestion
  
  const categoryConfig = {
    urgent: {
      gradient: 'from-red-600 to-orange-600',
      glow: 'shadow-red-500/20',
      icon: <ClockIcon size={16} className="text-white" />,
      label: '緊急'
    },
    opportunity: {
      gradient: 'from-purple-600 to-indigo-600',
      glow: 'shadow-purple-500/20',
      icon: <TrendingUpIcon size={16} className="text-white" />,
      label: '商機'
    },
    relationship: {
      gradient: 'from-blue-600 to-cyan-600',
      glow: 'shadow-blue-500/20',
      icon: <CalendarIcon size={16} className="text-white" />,
      label: '関係'
    },
    surprise: {
      gradient: 'from-emerald-600 to-green-600',
      glow: 'shadow-emerald-500/20',
      icon: <TrendingUpIcon size={16} className="text-white" />,
      label: '驚き'
    }
  }
  
  const config = categoryConfig[category]
  
  return (
    <UltraModernCard 
      variant="glass" 
      className={`group ${config.glow}`}
      hover
    >
      <UltraModernCardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => onCustomerClick(customer)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-gradient-to-r ${config.gradient}
                text-xs font-medium text-white
                shadow-lg transform group-hover:scale-105 transition-transform
              `}>
                {config.icon}
                <span>{config.label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
                <span>スコア: {Math.round(score * 100)}%</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
              {customer.name}
            </h3>
            
            <p className="text-sm text-gray-300 leading-relaxed">
              {primaryReason}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => onActionClick(customer, action)}
              className={`
                relative inline-flex items-center gap-2 px-4 py-2.5
                rounded-2xl text-sm font-medium
                transition-all duration-300 transform
                ${action.priority === 'high' 
                  ? 'bg-gradient-to-r ' + config.gradient + ' text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'ultra-glass-dark text-gray-300 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {action.type === 'contact' && <PhoneIcon size={14} />}
              {action.type === 'special_offer' && <CalendarIcon size={14} />}
              {action.type === 'birthday' && <CalendarIcon size={14} />}
              {action.type === 'retention' && <ChevronRightIcon size={14} />}
              <span>{action.message}</span>
              {action.priority === 'high' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </UltraModernCardContent>
    </UltraModernCard>
  )
}