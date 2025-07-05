import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { InstallPrompt } from './components/InstallPrompt'
import { CustomerForm } from './components/CustomerForm'
import { ToastContainer } from './components/Toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { UltrathinkLayout } from './components/UltrathinkLayout'
import { UltrathinkDashboard } from './components/UltrathinkDashboard'
import { UltrathinkCustomerList } from './components/UltrathinkCustomerList'
import { UltrathinkSalesTable } from './components/UltrathinkSalesTable'
import { UltrathinkSuggestionCard } from './components/UltrathinkSuggestionCard'
import { DataManagement } from './components/DataManagement'
import { initSecurityFeatures } from './lib/security'

// 遅延読み込みコンポーネント
const CustomerDetail = lazy(() => import('./components/CustomerDetail').then(m => ({ default: m.CustomerDetail })))
const VisitForm = lazy(() => import('./components/VisitForm').then(m => ({ default: m.VisitForm })))
const CustomerEditForm = lazy(() => import('./components/CustomerEditForm').then(m => ({ default: m.CustomerEditForm })))
const AISettings = lazy(() => import('./components/AISettings').then(m => ({ default: m.AISettings })))

import { useCustomerStore } from './stores/customerStore'
import type { Customer } from './lib/db'
import type { AISuggestion } from './lib/ai-enhanced'
import { useMemoizedAISuggestions } from './hooks/useMemoizedAISuggestions'
import { SkipLink } from './components/SkipLink'
import { GlobalLoading } from './components/GlobalLoading'

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'customers' | 'sales'>('home')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [preSelectedCustomerId, setPreSelectedCustomerId] = useState<number | undefined>()
  const [showAISettings, setShowAISettings] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [aiSettings, setAISettings] = useState({
    maxSuggestions: 5,
    includeCategories: ['urgent', 'opportunity', 'relationship', 'surprise'] as AISuggestion['category'][],
    minScore: 0.5
  })
  
  const { customers, visits, loadCustomers, loadVisits } = useCustomerStore()

  useEffect(() => {
    // セキュリティ機能の初期化
    initSecurityFeatures()
    
    // データの読み込み
    loadCustomers()
    loadVisits()
  }, [])

  // 今月の統計情報を計算
  const monthlyStats = useMemo(() => {
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
    
    // 平均来店頻度
    const avgFrequency = customers.length > 0 ? Math.round(visits.length / customers.length) : 0
    
    return {
      totalRevenue,
      visitCount: thisMonthVisits.length,
      monthlyPrediction,
      daysPassed,
      customerCount: customers.length,
      avgFrequency
    }
  }, [visits, customers])

  const suggestions = useMemoizedAISuggestions(customers, visits, aiSettings)

  return (
    <>
      <SkipLink />
      <GlobalLoading />
      
      <UltrathinkLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewCustomer={() => setShowCustomerForm(true)}
        onNewVisit={() => {
          setPreSelectedCustomerId(undefined)
          setShowVisitForm(true)
        }}
      >
        {/* Home Dashboard */}
        {activeTab === 'home' && (
          <UltrathinkDashboard stats={monthlyStats}>
            <div className="space-y-6">
              {/* Settings Section */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowAISettings(true)}
                  className="ultra-btn flex-1"
                >
                  AI設定
                </button>
                <button
                  onClick={() => setShowDataManagement(true)}
                  className="ultra-btn flex-1"
                >
                  データ管理
                </button>
              </div>
              
              {/* Suggestions */}
              {customers.length === 0 ? (
                <div className="ultra-card p-12 text-center">
                  <h3 className="text-2xl font-thin mb-4">No customer data</h3>
                  <p className="opacity-60 mb-8">Start by adding your first customer</p>
                  <button
                    onClick={() => setShowCustomerForm(true)}
                    className="ultra-btn ultra-btn-primary"
                  >
                    Add First Customer
                  </button>
                </div>
              ) : (
                <Suspense fallback={<LoadingSpinner />}>
                  {suggestions.map((suggestion) => (
                    <UltrathinkSuggestionCard
                      key={suggestion.customer.id}
                      suggestion={suggestion}
                      onCustomerClick={setSelectedCustomer}
                      onActionClick={(customer, action) => {
                        if (action.type === 'contact') {
                          if (customer.phone) {
                            window.location.href = `tel:${customer.phone}`
                          } else if (customer.lineId) {
                            window.open(`https://line.me/R/ti/p/${customer.lineId}`, '_blank')
                          }
                        } else {
                          setSelectedCustomer(customer)
                        }
                      }}
                    />
                  ))}
                </Suspense>
              )}
            </div>
          </UltrathinkDashboard>
        )}

        {/* Customers List */}
        {activeTab === 'customers' && (
          <UltrathinkCustomerList
            customers={customers}
            visits={visits}
            onCustomerClick={setSelectedCustomer}
          />
        )}

        {/* Sales Table */}
        {activeTab === 'sales' && (
          <UltrathinkSalesTable
            visits={visits}
            customers={customers}
            onCustomerClick={setSelectedCustomer}
          />
        )}
      </UltrathinkLayout>

      {/* Modals and Forms */}
      <InstallPrompt />
      
      {showCustomerForm && (
        <CustomerForm onClose={() => setShowCustomerForm(false)} />
      )}

      {showVisitForm && (
        <Suspense fallback={<LoadingSpinner />}>
          <VisitForm 
            customers={customers}
            preSelectedCustomerId={preSelectedCustomerId}
            onClose={() => {
              setShowVisitForm(false)
              setPreSelectedCustomerId(undefined)
            }} 
          />
        </Suspense>
      )}

      {selectedCustomer && (
        <Suspense fallback={<LoadingSpinner />}>
          <CustomerDetail
            customer={selectedCustomer}
            visits={visits.filter(v => v.customerId === selectedCustomer.id)}
            onClose={() => setSelectedCustomer(null)}
            onAddVisit={() => {
              setPreSelectedCustomerId(selectedCustomer.id)
              setShowVisitForm(true)
            }}
            onEdit={() => {
              setShowEditForm(true)
            }}
          />
        </Suspense>
      )}

      {showEditForm && selectedCustomer && (
        <Suspense fallback={<LoadingSpinner />}>
          <CustomerEditForm
            customer={selectedCustomer}
            onClose={() => setShowEditForm(false)}
          />
        </Suspense>
      )}
      
      {showAISettings && (
        <Suspense fallback={<LoadingSpinner />}>
          <AISettings
            settings={aiSettings}
            onClose={() => setShowAISettings(false)}
            onSave={(newSettings) => setAISettings(newSettings)}
          />
        </Suspense>
      )}
      
      {showDataManagement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowDataManagement(false)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <DataManagement />
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  )
}

export default App