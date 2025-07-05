import type { Customer, Visit } from '../lib/db'
import { formatCurrency } from '../utils/format'

interface UltrathinkCustomerListProps {
  customers: Customer[]
  visits: Visit[]
  onCustomerClick: (customer: Customer) => void
}

export function UltrathinkCustomerList({ customers, visits, onCustomerClick }: UltrathinkCustomerListProps) {
  const getCustomerStats = (customerId: number | undefined) => {
    const customerVisits = visits.filter(v => v.customerId === customerId && customerId !== undefined)
    const totalRevenue = customerVisits.reduce((sum, v) => sum + v.revenue, 0)
    const lastVisit = customerVisits.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
    
    return { totalRevenue, visitCount: customerVisits.length, lastVisit }
  }

  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <section className="mb-12">
        <h1 className="ultra-heading-outline text-[6rem] leading-none mb-4">
          CUSTOMERS
        </h1>
        <p className="text-xl font-light opacity-60">
          {customers.length} active profiles
        </p>
      </section>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {customers.map((customer, index) => {
          const stats = getCustomerStats(customer.id)
          
          return (
            <div
              key={customer.id}
              onClick={() => onCustomerClick(customer)}
              className="ultra-glass p-8 cursor-pointer ultra-hover-glow ultra-animate-reveal group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Customer Avatar */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#9945ff] flex items-center justify-center">
                  <span className="text-2xl font-thin text-black">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {stats.visitCount > 5 && (
                  <div className="px-3 py-1 rounded-full bg-[#00ff88]/20 text-[#00ff88] text-xs">
                    VIP
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <h3 className="text-xl font-light mb-2 group-hover:text-[#00d4ff] transition-colors">
                {customer.name}
              </h3>
              <p className="text-sm opacity-50 mb-6">
                ID: {customer.id?.toString().padStart(6, '0') || 'N/A'}
              </p>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-50 uppercase tracking-wider">Revenue</span>
                  <span className="font-light">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-50 uppercase tracking-wider">Visits</span>
                  <span className="font-light">{stats.visitCount}</span>
                </div>
                {stats.lastVisit && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-50 uppercase tracking-wider">Last Visit</span>
                    <span className="font-light text-xs">
                      {new Date(stats.lastVisit.date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 to-transparent" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}