import { useState, useMemo } from 'react'
import type { Customer } from '../lib/db'
import { Card, CardContent } from './ui/Card'
import { PremiumCard, PremiumCardContent } from './ui/PremiumCard'
import { PremiumCustomerCard } from './ui/PremiumCustomerCard'
import { PremiumInput } from './ui/PremiumInput'
import { PremiumButton } from './ui/PremiumButton'
import { SearchIcon, FilterIcon } from './ui/Icons'

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
      <PremiumCard size="sm">
        <PremiumCardContent>
          <div className="space-y-3">
            <PremiumInput
              type="text"
              placeholder="名前、電話番号、メモで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<SearchIcon size={20} />}
            />
            
            <div className="flex items-center justify-between">
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                icon={<FilterIcon size={16} />}
              >
                フィルター
              </PremiumButton>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input-premium text-sm py-1.5 px-3"
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
                    <PremiumButton
                      key={rank}
                      variant={filterRank === rank ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setFilterRank(rank)}
                    >
                      {rank === 'all' ? '全て' : rank.toUpperCase()}
                    </PremiumButton>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PremiumCardContent>
      </PremiumCard>

      {/* 検索結果 */}
      {filteredAndSortedCustomers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-neutral-500">該当する顧客が見つかりません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedCustomers.map((customer, index) => {
            // Calculate basic stats for the customer
            const stats = {
              visitCount: 0, // TODO: Add visitCount to Customer type
              totalRevenue: customer.totalRevenue,
              lastVisit: customer.lastVisit,
              // Simple churn risk calculation based on days since last visit
              churnRisk: (() => {
                if (!customer.lastVisit) return undefined
                const daysSinceLastVisit = Math.floor((Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
                if (daysSinceLastVisit > 60) return 'high' as const
                if (daysSinceLastVisit > 30) return 'medium' as const
                return 'low' as const
              })()
            }
            
            return (
              <div
                key={customer.id}
                className="animate-list-item"
                style={{ '--index': index } as React.CSSProperties}
              >
                <PremiumCustomerCard
                  customer={customer}
                  onClick={onCustomerClick}
                  stats={stats}
                />
              </div>
            )
          })}
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

