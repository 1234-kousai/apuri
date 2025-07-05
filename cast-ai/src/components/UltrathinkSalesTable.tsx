import type { Customer, Visit } from '../lib/db'
import { formatCurrency } from '../utils/format'

interface UltrathinkSalesTableProps {
  visits: Visit[]
  customers: Customer[]
  onCustomerClick: (customer: Customer) => void
}

export function UltrathinkSalesTable({ visits, customers, onCustomerClick }: UltrathinkSalesTableProps) {
  const sortedVisits = [...visits].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 20)

  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Header */}
      <section className="mb-12">
        <h1 className="ultra-heading text-[6rem] leading-none mb-4">
          REVENUE
        </h1>
        <p className="text-xl font-light opacity-60">
          Transaction history
        </p>
      </section>

      {/* Table */}
      <div className="ultra-glass rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-6 text-xs font-medium opacity-50 uppercase tracking-[0.2em]">
                Customer
              </th>
              <th className="text-left p-6 text-xs font-medium opacity-50 uppercase tracking-[0.2em]">
                Date
              </th>
              <th className="text-left p-6 text-xs font-medium opacity-50 uppercase tracking-[0.2em]">
                Notes
              </th>
              <th className="text-right p-6 text-xs font-medium opacity-50 uppercase tracking-[0.2em]">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedVisits.map((visit, index) => {
              const customer = customers.find(c => c.id === visit.customerId)
              
              return (
                <tr
                  key={visit.id}
                  onClick={() => customer && onCustomerClick(customer)}
                  className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ultra-animate-slide"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#9945ff] flex items-center justify-center">
                        <span className="text-sm font-thin text-black">
                          {customer?.name.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-light">{customer?.name || '不明な顧客'}</div>
                        <div className="text-xs opacity-50">ID: {visit.customerId.toString().padStart(6, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-light tabular-nums">
                      {new Date(visit.date).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="text-xs opacity-50">
                      {new Date(visit.date).toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-light text-sm opacity-70">
                      {visit.memo || '-'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="font-light text-xl ultra-neon tabular-nums">
                      {formatCurrency(visit.revenue)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}