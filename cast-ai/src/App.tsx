import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { InstallPrompt } from './components/InstallPrompt'
import { CustomerForm } from './components/CustomerForm'
import { CustomerList } from './components/CustomerList'
import { ToastContainer } from './components/Toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { SkeletonLoader } from './components/SkeletonLoader'
import { UsersIcon, ChartIcon, PlusIcon, CalendarIcon, SettingsIcon } from './components/ui/Icons'
import { UltraPremiumButton } from './components/ui/UltraPremiumButton'
import { Card, CardContent } from './components/ui/Card'
import { UltraPremiumCard, UltraPremiumCardContent } from './components/ui/UltraPremiumCard'
import { AnimatedCounter, AnimatedProgressRing } from './components/ui/AnimatedCounter'
import { FAB } from './components/ui/FAB'
import { PremiumTable, PremiumTableHeader, PremiumTableBody, PremiumTableRow, PremiumTableCell, PremiumTableHeaderCell } from './components/ui/PremiumTable'

// 遅延読み込みコンポーネント
const CustomerDetail = lazy(() => import('./components/CustomerDetail').then(m => ({ default: m.CustomerDetail })))
const VisitForm = lazy(() => import('./components/VisitForm').then(m => ({ default: m.VisitForm })))
const CustomerEditForm = lazy(() => import('./components/CustomerEditForm').then(m => ({ default: m.CustomerEditForm })))
const EnhancedSuggestionCard = lazy(() => import('./components/EnhancedSuggestionCard').then(m => ({ default: m.EnhancedSuggestionCard })))
const AISettings = lazy(() => import('./components/AISettings').then(m => ({ default: m.AISettings })))

import { useCustomerStore } from './stores/customerStore'
import type { Customer } from './lib/db'
import type { AISuggestion } from './lib/ai-enhanced'
import { useMemoizedAISuggestions } from './hooks/useMemoizedAISuggestions'
import { formatCurrency } from './utils/format'
import { SkipLink } from './components/SkipLink'
import { GlobalLoading } from './components/GlobalLoading'
import { AnimatedBackground } from './components/AnimatedBackground'
import { ModernNavigation } from './components/ModernNavigation'

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
    <div className="flex flex-col h-screen-safe bg-neutral-50 relative">
      <AnimatedBackground />
      <SkipLink />
      <GlobalLoading />
      {/* ヘッダー */}
      <header className="nav-ultra-premium pt-safe relative z-10">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 via-purple-500 to-secondary-600 bg-clip-text text-transparent font-poppins">
                  Cast AI
                </h1>
                <p className="text-xs text-neutral-600 font-medium -mt-1">プレミアム顧客管理システム</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-neutral-500 font-medium">現在の日付</p>
                <p className="text-sm font-semibold text-neutral-700">
                  {new Date().toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-secondary-600 flex items-center justify-center text-white font-semibold shadow-lg">
                {customers.length > 0 ? customers[0].name.charAt(0) : 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main id="main-content" className="flex-1 overflow-y-auto scroll-smooth relative z-10" tabIndex={-1}>
        {activeTab === 'home' && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">

            {/* 統計カード */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <UltraPremiumCard variant="holographic" size="sm" hover="glow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">今月の売上</p>
                    <AnimatedCounter 
                      value={monthlyStats.totalRevenue} 
                      prefix="¥" 
                      separator=","
                      className="text-3xl font-bold"
                    />
                    <p className="text-xs text-neutral-500 mt-2">前月比 +24.5%</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white shadow-lg">
                    <ChartIcon size={24} />
                  </div>
                </div>
              </UltraPremiumCard>
              
              <UltraPremiumCard variant="glass" size="sm" hover="lift">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">売上予測</p>
                    <AnimatedCounter 
                      value={monthlyStats.monthlyPrediction} 
                      prefix="¥" 
                      separator=","
                      className="text-3xl font-bold metallic"
                    />
                    <p className="text-xs text-neutral-500 mt-2">{monthlyStats.daysPassed}日経過</p>
                  </div>
                  <AnimatedProgressRing 
                    value={(monthlyStats.daysPassed / 30) * 100} 
                    size={48}
                    strokeWidth={4}
                  />
                </div>
              </UltraPremiumCard>
              
              <UltraPremiumCard variant="neo" size="sm" hover="rotate">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">顧客数</p>
                    <AnimatedCounter 
                      value={customers.length} 
                      suffix="名"
                      className="text-3xl font-bold"
                    />
                    <p className="text-xs text-success mt-2">+5 今月</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                    <UsersIcon size={24} />
                  </div>
                </div>
              </UltraPremiumCard>
              
              <UltraPremiumCard variant="default" size="sm" hover="glow" glowColor="gradient">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">平均来店頻度</p>
                    <p className="text-3xl font-bold text-gradient">
                      {visits.length > 0 ? Math.round(visits.length / customers.length) : 0}
                      <span className="text-lg font-normal">回/月</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">高頻度維持中</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                    <CalendarIcon size={24} />
                  </div>
                </div>
              </UltraPremiumCard>
            </div>

            {/* 今日の提案セクション */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">今日の営業提案</h2>
                <UltraPremiumButton
                  variant="glass"
                  size="sm"
                  onClick={() => setShowAISettings(true)}
                  icon={<SettingsIcon size={18} />}
                >
                  AI設定
                </UltraPremiumButton>
              </div>
              <div className="space-y-4">
                {customers.length === 0 ? (
                  <UltraPremiumCard variant="glass">
                    <UltraPremiumCardContent className="text-center py-16">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-6">
                        <UsersIcon size={40} className="text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-800 mb-2">顧客データがありません</h3>
                      <p className="text-neutral-600 mb-6">最初の顧客を登録してください</p>
                      <UltraPremiumButton
                        variant="primary"
                        onClick={() => setShowCustomerForm(true)}
                        icon={<PlusIcon size={20} />}
                        glow
                      >
                        顧客を登録する
                      </UltraPremiumButton>
                    </UltraPremiumCardContent>
                  </UltraPremiumCard>
                ) : (
                  <Suspense fallback={<LoadingSpinner />}>
                    {useMemoizedAISuggestions(customers, visits, aiSettings).map((suggestion) => (
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
          <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">顧客一覧</h2>
                <p className="text-sm text-neutral-500 mt-0.5">全{customers.length}名の顧客</p>
              </div>
              <UltraPremiumButton
                onClick={() => setShowCustomerForm(true)}
                size="sm"
                variant="primary"
                icon={<PlusIcon size={16} />}
                glow
              >
                新規登録
              </UltraPremiumButton>
            </div>
            {isLoading ? (
              <SkeletonLoader type="card" count={3} />
            ) : (
              <CustomerList 
                customers={customers} 
                onCustomerClick={(customer) => setSelectedCustomer(customer)}
              />
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">売上記録</h2>
                <p className="text-sm text-neutral-500 mt-0.5">直近の来店履歴</p>
              </div>
              <UltraPremiumButton
                onClick={() => {
                  setPreSelectedCustomerId(undefined)
                  setShowVisitForm(true)
                }}
                size="sm"
                variant="gold"
                icon={<PlusIcon size={16} />}
              >
                来店記録
              </UltraPremiumButton>
            </div>
            {visits.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-neutral-500 mb-4">売上データがありません</p>
                  <UltraPremiumButton
                    variant="primary"
                    onClick={() => {
                      setPreSelectedCustomerId(undefined)
                      setShowVisitForm(true)
                    }}
                    glow
                  >
                    最初の来店を記録
                  </UltraPremiumButton>
                </CardContent>
              </Card>
            ) : (
              <UltraPremiumCard variant="glass">
                <UltraPremiumCardContent className="p-0" padded={false}>
                  <PremiumTable>
                    <PremiumTableHeader>
                      <PremiumTableRow>
                        <PremiumTableHeaderCell>顧客名</PremiumTableHeaderCell>
                        <PremiumTableHeaderCell>日付</PremiumTableHeaderCell>
                        <PremiumTableHeaderCell>メモ</PremiumTableHeaderCell>
                        <PremiumTableHeaderCell className="text-right">売上</PremiumTableHeaderCell>
                      </PremiumTableRow>
                    </PremiumTableHeader>
                    <PremiumTableBody>
                      {visits
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((visit) => {
                          const customer = customers.find(c => c.id === visit.customerId)
                          return (
                            <PremiumTableRow 
                              key={visit.id}
                              onClick={() => customer && setSelectedCustomer(customer)}
                              className={`animate-list-item`}
                            >
                              <PremiumTableCell className="font-medium">
                                {customer?.name || '不明な顧客'}
                              </PremiumTableCell>
                              <PremiumTableCell className="text-neutral-600">
                                {new Date(visit.date).toLocaleDateString('ja-JP')}
                              </PremiumTableCell>
                              <PremiumTableCell className="text-sm text-neutral-600">
                                {visit.memo || '-'}
                              </PremiumTableCell>
                              <PremiumTableCell className="text-right font-semibold text-gradient">
                                {formatCurrency(visit.revenue)}
                              </PremiumTableCell>
                            </PremiumTableRow>
                          )
                        })}
                    </PremiumTableBody>
                  </PremiumTable>
                </UltraPremiumCardContent>
              </UltraPremiumCard>
            )}
          </div>
        )}
      </main>

      {/* ボトムナビゲーション */}
      <ModernNavigation activeTab={activeTab} onTabChange={setActiveTab} />

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
      
      {/* Floating Action Button */}
      <FAB 
        options={[
          {
            icon: <PlusIcon size={20} />,
            label: '新規顧客登録',
            onClick: () => setShowCustomerForm(true),
            color: 'bg-gradient-to-br from-primary-500 to-primary-600'
          },
          {
            icon: <CalendarIcon size={20} />,
            label: '来店記録',
            onClick: () => {
              setPreSelectedCustomerId(undefined)
              setShowVisitForm(true)
            },
            color: 'bg-gradient-to-br from-secondary-500 to-secondary-600'
          }
        ]}
      />
    </div>
  )
}

export default App