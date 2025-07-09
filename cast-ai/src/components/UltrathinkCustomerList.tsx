import { useState } from 'react'
import type { Customer, Visit } from '../lib/db'
import { formatCurrency } from '../utils/format'

interface UltrathinkCustomerListProps {
  customers: Customer[]
  visits: Visit[]
  onCustomerClick: (customer: Customer) => void
}

export function UltrathinkCustomerList({ customers, visits, onCustomerClick }: UltrathinkCustomerListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const getCustomerStats = (customerId: number | undefined) => {
    if (!customerId) {
      return { totalRevenue: 0, visitCount: 0, lastVisit: undefined }
    }
    
    const customerVisits = visits.filter(v => v.customerId === customerId)
    const totalRevenue = customerVisits.reduce((sum, v) => sum + v.revenue, 0)
    const lastVisit = customerVisits.length > 0 
      ? customerVisits.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]
      : undefined
    
    return { totalRevenue, visitCount: customerVisits.length, lastVisit }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const aStats = getCustomerStats(a.id)
    const bStats = getCustomerStats(b.id)
    return bStats.totalRevenue - aStats.totalRevenue
  })

  return (
    <div className="min-h-screen p-8 lg:p-12 relative">
      {/* Animated background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #9945ff 0%, transparent 70%)',
            right: '-200px',
            top: '20%',
            filter: 'blur(80px)',
            animation: 'ultra-float 20s ease-in-out infinite'
          }}
        />
      </div>

      {/* Header */}
      <section className="mb-12 relative">
        <h1 className="ultra-heading text-[6rem] leading-none mb-4" data-text="CUSTOMERS">
          CUSTOMERS
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-xl font-light opacity-60">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9945ff]">
              {customers.length}
            </span> active profiles
          </p>
          
          {/* Search bar */}
          <div className="relative w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 
                       text-white placeholder-white/30 backdrop-blur-sm
                       focus:outline-none focus:border-[#00d4ff]/50 focus:bg-white/10
                       transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedCustomers.map((customer, index) => {
          const stats = getCustomerStats(customer.id)
          const isHovered = hoveredId === customer.id
          const rank = index + 1
          
          return (
            <div
              key={customer.id || `customer-${index}`}
              onClick={() => {
                if (customer.id) {
                  onCustomerClick(customer)
                } else {
                  console.error('Customer ID is undefined:', customer)
                }
              }}
              onMouseEnter={() => setHoveredId(customer.id || null)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative cursor-pointer transform transition-all duration-500"
              style={{ 
                animationDelay: `${index * 50}ms`,
                transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'
              }}
            >
              {/* Rank indicator for top 3 */}
              {rank <= 3 && (
                <div className="absolute -top-3 -right-3 z-10">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${rank === 1 ? 'bg-gradient-to-br from-[#ffd700] to-[#ff6b00] text-black shadow-lg shadow-[#ffd700]/50' : ''}
                    ${rank === 2 ? 'bg-gradient-to-br from-[#c0c0c0] to-[#808080] text-black shadow-lg shadow-[#c0c0c0]/30' : ''}
                    ${rank === 3 ? 'bg-gradient-to-br from-[#cd7f32] to-[#8b4513] text-black shadow-lg shadow-[#cd7f32]/30' : ''}
                  `}>
                    {rank}
                  </div>
                </div>
              )}

              {/* Card background with animated gradient */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-0 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at ${isHovered ? '50% 50%' : '100% 100%'}, rgba(0, 212, 255, 0.15) 0%, transparent 70%)`,
                    opacity: isHovered ? 1 : 0
                  }}
                />
              </div>

              {/* Main card content */}
              <div className="relative ultra-glass p-8 rounded-3xl h-full">
                {/* Customer Avatar */}
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    {/* Avatar glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-[#00d4ff] to-[#9945ff] blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-50' : 'opacity-0'}`} />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#9945ff] flex items-center justify-center transform transition-transform duration-300 hover:rotate-12">
                      <span className="text-2xl font-thin text-black">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {stats.visitCount > 10 && (
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#ffd700]/20 to-[#ff6b00]/20 text-[#ffd700] text-xs font-medium animate-pulse">
                        GOLD
                      </div>
                    )}
                    {stats.visitCount > 5 && stats.visitCount <= 10 && (
                      <div className="px-3 py-1 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-xs font-medium">
                        VIP
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <h3 className="text-xl font-light mb-2 transition-all duration-300">
                  <span className={isHovered ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9945ff]' : ''}>
                    {customer.name}
                  </span>
                </h3>
                <p className="text-sm opacity-50 mb-6 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#00d4ff]/50 animate-pulse" />
                  ID: {customer.id?.toString().padStart(6, '0') || 'N/A'}
                </p>

                {/* Stats with progress bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs opacity-50 uppercase tracking-wider">Revenue</span>
                      <span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9945ff]">
                        {formatCurrency(stats.totalRevenue)}
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00d4ff] to-[#9945ff] rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((stats.totalRevenue / 500000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-50 uppercase tracking-wider">Visits</span>
                    <div className="flex items-center gap-2">
                      <span className="font-light">{stats.visitCount}</span>
                      {stats.visitCount > 0 && (
                        <div className="flex gap-0.5">
                          {[...Array(Math.min(stats.visitCount, 5))].map((_, i) => (
                            <div 
                              key={i}
                              className="w-1 h-3 rounded-full bg-gradient-to-t from-[#00d4ff] to-[#9945ff]"
                              style={{ opacity: 1 - (i * 0.15) }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {stats.lastVisit && (
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-xs opacity-50 uppercase tracking-wider">Last Visit</span>
                      <span className="font-light text-xs tabular-nums">
                        {new Date(stats.lastVisit.date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00d4ff] to-[#9945ff] transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}