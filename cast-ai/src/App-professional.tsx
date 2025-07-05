import { useState, useEffect, lazy, Suspense } from 'react'
import { InstallPrompt } from './components/InstallPrompt'
import { CustomerForm } from './components/CustomerForm'
import { ToastContainer } from './components/Toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ProfessionalLayout } from './components/ProfessionalLayout'
import { ProfessionalDashboard } from './components/ProfessionalDashboard'
import { ProfessionalCustomerList } from './components/ProfessionalCustomerList'
import { ProfessionalSalesTable } from './components/ProfessionalSalesTable'

// 遅延読み込みコンポーネント
const CustomerDetail = lazy(() => import('./components/CustomerDetail').then(m => ({ default: m.CustomerDetail })))
const VisitForm = lazy(() => import('./components/VisitForm').then(m => ({ default: m.VisitForm })))
const CustomerEditForm = lazy(() => import('./components/CustomerEditForm').then(m => ({ default: m.CustomerEditForm })))
const AISettings = lazy(() => import('./components/AISettings').then(m => ({ default: m.AISettings })))

import { useCustomerStore } from './stores/customerStore'
import type { Customer } from './lib/db'
import type { AISuggestion } from './lib/ai-enhanced'
// import { useMemoizedAISuggestions } from './hooks/useMemoizedAISuggestions' // 将来の拡張用
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
  const [aiSettings, setAISettings] = useState({
    maxSuggestions: 5,
    includeCategories: ['urgent', 'opportunity', 'relationship', 'surprise'] as AISuggestion['category'][],
    minScore: 0.5
  })
  
  const { customers, visits, loadCustomers, loadVisits } = useCustomerStore()

  useEffect(() => {
    loadCustomers()
    loadVisits()
  }, [])

  // 今月の統計情報を計算（現在は使用されていないが、将来のダッシュボード用）
  // const monthlyStats = useMemo(() => {
  //   const now = new Date()
  //   const thisMonthVisits = visits.filter(v => {
  //     const visitDate = new Date(v.date)
  //     return visitDate.getMonth() === now.getMonth() && 
  //            visitDate.getFullYear() === now.getFullYear()
  //   })
  //   const totalRevenue = thisMonthVisits.reduce((sum, v) => sum + v.revenue, 0)
  //   
  //   // 売上予測の計算
  //   const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  //   const daysPassed = now.getDate()
  //   const dailyAverage = daysPassed > 0 ? totalRevenue / daysPassed : 0
  //   const monthlyPrediction = Math.round(dailyAverage * daysInMonth)
  //   
  //   // 平均来店頻度
  //   const avgFrequency = customers.length > 0 ? Math.round(visits.length / customers.length) : 0
  //   
  //   return {
  //     totalRevenue,
  //     visitCount: thisMonthVisits.length,
  //     monthlyPrediction,
  //     daysPassed,
  //     customerCount: customers.length,
  //     avgFrequency
  //   }
  // }, [visits, customers])

  // AI提案機能（現在は使用されていないが、将来のダッシュボード用）
  // const suggestions = useMemoizedAISuggestions(customers, visits, aiSettings)

  return (
    <>
      <SkipLink />
      <GlobalLoading />
      
      <ProfessionalLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewCustomer={() => setShowCustomerForm(true)}
        onNewVisit={() => {
          setPreSelectedCustomerId(undefined)
          setShowVisitForm(true)
        }}
      >
        {/* Home Dashboard */}
        {activeTab === 'home' && <ProfessionalDashboard />}

        {/* Customers List */}
        {activeTab === 'customers' && <ProfessionalCustomerList />}

        {/* Sales Table */}
        {activeTab === 'sales' && <ProfessionalSalesTable />}
      </ProfessionalLayout>

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

      <ToastContainer />
    </>
  )
}

export default App