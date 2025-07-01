import type { Customer, Visit } from '../lib/db'
import { useCustomerStore } from '../stores/customerStore'

interface CustomerDetailProps {
  customer: Customer
  visits: Visit[]
  onClose: () => void
  onAddVisit: () => void
  onEdit: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount)
}

const formatDate = (date: Date) => {
  const d = new Date(date)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export function CustomerDetail({ customer, visits, onClose, onAddVisit, onEdit }: CustomerDetailProps) {
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer)
  
  const handleDelete = async () => {
    if (confirm(`${customer.name}さんのデータを削除しますか？\nこの操作は取り消せません。`)) {
      try {
        await deleteCustomer(customer.id!)
        onClose()
      } catch (error) {
        console.error('Failed to delete customer:', error)
        alert('削除に失敗しました')
      }
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'gold':
        return 'bg-yellow-100 text-yellow-800'
      case 'silver':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-orange-100 text-orange-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onClose} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">{customer.name}</h1>
          <button onClick={onEdit} className="text-blue-500">
            編集
          </button>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 基本情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm px-3 py-1 rounded-full ${getRankColor(customer.vipRank)}`}>
                {customer.vipRank.toUpperCase()}
              </span>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(customer.totalRevenue)}</p>
                <p className="text-sm text-gray-500">累計売上</p>
              </div>
            </div>
            
            {customer.birthday && (
              <p className="text-sm text-gray-600">
                誕生日: {formatDate(new Date(customer.birthday))}
              </p>
            )}
            {customer.phone && (
              <p className="text-sm text-gray-600">
                電話: {customer.phone}
              </p>
            )}
            {customer.lineId && (
              <p className="text-sm text-gray-600">
                LINE: {customer.lineId}
              </p>
            )}
            {customer.memo && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">{customer.memo}</p>
              </div>
            )}
          </div>

          {/* 統計情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">統計情報</h3>
            <div className="space-y-1 text-sm">
              <p>来店回数: {visits.length}回</p>
              {customer.avgVisitInterval && (
                <p>平均来店間隔: {customer.avgVisitInterval}日</p>
              )}
              {customer.lastVisit && (
                <p>最終来店: {formatDate(customer.lastVisit)}</p>
              )}
            </div>
          </div>

          {/* 来店履歴 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">来店履歴</h3>
              <button
                onClick={onAddVisit}
                className="text-sm text-blue-500"
              >
                + 追加
              </button>
            </div>
            
            {visits.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">来店履歴がありません</p>
            ) : (
              <div className="space-y-2">
                {visits
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((visit) => (
                    <div key={visit.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{formatDate(visit.date)}</p>
                          {visit.memo && (
                            <p className="text-xs text-gray-600 mt-1">{visit.memo}</p>
                          )}
                        </div>
                        <p className="font-semibold">{formatCurrency(visit.revenue)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 削除ボタン */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleDelete}
          className="w-full py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50"
        >
          この顧客を削除
        </button>
      </div>
    </div>
  )
}