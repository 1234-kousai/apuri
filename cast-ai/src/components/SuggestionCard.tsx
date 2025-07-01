import { Customer, Visit } from '../lib/db'

interface SuggestionCardProps {
  customer: Customer
  visits: Visit[]
  reason: string
  onCustomerClick: (customer: Customer) => void
  onContactClick: (customer: Customer) => void
}

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'silver':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      return 'bg-orange-100 text-orange-800 border-orange-300'
  }
}

const formatDate = (date: Date | undefined) => {
  if (!date) return '未来店'
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今日'
  if (diffDays === 1) return '昨日'
  if (diffDays < 7) return `${diffDays}日前`
  
  return `${d.getMonth() + 1}/${d.getDate()}`
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

  return (
    <div 
      onClick={() => onCustomerClick(customer)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{customer.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getRankColor(customer.vipRank)}`}>
              {customer.vipRank.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              最終: {formatDate(customer.lastVisit)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">累計</p>
          <p className="font-semibold">¥{customer.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* AI提案理由 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
        <p className="text-sm text-blue-800 flex items-start">
          <span className="inline-flex items-center justify-center w-5 h-5 mr-2 bg-blue-600 text-white text-xs font-bold rounded flex-shrink-0">
            AI
          </span>
          {reason}
        </p>
      </div>

      {/* 連絡ボタン */}
      <div className="flex gap-2">
        {customer.phone && (
          <button
            onClick={handleContact}
            className="flex-1 bg-green-500 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            電話
          </button>
        )}
        {customer.lineId && (
          <button
            onClick={handleContact}
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 15.22 15.51 17.02C15.37 17.79 15.1 18.04 14.83 18.07C14.25 18.13 13.81 17.69 13.25 17.32C12.37 16.74 11.87 16.39 11.02 15.83C10.03 15.17 10.67 14.8 11.24 14.21C11.39 14.06 13.95 11.7 14 11.49C14.0069 11.452 14.003 11.4131 13.9883 11.3769C13.9736 11.3407 13.9488 11.3089 13.9165 11.2848C13.884 11.2606 13.8452 11.245 13.8036 11.2397C13.762 11.2344 13.7191 11.2396 13.68 11.25C13.46 11.28 12.06 12.3 9.37 14.07C8.97 14.35 8.61 14.49 8.29 14.48C7.93 14.47 7.27 14.28 6.78 14.11C6.17 13.91 5.69 13.8 5.73 13.45C5.75 13.27 6.01 13.08 6.51 12.89C9.36 11.58 11.26 10.76 12.22 10.41C14.97 9.4 15.52 9.21 15.87 9.2C15.95 9.2 16.13 9.22 16.24 9.31C16.33 9.38 16.36 9.48 16.37 9.55C16.36 9.61 16.38 9.78 16.37 9.91C16.35 10.04 16.3 10.17 16.25 10.3L16.64 8.8Z"/>
            </svg>
            LINE
          </button>
        )}
      </div>
    </div>
  )
}