import { useCustomerStore } from '../stores/customerStore'
import { TrendingUpIcon, UsersIcon, ClockIcon, CalendarIcon } from './ui/Icons'

export function ProfessionalDashboard() {
  const { customers, visits } = useCustomerStore()
  
  const todayVisits = visits.filter(visit => {
    const today = new Date()
    const visitDate = new Date(visit.date)
    return visitDate.toDateString() === today.toDateString()
  })
  
  const activeCustomers = customers.filter(c => c.lastVisit && 
    new Date().getTime() - new Date(c.lastVisit).getTime() < 30 * 24 * 60 * 60 * 1000
  ).length
  
  const totalRevenue = visits.reduce((sum, visit) => sum + visit.revenue, 0)
  
  const recentVisits = visits
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const stats = [
    {
      label: '総顧客数',
      value: customers.length.toLocaleString(),
      icon: UsersIcon,
      change: '+12%',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      label: '本日の来店',
      value: todayVisits.length.toLocaleString(),
      icon: CalendarIcon,
      change: '+5%',
      color: 'from-purple-500 to-pink-600'
    },
    {
      label: 'アクティブ顧客',
      value: activeCustomers.toLocaleString(),
      icon: TrendingUpIcon,
      change: '+8%',
      color: 'from-green-500 to-teal-600'
    },
    {
      label: '総売上',
      value: `¥${totalRevenue.toLocaleString()}`,
      icon: ClockIcon,
      change: '+15%',
      color: 'from-orange-500 to-red-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">おかえりなさい！</h1>
        <p className="text-primary-100 text-lg">
          今日も素晴らしい一日にしましょう ✨
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Visits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の来店</h3>
          <div className="space-y-3">
            {recentVisits.length > 0 ? (
              recentVisits.map((visit, index) => {
                const customer = customers.find(c => c.id === visit.customerId)
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{customer?.name || '不明'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(visit.date).toLocaleDateString('ja-JP')}
                      </p>
                      {visit.memo && <p className="text-xs text-gray-400">{visit.memo}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ¥{visit.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>まだ来店記録がありません</p>
                <p className="text-sm">新しい来店を記録してみましょう</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">VIP顧客</h3>
          <div className="space-y-3">
            {customers
              .filter(c => c.vipRank === 'gold' || c.vipRank === 'silver')
              .sort((a, b) => b.totalRevenue - a.totalRevenue)
              .slice(0, 5)
              .map((customer) => (
                <div key={customer.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      customer.vipRank === 'gold' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{customer.vipRank}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ¥{customer.totalRevenue.toLocaleString()}
                  </p>
                </div>
              ))
            }
            {customers.filter(c => c.vipRank === 'gold' || c.vipRank === 'silver').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>VIP顧客はまだいません</p>
                <p className="text-sm">売上を積み重ねてVIPランクを獲得しましょう</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}