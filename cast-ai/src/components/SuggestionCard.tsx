import type { Customer, Visit } from '../lib/db'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { PhoneIcon, StarIcon, CalendarIcon } from './ui/Icons'
import { formatCurrency, formatDateShort, getRankColorWithBorder } from '../utils/format'

interface SuggestionCardProps {
  customer: Customer
  visits: Visit[]
  reason: string
  onCustomerClick: (customer: Customer) => void
  onContactClick: (customer: Customer) => void
}

export function SuggestionCard({ 
  customer, 
  visits,
  reason, 
  onCustomerClick, 
  onContactClick 
}: SuggestionCardProps) {
  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation()
    onContactClick(customer)
  }

  // 最後の訪問からの経過日数を計算
  const daysSinceLastVisit = customer.lastVisit 
    ? Math.floor((new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Card 
      variant="elevated"
      className="cursor-pointer hover:shadow-large transition-all duration-200 transform hover:-translate-y-0.5 overflow-hidden"
      onClick={() => onCustomerClick(customer)}
    >
      {/* 優先度インジケーター */}
      <div className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-xl text-neutral-900">{customer.name}</h3>
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getRankColorWithBorder(customer.vipRank)}`}>
                <StarIcon size={12} filled className="inline mr-1" />
                {customer.vipRank.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1">
                <CalendarIcon size={14} />
                <span>{formatDateShort(customer.lastVisit)}</span>
                {daysSinceLastVisit !== null && daysSinceLastVisit > 30 && (
                  <span className="text-warning font-medium ml-1">
                    ({daysSinceLastVisit}日経過)
                  </span>
                )}
              </div>
              {visits.length > 0 && (
                <span className="text-neutral-500">
                  来店{visits.length}回
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(customer.totalRevenue)}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">累計売上</p>
          </div>
        </div>

        {/* AI提案理由 */}
        <div className="bg-gradient-to-r from-info/10 to-secondary-100/50 border border-info/20 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-info text-white rounded-lg p-1.5 flex-shrink-0">
              <AIIcon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-info mb-1">AI提案</p>
              <p className="text-sm text-neutral-700 leading-relaxed">{reason}</p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          {customer.phone && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleContact}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              <PhoneIcon size={16} className="mr-2" />
              電話する
            </Button>
          )}
          {customer.lineId && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleContact}
              className="bg-gradient-to-r from-success to-green-700 hover:from-green-600 hover:to-green-800"
            >
              <MessageIcon size={16} className="mr-2" />
              LINEで連絡
            </Button>
          )}
          {!customer.phone && !customer.lineId && (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation()
                onCustomerClick(customer)
              }}
            >
              詳細を見る
            </Button>
          )}
        </div>

        {/* 追加情報 */}
        {customer.birthday && (() => {
          const today = new Date()
          const birthday = new Date(customer.birthday)
          birthday.setFullYear(today.getFullYear())
          const daysUntilBirthday = Math.floor((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysUntilBirthday >= 0 && daysUntilBirthday <= 30) {
            return (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <p className="text-xs text-secondary-600 font-medium">
                  🎂 誕生日まで{daysUntilBirthday === 0 ? '今日' : `${daysUntilBirthday}日`}
                </p>
              </div>
            )
          }
          return null
        })()}
      </CardContent>
    </Card>
  )
}

function AIIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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