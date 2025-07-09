import { CalendarIcon, PhoneIcon, TrendingUpIcon, ClockIcon } from './ui/Icons'
import type { Customer } from '../lib/db'
import type { AISuggestion } from '../lib/ai-enhanced'

interface UltrathinkSuggestionCardProps {
  suggestion: AISuggestion
  onCustomerClick: (customer: Customer) => void
  onActionClick: (customer: Customer, action: AISuggestion['actions'][0]) => void
}

export function UltrathinkSuggestionCard({ 
  suggestion, 
  onCustomerClick, 
  onActionClick 
}: UltrathinkSuggestionCardProps) {
  console.log('=== UltrathinkSuggestionCard RENDER ===');
  console.log('Suggestion:', suggestion);
  
  const { customer, score, primaryReason, actions, category } = suggestion
  
  const categoryConfig = {
    urgent: {
      color: '#ff0080',
      icon: <ClockIcon size={20} />,
      label: 'URGENT'
    },
    opportunity: {
      color: '#00d4ff',
      icon: <TrendingUpIcon size={20} />,
      label: 'OPPORTUNITY'
    },
    relationship: {
      color: '#9945ff',
      icon: <CalendarIcon size={20} />,
      label: 'RELATIONSHIP'
    },
    surprise: {
      color: '#00ff88',
      icon: <TrendingUpIcon size={20} />,
      label: 'SURPRISE'
    }
  }
  
  const config = categoryConfig[category]
  
  return (
    <div className="ultra-card p-8 ultra-hover-glow ultra-animate-slide group">
      <div className="flex items-start justify-between mb-6">
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => {
            console.log('Suggestion card clicked:', customer.name);
            if (customer.id) {
              onCustomerClick(customer)
            } else {
              console.error('Cannot click customer without ID:', customer)
            }
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full border"
              style={{ 
                borderColor: `${config.color}30`,
                color: config.color
              }}
            >
              {config.icon}
              <span className="text-xs font-medium tracking-[0.2em]">{config.label}</span>
            </div>
            <div className="flex items-center gap-2 text-xs opacity-50">
              <span>Score</span>
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${score * 100}%`,
                    background: config.color
                  }}
                />
              </div>
              <span>{Math.round(score * 100)}%</span>
            </div>
          </div>
          
          <h3 className="text-2xl font-thin mb-3 group-hover:text-[#00d4ff] transition-colors">
            {customer.name}
          </h3>
          
          <p className="text-sm opacity-60 leading-relaxed">
            {primaryReason}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-8">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              console.log('Action clicked:', action);
              onActionClick(customer, action)
            }}
            className={`
              ultra-btn text-sm
              ${action.priority === 'high' 
                ? 'ultra-btn-primary' 
                : 'ultra-btn-outline'
              }
            `}
            style={action.priority === 'high' ? {
              background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}80 100%)`
            } : {}}
          >
            <span className="flex items-center gap-2">
              {action.type === 'contact' && <PhoneIcon size={14} />}
              {action.type === 'special_offer' && <CalendarIcon size={14} />}
              {action.type === 'birthday' && <CalendarIcon size={14} />}
              {action.type === 'retention' && <TrendingUpIcon size={14} />}
              <span>{action.message}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}