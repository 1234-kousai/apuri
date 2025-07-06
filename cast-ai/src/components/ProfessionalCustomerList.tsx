import { useState } from 'react'
import { useCustomerStore } from '../stores/customerStore'
import { SearchIcon, PhoneIcon, BirthdayIcon, StarIcon, UsersIcon } from './ui/Icons'
import { getSearchableString, getDecryptedString } from '../lib/customerDataUtils'

export function ProfessionalCustomerList() {
  const { customers, visits } = useCustomerStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (getSearchableString(customer.phone).includes(searchTerm)) ||
                         (getSearchableString(customer.lineId).toLowerCase().includes(searchTerm.toLowerCase()))
    const isActive = customer.lastVisit && 
      new Date().getTime() - new Date(customer.lastVisit).getTime() < 30 * 24 * 60 * 60 * 1000
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && isActive) ||
                         (filterType === 'inactive' && !isActive)
    return matchesSearch && matchesFilter
  })

  const getLastVisit = (customerId: number | undefined) => {
    if (!customerId) return null
    const customerVisits = visits.filter(v => v.customerId === customerId)
    if (customerVisits.length === 0) return null
    return customerVisits.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
  }

  const getVisitCount = (customerId: number | undefined) => {
    if (!customerId) return 0
    return visits.filter(v => v.customerId === customerId).length
  }

  const getCustomerRevenue = (customerId: number | undefined) => {
    if (!customerId) return 0
    const customerVisits = visits.filter(v => v.customerId === customerId)
    return customerVisits.reduce((sum, visit) => sum + visit.revenue, 0)
  }

  const formatLastVisit = (visit: any) => {
    if (!visit) return '来店なし'
    const date = new Date(visit.date)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 0) return '今日'
    if (daysDiff === 1) return '昨日'
    if (daysDiff < 7) return `${daysDiff}日前`
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)}週間前`
    return `${Math.floor(daysDiff / 30)}ヶ月前`
  }

  const getVipRankIcon = (rank: string) => {
    switch (rank) {
      case 'gold':
        return <StarIcon className="text-yellow-500" size={16} filled />
      case 'silver':
        return <StarIcon className="text-gray-400" size={16} filled />
      default:
        return <StarIcon className="text-orange-600" size={16} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
          <p className="text-gray-600">総顧客数: {customers.length}名</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="名前、電話番号、LINE IDで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">全て</option>
          <option value="active">アクティブ</option>
          <option value="inactive">非アクティブ</option>
        </select>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const lastVisit = getLastVisit(customer.id)
          const visitCount = getVisitCount(customer.id)
          const totalRevenue = getCustomerRevenue(customer.id)
          const isActive = customer.lastVisit && 
            new Date().getTime() - new Date(customer.lastVisit).getTime() < 30 * 24 * 60 * 60 * 1000

          return (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
            >
              {/* Customer Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getVipRankIcon(customer.vipRank)}
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    ID: {customer.id?.toString().padStart(4, '0') || 'N/A'}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isActive ? 'アクティブ' : '非アクティブ'}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">来店回数</span>
                  <span className="font-medium">{visitCount}回</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">総売上</span>
                  <span className="font-medium">¥{totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">最終来店</span>
                  <span className="font-medium">{formatLastVisit(lastVisit)}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {customer.birthday && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BirthdayIcon size={16} />
                    <span>{new Date(customer.birthday).toLocaleDateString('ja-JP')}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon size={16} />
                    <a href={`tel:${getDecryptedString(customer.phone)}`} className="hover:text-primary-600">
                      {getDecryptedString(customer.phone)}
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button className="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                  詳細
                </button>
                <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  編集
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <UsersIcon size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            顧客が見つかりません
          </h3>
          <p className="text-gray-600 mb-6">
            検索条件を変更するか、新しい顧客を登録してください
          </p>
        </div>
      )}
    </div>
  )
}