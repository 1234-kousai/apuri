import { Customer } from '../lib/db'

interface CustomerListProps {
  customers: Customer[]
  onCustomerClick: (customer: Customer) => void
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount)
}

const formatDate = (date: Date | undefined) => {
  if (!date) return '未来店'
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function CustomerList({ customers, onCustomerClick }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">顧客が登録されていません</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <div
          key={customer.id}
          onClick={() => onCustomerClick(customer)}
          className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{customer.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getRankColor(customer.vipRank)}`}>
                  {customer.vipRank.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  最終: {formatDate(customer.lastVisit)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">
                {formatCurrency(customer.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500">累計売上</p>
            </div>
          </div>
          {customer.memo && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-1">{customer.memo}</p>
          )}
        </div>
      ))}
    </div>
  )
}