import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { InstallPrompt } from './components/InstallPrompt'
import { CustomerForm } from './components/CustomerForm'
import { ToastContainer, showToast } from './components/Toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { UltrathinkLayout } from './components/UltrathinkLayout'
import { UltrathinkDashboard } from './components/UltrathinkDashboard'
import { UltrathinkCustomerList } from './components/UltrathinkCustomerList'
import { UltrathinkSalesTable } from './components/UltrathinkSalesTable'
import { UltrathinkSuggestionCard } from './components/UltrathinkSuggestionCard'
import { DataManagement } from './components/DataManagement'
import { initSecurityFeatures } from './lib/security'
import { initAutoBackup } from './lib/autoBackup'
import { initNotificationScheduler } from './lib/notifications'
import { useAuthStore } from './lib/auth'
import { AuthScreen } from './components/AuthScreen'
import { NotificationSettings } from './components/NotificationSettings'
import { SecuritySettings } from './components/SecuritySettings'
import type { StatsPeriod } from './components/StatsPeriodSelector'
import { calculateStats } from './utils/statsCalculator'

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
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showSecuritySettings, setShowSecuritySettings] = useState(false)
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('month')
  const [aiSettings, setAISettings] = useState({
    maxSuggestions: 5,
    includeCategories: ['urgent', 'opportunity', 'relationship', 'surprise'] as AISuggestion['category'][],
    minScore: 0.5
  })
  
  const { customers, visits, loadCustomers, loadVisits } = useCustomerStore()
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 認証チェック
        checkAuth()
        
        // セキュリティ機能の初期化
        await initSecurityFeatures()
        
        // 自動バックアップの初期化
        await initAutoBackup()
        
        // データの読み込み
        await Promise.all([
          loadCustomers(),
          loadVisits()
        ])
        
        // 通知スケジューラーの初期化（データ読み込み後）
        initNotificationScheduler(() => customers)
      } catch (error) {
        console.error('App initialization error:', error)
        showToast('error', 'アプリの初期化に失敗しました')
      }
    }
    
    initializeApp()
  }, [])

  // 統計情報を計算
  const stats = useMemo(() => {
    return calculateStats(customers, visits, statsPeriod)
  }, [visits, customers, statsPeriod])

  const suggestions = useMemoizedAISuggestions(customers, visits, aiSettings)

  // 認証されていない場合は認証画面を表示
  if (!isAuthenticated) {
    return <AuthScreen />
  }

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
          <UltrathinkDashboard stats={stats} period={statsPeriod} onPeriodChange={setStatsPeriod}>
            <div className="space-y-6">
              {/* Settings Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setShowAISettings(true)}
                  className="ultra-btn"
                >
                  AI設定
                </button>
                <button
                  onClick={() => setShowDataManagement(true)}
                  className="ultra-btn"
                >
                  データ管理
                </button>
                <button
                  onClick={() => setShowNotificationSettings(true)}
                  className="ultra-btn"
                >
                  通知設定
                </button>
                <button
                  onClick={() => setShowSecuritySettings(true)}
                  className="ultra-btn"
                >
                  セキュリティ
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
                      onCustomerClick={(customer) => {
              console.log('Customer clicked:', customer)
              if (!customer.id) {
                console.error('Customer has no ID:', customer)
                showToast('error', '顧客IDが見つかりません')
                return
              }
              setSelectedCustomer(customer)
            }}
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
            onCustomerClick={(customer) => {
              console.log('Customer clicked:', customer)
              if (!customer.id) {
                console.error('Customer has no ID:', customer)
                showToast('error', '顧客IDが見つかりません')
                return
              }
              setSelectedCustomer(customer)
            }}
          />
        )}

        {/* Sales Table */}
        {activeTab === 'sales' && (
          <UltrathinkSalesTable
            visits={visits}
            customers={customers}
            onCustomerClick={(customer) => {
              console.log('Customer clicked:', customer)
              if (!customer.id) {
                console.error('Customer has no ID:', customer)
                showToast('error', '顧客IDが見つかりません')
                return
              }
              setSelectedCustomer(customer)
            }}
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

      {selectedCustomer && selectedCustomer.id && (
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

      {showEditForm && selectedCustomer && selectedCustomer.id && (
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

      {/* 通知設定 */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}

      {/* セキュリティ設定 */}
      {showSecuritySettings && (
        <SecuritySettings onClose={() => setShowSecuritySettings(false)} />
      )}

      <ToastContainer />
    </>
  )
}

export default App