import { HomeIcon, UsersIcon, ChartIcon } from './ui/Icons'

interface HeaderNavigationProps {
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
}

export function HeaderNavigation({ activeTab, onTabChange }: HeaderNavigationProps) {
  const tabs = [
    { 
      id: 'home' as const, 
      label: 'Home', 
      japaneseLabel: 'ホーム',
      icon: HomeIcon,
    },
    { 
      id: 'customers' as const, 
      label: 'Customers',
      japaneseLabel: '顧客', 
      icon: UsersIcon,
    },
    { 
      id: 'sales' as const, 
      label: 'Sales',
      japaneseLabel: '売上', 
      icon: ChartIcon,
    },
  ]

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
  
  return (
    <>
      {/* モバイル版 - Apple風フローティングナビゲーション */}
      <div className="sm:hidden fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="relative flex items-center gap-1 p-2 bg-white/10 backdrop-blur-2xl rounded-[28px] border border-white/20 shadow-2xl">
          {/* 背景のスライダー */}
          <div
            className="absolute h-14 w-14 bg-white rounded-[20px] shadow-lg transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${activeIndex * 60 + 8}px)`,
            }}
          />
          
          {/* タブボタン */}
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative z-10 w-14 h-14 flex items-center justify-center rounded-[20px] transition-colors duration-200"
                aria-label={tab.japaneseLabel}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon 
                  size={24} 
                  className={`
                    transition-all duration-200
                    ${isActive ? 'text-black' : 'text-white/70'}
                  `}
                />
              </button>
            )
          })}
        </div>
      </div>
      
      {/* デスクトップ版 - Stripe風タブナビゲーション */}
      <nav className="hidden sm:block">
        <div className="relative">
          {/* 背景 */}
          <div className="flex items-center p-1.5 bg-black/30 backdrop-blur-2xl rounded-2xl border border-white/10">
            {/* アクティブ背景 */}
            <div
              className="absolute h-10 bg-white rounded-xl shadow-xl transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${activeIndex * 128 + 6}px)`,
                width: '120px',
              }}
            />
            
            {/* タブボタン */}
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    relative z-10 flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl
                    font-semibold text-[13px] tracking-wide transition-all duration-200
                    w-32
                    ${isActive 
                      ? 'text-black' 
                      : 'text-white/60 hover:text-white/90'
                    }
                  `}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="uppercase">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}