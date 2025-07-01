import { useState, useMemo } from 'react'
import type { Customer } from '../lib/db'
import { Card, CardContent } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { SearchIcon, FilterIcon, StarIcon, PhoneIcon, CalendarIcon } from './ui/Icons'
import { formatCurrency, formatDateShort, getRankColor } from '../utils/format'

interface CustomerListProps {
  customers: Customer[]
  onCustomerClick: (customer: Customer) => void
}

type SortOption = 'recent' | 'revenue' | 'name'
type FilterRank = 'all' | 'gold' | 'silver' | 'bronze'

export function CustomerList({ customers, onCustomerClick }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterRank, setFilterRank] = useState<FilterRank>('all')
  const [showFilters, setShowFilters] = useState(false)

  // フィルタリングとソート
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.memo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery) ||
        customer.lineId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // ランクフィルター
    if (filterRank !== 'all') {
      filtered = filtered.filter(customer => customer.vipRank === filterRank)
    }

    // ソート
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (b.lastVisit?.getTime() || 0) - (a.lastVisit?.getTime() || 0)
        case 'revenue':
          return b.totalRevenue - a.totalRevenue
        case 'name':
          return a.name.localeCompare(b.name, 'ja')
        default:
          return 0
      }
    })
  }, [customers, searchQuery, sortBy, filterRank])

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-neutral-500 space-y-2">
            <UsersIcon size={48} className="mx-auto text-neutral-300" />
            <p>顧客が登録されていません</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 検索とフィルター */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <Input
                type="text"
                placeholder="名前、電話番号、メモで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FilterIcon size={16} className="mr-2" />
                フィルター
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="recent">最終来店順</option>
                <option value="revenue">売上高順</option>
                <option value="name">名前順</option>
              </select>
            </div>

            {showFilters && (
              <div className="pt-3 border-t border-neutral-200">
                <p className="text-sm font-medium text-neutral-700 mb-2">ランクでフィルター</p>
                <div className="flex gap-2">
                  {(['all', 'gold', 'silver', 'bronze'] as const).map((rank) => (
                    <Button
                      key={rank}
                      variant={filterRank === rank ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setFilterRank(rank)}
                    >
                      {rank === 'all' ? '全て' : rank.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 検索結果 */}
      {filteredAndSortedCustomers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-neutral-500">該当する顧客が見つかりません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedCustomers.map((customer) => (
            <Card
              key={customer.id}
              variant="elevated"
              className="cursor-pointer hover:shadow-large transition-all duration-200 transform hover:-translate-y-0.5"
              onClick={() => onCustomerClick(customer)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-neutral-900">{customer.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getRankColor(customer.vipRank)}`}>
                        <StarIcon size={12} filled className="inline mr-1" />
                        {customer.vipRank.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                      {customer.phone && (
                        <div className="flex items-center gap-1">
                          <PhoneIcon size={14} />
                          <span>電話あり</span>
                        </div>
                      )}
                      {customer.lineId && (
                        <div className="flex items-center gap-1">
                          <MessageIcon size={14} />
                          <span>LINE</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={14} />
                        <span>{formatDateShort(customer.lastVisit)}</span>
                      </div>
                    </div>

                    {customer.memo && (
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{customer.memo}</p>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-primary-600">
                      {formatCurrency(customer.totalRevenue)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">累計売上</p>
                    {customer.avgVisitInterval && (
                      <p className="text-xs text-neutral-500 mt-1">
                        平均{customer.avgVisitInterval}日毎
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 結果数表示 */}
      <div className="text-center py-4">
        <p className="text-sm text-neutral-500">
          {filteredAndSortedCustomers.length}名の顧客を表示
          {searchQuery || filterRank !== 'all' ? ` (全${customers.length}名中)` : ''}
        </p>
      </div>
    </div>
  )
}

function UsersIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
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
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 21v-2a4 4 0 00-3-3.87"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 3.13a4 4 0 010 7.75"
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