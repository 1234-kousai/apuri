import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { InstallPrompt } from './components/InstallPrompt'
import { CustomerForm } from './components/CustomerForm'
import { CustomerList } from './components/CustomerList'
import { ToastContainer } from './components/Toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { HomeIcon, UsersIcon, ChartIcon, PlusIcon } from './components/ui/Icons'
import { Button } from './components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card'

// 遅延読み込みコンポーネント
const CustomerDetail = lazy(() => import('./components/CustomerDetail').then(m => ({ default: m.CustomerDetail })))
const VisitForm = lazy(() => import('./components/VisitForm').then(m => ({ default: m.VisitForm })))
const CustomerEditForm = lazy(() => import('./components/CustomerEditForm').then(m => ({ default: m.CustomerEditForm })))
const EnhancedSuggestionCard = lazy(() => import('./components/EnhancedSuggestionCard').then(m => ({ default: m.EnhancedSuggestionCard })))
const AISettings = lazy(() => import('./components/AISettings').then(m => ({ default: m.AISettings })))

import { useCustomerStore } from './stores/customerStore'
import type { Customer } from './lib/db'
import { getEnhancedSuggestions } from './lib/ai-enhanced'
import type { AISuggestion } from './lib/ai-enhanced'
import { formatCurrency } from './utils/format'

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
  
  const { customers, visits, isLoading, loadCustomers, loadVisits } = useCustomerStore()

  useEffect(() => {
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
    
    return {
      totalRevenue,
      visitCount: thisMonthVisits.length,
      monthlyPrediction,
      daysPassed
    }
  }, [visits])

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Cast AI</h1>
              <p className="text-sm text-neutral-500 mt-0.5">キャスト営業支援システム</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-500">
                {new Date().toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="p-6 max-w-7xl mx-auto">
            {/* クイックアクション */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => setShowCustomerForm(true)}
                className="h-24 flex flex-col items-center justify-center space-y-2"
              >
                <PlusIcon size={24} className="text-primary-500" />
                <span className="text-sm">新規顧客登録</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPreSelectedCustomerId(undefined)
                  setShowVisitForm(true)
                }}
                className="h-24 flex flex-col items-center justify-center space-y-2"
              >
                <CalendarIcon size={24} className="text-secondary-500" />
                <span className="text-sm">来店記録</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('customers')}
                className="h-24 flex flex-col items-center justify-center space-y-2"
              >
                <UsersIcon size={24} className="text-info" />
                <span className="text-sm">顧客一覧</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('sales')}
                className="h-24 flex flex-col items-center justify-center space-y-2"
              >
                <ChartIcon size={24} className="text-success" />
                <span className="text-sm">売上分析</span>
              </Button>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">今月の売上</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(monthlyStats.totalRevenue)}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {monthlyStats.visitCount}件の来店
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">売上予測</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-secondary-600">
                    {formatCurrency(monthlyStats.monthlyPrediction)}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    過去{monthlyStats.daysPassed}日間の実績から算出
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">顧客数</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-info">
                    {customers.length}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    アクティブな顧客
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 今日の提案セクション */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">今日の営業提案</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAISettings(true)}
                >
                  <SettingsIcon size={16} className="mr-2" />
                  AI設定
                </Button>
              </div>
              <div className="space-y-4">
                {customers.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-neutral-500 mb-4">顧客データがありません</p>
                      <Button onClick={() => setShowCustomerForm(true)}>
                        最初の顧客を登録
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Suspense fallback={<LoadingSpinner />}>
                    {useMemo(() => getEnhancedSuggestions(customers, visits, aiSettings), [customers, visits, aiSettings]).map((suggestion) => (
                      <EnhancedSuggestionCard
                        key={suggestion.customer.id}
                        suggestion={suggestion}
                        onCustomerClick={(customer) => setSelectedCustomer(customer)}
                        onActionClick={(customer, action) => {
                          if (action.type === 'contact') {
                            if (customer.phone) {
                              window.location.href = `tel:${customer.phone}`
                            } else if (customer.lineId) {
                              window.open(`https://line.me/R/ti/p/${customer.lineId}`, '_blank')
                            }
                          } else {
                            // 他のアクションタイプの処理
                            setSelectedCustomer(customer)
                          }
                        }}
                      />
                    ))}
                  </Suspense>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">顧客一覧</h2>
                <p className="text-sm text-neutral-500 mt-0.5">全{customers.length}名の顧客</p>
              </div>
              <Button
                onClick={() => setShowCustomerForm(true)}
                size="sm"
              >
                <PlusIcon size={16} className="mr-2" />
                新規登録
              </Button>
            </div>
            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <LoadingSpinner />
                </CardContent>
              </Card>
            ) : (
              <CustomerList 
                customers={customers} 
                onCustomerClick={(customer) => setSelectedCustomer(customer)}
              />
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">売上記録</h2>
                <p className="text-sm text-neutral-500 mt-0.5">直近の来店履歴</p>
              </div>
              <Button
                onClick={() => {
                  setPreSelectedCustomerId(undefined)
                  setShowVisitForm(true)
                }}
                size="sm"
              >
                <PlusIcon size={16} className="mr-2" />
                来店記録
              </Button>
            </div>
            {visits.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-neutral-500 mb-4">売上データがありません</p>
                  <Button
                    onClick={() => {
                      setPreSelectedCustomerId(undefined)
                      setShowVisitForm(true)
                    }}
                  >
                    最初の来店を記録
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {visits
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((visit) => {
                    const customer = customers.find(c => c.id === visit.customerId)
                    return (
                      <Card key={visit.id} variant="elevated" className="hover:shadow-large transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-neutral-900">
                                {customer?.name || '不明な顧客'}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {new Date(visit.date).toLocaleDateString('ja-JP')}
                              </p>
                              {visit.memo && (
                                <p className="text-sm text-neutral-600 mt-2">{visit.memo}</p>
                              )}
                            </div>
                            <p className="text-xl font-semibold text-primary-600">
                              {formatCurrency(visit.revenue)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="bg-white border-t border-neutral-200">
        <div className="grid grid-cols-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'home' 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <HomeIcon size={24} />
            <span className="text-xs font-medium">ホーム</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'customers' 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <UsersIcon size={24} />
            <span className="text-xs font-medium">顧客</span>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'sales' 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <ChartIcon size={24} />
            <span className="text-xs font-medium">売上</span>
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

      {/* 顧客詳細 */}
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

      {/* 顧客編集フォーム */}
      {showEditForm && selectedCustomer && (
        <Suspense fallback={<LoadingSpinner />}>
          <CustomerEditForm
            customer={selectedCustomer}
            onClose={() => setShowEditForm(false)}
          />
        </Suspense>
      )}
      
      {/* AI設定 */}
      {showAISettings && (
        <Suspense fallback={<LoadingSpinner />}>
          <AISettings
            settings={aiSettings}
            onClose={() => setShowAISettings(false)}
            onSave={(newSettings) => setAISettings(newSettings)}
          />
        </Suspense>
      )}

      {/* Toast通知 */}
      <ToastContainer />
    </div>
  )
}

function SettingsIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 1v6m0 6v6m11-7h-6m-6 0H1m20.2-2.2l-4.3 4.3m-9.8 0L2.8 8.8m0 6.4l4.3 4.3m9.8 0l4.3-4.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="8"
        y1="2"
        x2="8"
        y2="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default App