import { useState } from 'react'
import { useCustomerStore } from '../stores/customerStore'
import { TrendingUpIcon, CalendarIcon, FilterIcon } from './ui/Icons'

export function ProfessionalSalesTable() {
  const { visits, customers } = useCustomerStore()
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('month')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  const getFilteredVisits = () => {
    const now = new Date()
    let filtered = visits.filter(v => v.revenue && v.revenue > 0)

    switch (filterPeriod) {
      case 'today':
        filtered = filtered.filter(v => {
          const visitDate = new Date(v.date)
          return visitDate.toDateString() === now.toDateString()
        })
        break
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(v => new Date(v.date) >= weekAgo)
        break
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(v => new Date(v.date) >= monthAgo)
        break
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return b.revenue - a.revenue
      }
    })
  }

  const filteredVisits = getFilteredVisits()
  const totalRevenue = filteredVisits.reduce((sum, visit) => sum + visit.revenue, 0)
  const averageTransaction = filteredVisits.length > 0 
    ? totalRevenue / filteredVisits.length 
    : 0

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || '不明'
  }

  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case 'today': return '本日'
      case 'week': return '今週'
      case 'month': return '今月'
      default: return '全期間'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">売上管理</h1>
          <p className="text-gray-600">{getPeriodLabel()}の売上データ</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUpIcon className="text-green-600" size={24} />
            <span className="text-xs text-green-600 font-medium">+5.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ¥{totalRevenue.toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">{getPeriodLabel()}の総売上</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <CalendarIcon className="text-blue-600" size={24} />
            <span className="text-xs text-blue-600 font-medium">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {filteredVisits.length}
          </h3>
          <p className="text-gray-600 text-sm">{getPeriodLabel()}の来店数</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <FilterIcon className="text-purple-600" size={24} />
            <span className="text-xs text-purple-600 font-medium">+3.1%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ¥{Math.round(averageTransaction).toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">平均客単価</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex gap-2">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全期間</option>
            <option value="today">本日</option>
            <option value="week">今週</option>
            <option value="month">今月</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="date">日付順</option>
            <option value="amount">金額順</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メモ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  売上金額
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((visit, index) => (
                  <tr key={visit.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(visit.date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getCustomerName(visit.customerId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visit.memo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ¥{visit.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <div className="space-y-2">
                      <p>該当する売上データがありません</p>
                      <p className="text-sm">期間を変更するか、新しい来店を記録してみてください</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}