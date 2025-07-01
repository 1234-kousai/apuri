import { useState, useEffect } from 'react'
import { InstallPrompt } from './components/InstallPrompt'
import { CustomerForm } from './components/CustomerForm'
import { CustomerList } from './components/CustomerList'
import { CustomerDetail } from './components/CustomerDetail'
import { VisitForm } from './components/VisitForm'
import { SuggestionCard } from './components/SuggestionCard'
import { useCustomerStore } from './stores/customerStore'
import type { Customer } from './lib/db'
import { getTodaysSuggestions } from './lib/ai'

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'customers' | 'sales'>('home')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [preSelectedCustomerId, setPreSelectedCustomerId] = useState<number | undefined>()
  
  const { customers, visits, isLoading, loadCustomers, loadVisits } = useCustomerStore()

  useEffect(() => {
    loadCustomers()
    loadVisits()
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-800">Cast AI</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="p-4">
            {/* 今日の提案セクション */}
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">今日の営業提案</h2>
              <div className="space-y-3">
                {customers.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-4">
                    <p className="text-gray-500 text-center">顧客データがありません</p>
                  </div>
                ) : (
                  getTodaysSuggestions(customers, visits).map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.customer.id}
                      customer={suggestion.customer}
                      visits={suggestion.visits}
                      reason={suggestion.reason}
                      onCustomerClick={(customer) => setSelectedCustomer(customer)}
                      onContactClick={(customer) => {
                        if (customer.phone) {
                          window.location.href = `tel:${customer.phone}`
                        } else if (customer.lineId) {
                          window.location.href = `https://line.me/R/ti/p/${customer.lineId}`
                        }
                      }}
                    />
                  ))
                )}
              </div>
            </section>

            {/* 売上サマリー */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">今月の売上</h2>
              <div className="bg-white rounded-lg shadow p-4">
                {(() => {
                  const now = new Date()
                  const thisMonthVisits = visits.filter(v => {
                    const visitDate = new Date(v.date)
                    return visitDate.getMonth() === now.getMonth() && 
                           visitDate.getFullYear() === now.getFullYear()
                  })
                  const totalRevenue = thisMonthVisits.reduce((sum, v) => sum + v.revenue, 0)
                  
                  // 売上予測の計算
                  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                  const daysPassed = now.getDate()
                  const dailyAverage = daysPassed > 0 ? totalRevenue / daysPassed : 0
                  const monthlyPrediction = Math.round(dailyAverage * daysInMonth)
                  
                  return (
                    <>
                      <div className="flex items-baseline justify-between mb-2">
                        <p className="text-2xl font-bold text-gray-800">
                          ¥{totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">{thisMonthVisits.length}件の来店</p>
                      </div>
                      
                      {daysPassed >= 3 && monthlyPrediction > totalRevenue && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            今月の予想: ¥{monthlyPrediction.toLocaleString()}
                            <span className="text-xs text-gray-500 ml-1">
                              ※過去{daysPassed}日間の実績から算出
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-700">顧客一覧</h2>
              <button
                onClick={() => setShowCustomerForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                + 新規登録
              </button>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : (
              <CustomerList 
                customers={customers} 
                onCustomerClick={(customer) => setSelectedCustomer(customer)}
              />
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-700">売上記録</h2>
              <button
                onClick={() => {
                  setPreSelectedCustomerId(undefined)
                  setShowVisitForm(true)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                + 来店記録
              </button>
            </div>
            {visits.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-500 text-center">売上データがありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((visit) => {
                    const customer = customers.find(c => c.id === visit.customerId)
                    return (
                      <div key={visit.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{customer?.name || '不明な顧客'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(visit.date).toLocaleDateString('ja-JP')}
                            </p>
                            {visit.memo && (
                              <p className="text-sm text-gray-600 mt-1">{visit.memo}</p>
                            )}
                          </div>
                          <p className="text-lg font-semibold">
                            ¥{visit.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="bg-white border-t border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-3 text-center ${
              activeTab === 'home' 
                ? 'text-blue-500 border-t-2 border-blue-500' 
                : 'text-gray-500'
            }`}
          >
            <div className="text-xs">ホーム</div>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 py-3 text-center ${
              activeTab === 'customers' 
                ? 'text-blue-500 border-t-2 border-blue-500' 
                : 'text-gray-500'
            }`}
          >
            <div className="text-xs">顧客</div>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-3 text-center ${
              activeTab === 'sales' 
                ? 'text-blue-500 border-t-2 border-blue-500' 
                : 'text-gray-500'
            }`}
          >
            <div className="text-xs">売上</div>
          </button>
        </div>
      </nav>

      {/* インストールプロンプト */}
      <InstallPrompt />

      {/* 顧客登録フォーム */}
      {showCustomerForm && (
        <CustomerForm onClose={() => setShowCustomerForm(false)} />
      )}

      {/* 来店記録フォーム */}
      {showVisitForm && (
        <VisitForm 
          customers={customers}
          preSelectedCustomerId={preSelectedCustomerId}
          onClose={() => {
            setShowVisitForm(false)
            setPreSelectedCustomerId(undefined)
          }} 
        />
      )}

      {/* 顧客詳細 */}
      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          visits={visits.filter(v => v.customerId === selectedCustomer.id)}
          onClose={() => setSelectedCustomer(null)}
          onAddVisit={() => {
            setPreSelectedCustomerId(selectedCustomer.id)
            setShowVisitForm(true)
          }}
          onEdit={() => {
            // TODO: 編集機能の実装
            console.log('Edit customer:', selectedCustomer)
          }}
        />
      )}
    </div>
  )
}

export default App
