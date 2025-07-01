import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { PhoneIcon, StarIcon } from './ui/Icons'
import { formatCurrency, formatDateShort, getRankColor } from '../utils/format'
import type { AISuggestion } from '../lib/ai-enhanced'

interface EnhancedSuggestionCardProps {
  suggestion: AISuggestion
  onCustomerClick: (customer: AISuggestion['customer']) => void
  onActionClick: (customer: AISuggestion['customer'], action: AISuggestion['actions'][0]) => void
}

export function EnhancedSuggestionCard({ 
  suggestion, 
  onCustomerClick, 
  onActionClick 
}: EnhancedSuggestionCardProps) {
  const { customer, category, primaryReason, subReasons, actions, expectedImpact, score } = suggestion
  const { analytics } = customer
  
  // カテゴリー別のスタイル
  const categoryStyles = {
    urgent: {
      bg: 'bg-error/10',
      border: 'border-error/30',
      icon: '🚨',
      label: '緊急',
      labelColor: 'text-error'
    },
    opportunity: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      icon: '💎',
      label: 'チャンス',
      labelColor: 'text-success'
    },
    relationship: {
      bg: 'bg-info/10',
      border: 'border-info/30',
      icon: '🤝',
      label: '関係構築',
      labelColor: 'text-info'
    },
    surprise: {
      bg: 'bg-secondary-100',
      border: 'border-secondary-300',
      icon: '🎉',
      label: 'サプライズ',
      labelColor: 'text-secondary-700'
    }
  }
  
  const style = categoryStyles[category]
  
  return (
    <Card 
      variant="elevated" 
      className={`${style.bg} ${style.border} border-2 hover:shadow-lg transition-all duration-300`}
    >
      <CardContent className="p-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="flex items-start gap-2 sm:gap-3 cursor-pointer flex-1"
            onClick={() => onCustomerClick(customer)}
          >
            <div className="text-2xl sm:text-3xl">{style.icon}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">{customer.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${style.labelColor} ${style.bg} font-medium`}>
                  {style.label}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getRankColor(customer.vipRank)}`}>
                  <StarIcon size={10} filled />
                  {customer.vipRank.toUpperCase()}
                </span>
              </div>
              
              {/* 主要な理由 */}
              <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-2">{primaryReason}</p>
              
              {/* サブ理由 */}
              {subReasons.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {subReasons.map((reason, index) => (
                    <li key={index} className="text-xs text-neutral-600 flex items-start gap-1.5">
                      <span className="text-neutral-400 mt-0.5 flex-shrink-0">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* AIスコア表示 */}
          <div className="text-right">
            <div className="text-xs text-neutral-500 mb-1">AI信頼度</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-8 rounded-full transition-all duration-300 ${
                    i < Math.round(score * 5) 
                      ? category === 'urgent' ? 'bg-error' : 
                        category === 'opportunity' ? 'bg-success' :
                        category === 'relationship' ? 'bg-info' : 'bg-secondary-500'
                      : 'bg-neutral-200'
                  }`}
                  style={{
                    height: `${20 + (i * 4)}px`,
                    opacity: i < Math.round(score * 5) ? 1 : 0.3
                  }}
                />
              ))}
            </div>
            <div className="text-xs font-medium mt-1">{Math.round(score * 100)}%</div>
          </div>
        </div>
        
        {/* 顧客情報 */}
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 p-2 sm:p-3 bg-white/50 rounded-lg">
          <div>
            <p className="text-xs text-neutral-500">累計売上</p>
            <p className="text-sm font-bold text-primary-600">
              {formatCurrency(analytics.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">平均単価</p>
            <p className="text-sm font-bold">
              {formatCurrency(analytics.avgRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">来店回数</p>
            <p className="text-sm font-bold">{analytics.visitCount}回</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">最終来店</p>
            <p className="text-sm font-bold">
              {analytics.lastVisit ? formatDateShort(analytics.lastVisit) : '未来店'}
            </p>
          </div>
        </div>
        
        {/* 期待される効果 */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 p-2 sm:p-3 bg-neutral-50 rounded-lg overflow-x-auto">
          <div className="flex-1">
            <p className="text-xs text-neutral-500">期待売上</p>
            <p className="text-sm font-bold text-success">
              +{formatCurrency(expectedImpact.revenue)}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-500">継続率向上</p>
            <p className="text-sm font-bold text-info">
              {Math.round(expectedImpact.retention * 100)}%
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-500">トレンド</p>
            <p className="text-sm font-bold">
              {analytics.trend === 'increasing' ? '📈 上昇' : 
               analytics.trend === 'decreasing' ? '📉 下降' : '➡️ 安定'}
            </p>
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="space-y-2">
          {actions.map((action, index) => {
            const actionIcons = {
              contact: '📞',
              special_offer: '🎁',
              birthday: '🎂',
              retention: '💝'
            }
            
            const actionColors = {
              high: 'primary',
              medium: 'secondary',
              low: 'outline'
            } as const
            
            return (
              <div key={index} className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant={actionColors[action.priority]}
                  fullWidth
                  onClick={() => onActionClick(customer, action)}
                >
                  <span className="mr-2">{actionIcons[action.type]}</span>
                  {action.message}
                </Button>
                {action.priority === 'high' && (
                  <span className="text-xs text-error font-medium whitespace-nowrap">重要</span>
                )}
              </div>
            )
          })}
        </div>
        
        {/* 連絡先情報 */}
        {(customer.phone || customer.lineId) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200">
            {customer.phone && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.location.href = `tel:${customer.phone}`}
              >
                <PhoneIcon size={16} className="mr-1" />
                電話
              </Button>
            )}
            {customer.lineId && (
              <Button
                size="sm"
                variant="ghost"
                className="text-success hover:bg-success/10"
                onClick={() => window.open(`https://line.me/R/ti/p/${customer.lineId}`, '_blank')}
              >
                <MessageIcon size={16} className="mr-1" />
                LINE
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MessageIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}