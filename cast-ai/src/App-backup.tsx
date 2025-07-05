import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { InstallPrompt } from './components/InstallPrompt'
import { CustomerForm } from './components/CustomerForm'
import { CustomerList } from './components/CustomerList'
import { ToastContainer } from './components/Toast'
import { LoadingSpinner } from './components/LoadingSpinner'
import { SkeletonLoader } from './components/SkeletonLoader'
import { UsersIcon, ChartIcon, PlusIcon, CalendarIcon, SettingsIcon } from './components/ui/Icons'
import { LuxuryButton } from './components/LuxuryButton'
import { LuxuryCard, LuxuryCardContent } from './components/LuxuryCard'
import { AnimatedCounter } from './components/ui/AnimatedCounter'
import { FAB } from './components/ui/FAB'
import { LuxuryTable, LuxuryTableHeader, LuxuryTableBody, LuxuryTableRow, LuxuryTableCell, LuxuryTableHeaderCell } from './components/LuxuryTable'

// 遅延読み込みコンポーネント
const CustomerDetail = lazy(() => import('./components/CustomerDetail').then(m => ({ default: m.CustomerDetail })))
const VisitForm = lazy(() => import('./components/VisitForm').then(m => ({ default: m.VisitForm })))
const CustomerEditForm = lazy(() => import('./components/CustomerEditForm').then(m => ({ default: m.CustomerEditForm })))
const LuxurySuggestionCard = lazy(() => import('./components/LuxurySuggestionCard').then(m => ({ default: m.LuxurySuggestionCard })))
const AISettings = lazy(() => import('./components/AISettings').then(m => ({ default: m.AISettings })))

import { useCustomerStore } from './stores/customerStore'
import type { Customer } from './lib/db'
import type { AISuggestion } from './lib/ai-enhanced'
import { useMemoizedAISuggestions } from './hooks/useMemoizedAISuggestions'
import { formatCurrency } from './utils/format'
import { SkipLink } from './components/SkipLink'
import { GlobalLoading } from './components/GlobalLoading'
import { LuxuryNavigation } from './components/LuxuryNavigation'
import { LuxuryStatCard } from './components/LuxuryStatCard'

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
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      <SkipLink />
      <GlobalLoading />
      {/* ヘッダー */}
      <header className="relative z-30 pt-safe flex-shrink-0">
        <div className="absolute inset-0 luxury-glass-dark" />
        <div className="relative px-6 sm:px-8 py-4 sm:py-6">
          {/* モバイル版レイアウト */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              {/* ロゴとタイトル */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#f9e4aa] flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
                  <span className="text-black font-light text-lg font-poppins">C</span>
                </div>
                <h1 className="text-lg font-light text-white font-poppins tracking-wide">
                  CAST AI
                </h1>
              </div>
              {/* ユーザーアバター */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f9e4aa] flex items-center justify-center text-black font-light shadow-lg shadow-[#d4af37]/20">
                  {customers.length > 0 ? customers[0].name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
              </div>
            </div>
            {/* ナビゲーション（モバイル） */}
          </div>
          
          {/* モバイルナビゲーションをLuxuryNavigationに含める */}
          
          {/* デスクトップ版レイアウト */}
          <div className="hidden sm:flex items-center justify-between">
            {/* 左側: ロゴとタイトル */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f9e4aa] flex items-center justify-center shadow-xl shadow-[#d4af37]/30 transform hover:scale-105 transition-all duration-500 cursor-pointer">
                  <span className="text-black font-light text-2xl font-poppins">C</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-light text-white font-poppins tracking-wide luxury-heading">
                  CAST AI
                </h1>
                <p className="text-xs text-gray-500 font-normal tracking-[0.2em] uppercase">
                  Customer Management System
                </p>
              </div>
            </div>
            
            {/* 右側: ナビゲーションとアバター */}
            <div className="flex items-center gap-6">
              <LuxuryNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              
              {/* ユーザーアバター */}
              <div className="relative group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f9e4aa] flex items-center justify-center text-black font-light shadow-xl shadow-[#d4af37]/30 transform group-hover:scale-110 transition-all duration-500">
                  {customers.length > 0 ? customers[0].name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main id="main-content" className="flex-1 overflow-y-auto relative z-10" tabIndex={-1}>
        <div className="min-h-full pb-24">
          {activeTab === 'home' && (
            <div className="p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto animate-fade-in">

            {/* 統計カード */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <LuxuryStatCard
                label="今月の売上"
                value={
                  <AnimatedCounter 
                    value={monthlyStats.totalRevenue} 
                    prefix="¥" 
                    separator=","
                    className="text-3xl font-light text-white"
                  />
                }
                change="+24.5%"
                trend="up"
                icon={<ChartIcon size={20} />}
                delay={0.1}
              />
              
              <LuxuryStatCard
                label="売上予測"
                value={
                  <AnimatedCounter 
                    value={monthlyStats.monthlyPrediction} 
                    prefix="¥" 
                    separator=","
                    className="text-3xl font-light text-white"
                  />
                }
                change={`${monthlyStats.daysPassed}日経過`}
                trend="neutral"
                icon={<ChartIcon size={20} />}
                delay={0.2}
              />
              
              <LuxuryStatCard
                label="顧客数"
                value={
                  <AnimatedCounter 
                    value={customers.length} 
                    suffix="名"
                    className="text-3xl font-light text-white"
                  />
                }
                change="+5 今月"
                trend="up"
                icon={<UsersIcon size={20} />}
                delay={0.3}
              />
              
              <LuxuryStatCard
                label="平均来店頻度"
                value={
                  <div className="text-3xl font-light text-white">
                    {visits.length > 0 ? Math.round(visits.length / customers.length) : 0}
                    <span className="text-lg font-normal text-gray-400">回/月</span>
                  </div>
                }
                change="高頻度維持中"
                trend="neutral"
                icon={<CalendarIcon size={20} />}
                delay={0.4}
              />
            </div>

            {/* 今日の提案セクション */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">今日の営業提案</h2>
                  <p className="text-sm text-neutral-400">AIが分析した優先度の高いアクション</p>
                </div>
                <LuxuryButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAISettings(true)}
                  className="hidden sm:flex"
                  icon={<SettingsIcon size={16} />}
                >
                  AI設定
                </LuxuryButton>
              </div>
              <div className="space-y-4">
                {customers.length === 0 ? (
                  <LuxuryCard variant="glass">
                    <LuxuryCardContent className="text-center py-16">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d4af37]/10 to-[#f9e4aa]/10 flex items-center justify-center mx-auto mb-6">
                        <UsersIcon size={40} className="text-[#d4af37]" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">顧客データがありません</h3>
                      <p className="text-neutral-300 mb-6">最初の顧客を登録してください</p>
                      <LuxuryButton
                        variant="primary"
                        onClick={() => setShowCustomerForm(true)}
                        icon={<PlusIcon size={20} />}
                        glow
                      >
                        顧客を登録する
                      </LuxuryButton>
                    </LuxuryCardContent>
                  </LuxuryCard>
                ) : (
                  <Suspense fallback={<LoadingSpinner />}>
                    {useMemoizedAISuggestions(customers, visits, aiSettings).map((suggestion) => (
                      <LuxurySuggestionCard
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
            <div className="p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">顧客一覧</h2>
                <p className="text-sm text-neutral-400">全{customers.length}名の顧客</p>
              </div>
              <LuxuryButton
                onClick={() => setShowCustomerForm(true)}
                size="sm"
                variant="primary"
                icon={<PlusIcon size={16} />}
                glow
              >
                新規登録
              </LuxuryButton>
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
            <div className="p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">売上記録</h2>
                <p className="text-sm text-neutral-400">直近の来店履歴</p>
              </div>
              <LuxuryButton
                onClick={() => {
                  setPreSelectedCustomerId(undefined)
                  setShowVisitForm(true)
                }}
                size="sm"
                variant="dark"
                icon={<PlusIcon size={16} />}
              >
                来店記録
              </LuxuryButton>
            </div>
            {visits.length === 0 ? (
              <LuxuryCard variant="glass">
                <LuxuryCardContent className="text-center py-12">
                  <p className="text-neutral-300 mb-4">売上データがありません</p>
                  <LuxuryButton
                    variant="primary"
                    onClick={() => {
                      setPreSelectedCustomerId(undefined)
                      setShowVisitForm(true)
                    }}
                    glow
                  >
                    最初の来店を記録
                  </LuxuryButton>
                </LuxuryCardContent>
              </LuxuryCard>
            ) : (
              <LuxuryCard variant="glass">
                <LuxuryCardContent className="p-0" padded={false}>
                  <LuxuryTable>
                    <LuxuryTableHeader>
                      <LuxuryTableRow>
                        <LuxuryTableHeaderCell>顧客名</LuxuryTableHeaderCell>
                        <LuxuryTableHeaderCell>日付</LuxuryTableHeaderCell>
                        <LuxuryTableHeaderCell>メモ</LuxuryTableHeaderCell>
                        <LuxuryTableHeaderCell align="right">売上</LuxuryTableHeaderCell>
                      </LuxuryTableRow>
                    </LuxuryTableHeader>
                    <LuxuryTableBody>
                      {visits
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((visit) => {
                          const customer = customers.find(c => c.id === visit.customerId)
                          return (
                            <LuxuryTableRow 
                              key={visit.id}
                              onClick={() => customer && setSelectedCustomer(customer)}
                              className={`animate-list-item`}
                            >
                              <LuxuryTableCell className="font-medium text-white">
                                {customer?.name || '不明な顧客'}
                              </LuxuryTableCell>
                              <LuxuryTableCell>
                                {new Date(visit.date).toLocaleDateString('ja-JP')}
                              </LuxuryTableCell>
                              <LuxuryTableCell className="text-sm">
                                {visit.memo || '-'}
                              </LuxuryTableCell>
                              <LuxuryTableCell align="right" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f9e4aa]">
                                {formatCurrency(visit.revenue)}
                              </LuxuryTableCell>
                            </LuxuryTableRow>
                          )
                        })}
                    </LuxuryTableBody>
                  </LuxuryTable>
                </LuxuryCardContent>
              </LuxuryCard>
            )}
            </div>
          )}
        </div>
      </main>

      {/* モバイルナビゲーション */}
      <LuxuryNavigation activeTab={activeTab} onTabChange={setActiveTab} />

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