import { useState, useEffect } from 'react'
import { InstallPrompt } from './components/InstallPrompt'
import { CustomerForm } from './components/CustomerForm'
import { CustomerList } from './components/CustomerList'
import { useCustomerStore } from './stores/customerStore'

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'customers' | 'sales'>('home')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  
  const { customers, isLoading, loadCustomers } = useCustomerStore()

  useEffect(() => {
    loadCustomers()
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
                {/* プレースホルダーカード */}
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500 text-center">顧客データがありません</p>
                </div>
              </div>
            </section>

            {/* 売上サマリー */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">今月の売上</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-2xl font-bold text-gray-800">¥0</p>
                <p className="text-sm text-gray-500">0件の来店</p>
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
                onCustomerClick={(customer) => console.log('Customer clicked:', customer)}
              />
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">売上記録</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500 text-center">売上データがありません</p>
            </div>
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
    </div>
  )
}

export default App
