import type { Customer } from '../../lib/db'
import { PhoneIcon, BirthdayIcon, CalendarIcon } from '../ui/Icons'
import { formatPhoneNumber } from '../../utils/format'

interface PremiumCustomerCardProps {
  customer: Customer
  onClick: (customer: Customer) => void
  stats?: {
    visitCount: number
    totalRevenue: number
    lastVisit?: Date
    churnRisk?: 'low' | 'medium' | 'high'
  }
}

export function PremiumCustomerCard({ customer, onClick, stats }: PremiumCustomerCardProps) {
  const getChurnRiskColor = (risk?: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'high': return 'bg-error text-white'
      case 'medium': return 'bg-warning text-white'
      case 'low': return 'bg-success text-white'
      default: return 'bg-neutral-200 text-neutral-600'
    }
  }
  
  const getChurnRiskLabel = (risk?: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'high': return '離反リスク高'
      case 'medium': return '要注意'
      case 'low': return 'アクティブ'
      default: return '未分析'
    }
  }
  
  return (
    <div 
      className="card-premium cursor-pointer group"
      onClick={() => onClick(customer)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors">
              {customer.name}
            </h3>
            {stats?.churnRisk && (
              <span className={`chip text-xs ${getChurnRiskColor(stats.churnRisk)}`}>
                {getChurnRiskLabel(stats.churnRisk)}
              </span>
            )}
          </div>
          
          <div className="space-y-1.5 text-sm text-neutral-600">
            {customer.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon size={14} className="text-neutral-400" />
                <span>{formatPhoneNumber(customer.phone)}</span>
              </div>
            )}
            {customer.lineId && (
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
                  <path d="M19.7 8.7c0-3.8-3.8-6.9-8.5-6.9S2.7 4.9 2.7 8.7c0 3.4 3 6.2 7.1 6.8 0 0 .6.1.8.2.2.1.4.2.4.4l.3 1.9c.1.3.4 1.2 1.1 1 .6-.2 3.3-2 4.5-3.4h.1c1.3-1.5 1.9-3 1.9-4.9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>@{customer.lineId}</span>
              </div>
            )}
            {customer.birthday && (
              <div className="flex items-center gap-2">
                <BirthdayIcon size={14} className="text-neutral-400" />
                <span>{new Date(customer.birthday).toLocaleDateString('ja-JP')}</span>
              </div>
            )}
            {stats?.lastVisit && (
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-neutral-400" />
                <span>最終来店: {stats.lastVisit.toLocaleDateString('ja-JP')}</span>
              </div>
            )}
          </div>
          
          {customer.memo && (
            <p className="mt-3 text-sm text-neutral-500 line-clamp-2">
              {customer.memo}
            </p>
          )}
        </div>
        
        {stats && (
          <div className="text-right ml-4 space-y-2">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">総売上</p>
              <p className="text-xl font-bold text-gradient">
                ¥{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">来店{stats.visitCount}回</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}