import { useState } from 'react'
import type { Customer, Visit } from '../lib/db'
import { formatCurrency } from '../utils/format'

interface UltrathinkSalesTableProps {
  visits: Visit[]
  customers: Customer[]
  onCustomerClick: (customer: Customer) => void
}

export function UltrathinkSalesTable({ visits, customers, onCustomerClick }: UltrathinkSalesTableProps) {
  console.log('=== UltrathinkSalesTable RENDER ===');
  console.log('Visits prop:', visits);
  console.log('Number of visits:', visits.length);
  console.log('Customers prop:', customers);
  console.log('Number of customers:', customers.length);
  
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all')
  
  const filterVisitsByDate = (visits: Visit[]) => {
    const now = new Date()
    switch (dateFilter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return visits.filter(v => new Date(v.date) >= weekAgo)
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return visits.filter(v => new Date(v.date) >= monthAgo)
      default:
        return visits
    }
  }
  
  const filteredVisits = filterVisitsByDate(visits)
  console.log('Filtered visits by', dateFilter, ':', filteredVisits.length);
  
  const sortedVisits = [...filteredVisits].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 20)
  console.log('Sorted visits (top 20):', sortedVisits.length);

  const totalRevenue = sortedVisits.reduce((sum, visit) => sum + visit.revenue, 0)
  console.log('Total revenue for displayed visits:', totalRevenue);

  return (
    <div className="min-h-screen p-8 lg:p-12 relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 ultra-grid-pattern opacity-5" />
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #ff0080 0%, transparent 70%)',
            left: '-400px',
            bottom: '-200px',
            filter: 'blur(100px)',
            animation: 'ultra-float 25s ease-in-out infinite'
          }}
        />
      </div>

      {/* Header */}
      <section className="mb-12 relative">
        <h1 className="ultra-heading text-[6rem] leading-none mb-4" data-text="REVENUE">
          REVENUE
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-xl font-light opacity-60">
            Transaction history · <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0080] to-[#ff6b00]">{formatCurrency(totalRevenue)}</span> total
          </p>
          
          {/* Date Filter */}
          <div className="flex gap-2">
            {(['all', 'week', 'month'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-light tracking-wider uppercase transition-all duration-300 ${
                  dateFilter === filter
                    ? 'bg-gradient-to-r from-[#ff0080] to-[#ff6b00] text-white shadow-lg shadow-[#ff0080]/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Table */}
      <div className="relative">
        {/* Table container with enhanced glass effect */}
        <div className="ultra-glass rounded-3xl overflow-hidden relative">
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-3xl p-[1px] overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, #ff0080, #ff6b00, #ffd700, #ff6b00, #ff0080)',
                backgroundSize: '200% 100%',
                animation: 'ultra-gradient-shift 5s linear infinite',
                opacity: 0.3
              }}
            />
          </div>
          
          <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left p-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-50 uppercase tracking-[0.3em]">Customer</span>
                      <div className="w-16 h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                  </th>
                  <th className="text-left p-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-50 uppercase tracking-[0.3em]">Date</span>
                      <div className="w-16 h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                  </th>
                  <th className="text-left p-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-50 uppercase tracking-[0.3em]">Notes</span>
                      <div className="w-16 h-px bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                  </th>
                  <th className="text-right p-6">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/20" />
                      <span className="text-xs font-medium opacity-50 uppercase tracking-[0.3em]">Amount</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVisits.map((visit, index) => {
                  const customer = customers.find(c => c.id === visit.customerId)
                  if (!customer) {
                    console.warn(`Customer not found for visit ID ${visit.id}, customer ID ${visit.customerId}`);
                  }
                  const isHovered = hoveredRow === index
                  const prevVisit = sortedVisits[index - 1]
                  const revenueChange = prevVisit ? ((visit.revenue - prevVisit.revenue) / prevVisit.revenue) * 100 : 0
                  
                  return (
                    <tr
                      key={visit.id}
                      onClick={() => customer && onCustomerClick(customer)}
                      onMouseEnter={() => setHoveredRow(index)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className="border-b border-white/5 cursor-pointer transition-all duration-300 relative group"
                      style={{ 
                        animationDelay: `${index * 30}ms`,
                        transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent'
                      }}
                    >
                      {/* Row highlight effect */}
                      <td colSpan={4} className="absolute inset-0 pointer-events-none">
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, rgba(255, 0, 128, 0.1) 50%, transparent 100%)`,
                            transform: isHovered ? 'translateX(0)' : 'translateX(-100%)',
                            transition: 'all 0.5s ease-out'
                          }}
                        />
                      </td>
                      
                      <td className="p-6 relative">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-br from-[#00d4ff] to-[#9945ff] blur-lg transition-opacity duration-300 ${isHovered ? 'opacity-50' : 'opacity-0'}`} />
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#9945ff] flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-12">
                              <span className="text-sm font-thin text-black">
                                {customer?.name.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-light group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00d4ff] group-hover:to-[#9945ff] transition-all duration-300">
                              {customer?.name || '不明な顧客'}
                            </div>
                            <div className="text-xs opacity-50 flex items-center gap-2">
                              <span className="inline-block w-1 h-1 rounded-full bg-[#00d4ff] opacity-50 animate-pulse" />
                              ID: {visit.customerId.toString().padStart(6, '0')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 relative">
                        <div className="font-light tabular-nums">
                          {new Date(visit.date).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="text-xs opacity-50 flex items-center gap-2">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {new Date(visit.date).toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="p-6 relative">
                        <span className="font-light text-sm opacity-70 line-clamp-1">
                          {visit.memo || <span className="opacity-30">-</span>}
                        </span>
                      </td>
                      <td className="p-6 text-right relative">
                        <div className="flex items-center justify-end gap-3">
                          {revenueChange !== 0 && index > 0 && (
                            <div className={`text-xs flex items-center gap-1 ${revenueChange > 0 ? 'text-[#00ff88]' : 'text-[#ff0080]'}`}>
                              {revenueChange > 0 ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                                </svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 7l-9.2 9.2M7 7v10h10" />
                                </svg>
                              )}
                              <span>{Math.abs(revenueChange).toFixed(0)}%</span>
                            </div>
                          )}
                          <div className="font-light text-xl tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#ff0080] to-[#ff6b00]">
                            {formatCurrency(visit.revenue)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {/* Table footer with summary */}
            <div className="border-t border-white/10 p-6 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="text-sm opacity-50">
                  Showing {sortedVisits.length} of {filteredVisits.length} transactions
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm opacity-50">Total Revenue</div>
                  <div className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#ff0080] to-[#ff6b00]">
                    {formatCurrency(totalRevenue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}