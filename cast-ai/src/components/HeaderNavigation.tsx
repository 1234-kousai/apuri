import { HomeIcon, UsersIcon, ChartIcon } from './ui/Icons'

interface HeaderNavigationProps {
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
}

export function HeaderNavigation({ activeTab, onTabChange }: HeaderNavigationProps) {
  const tabs = [
    { id: 'home' as const, label: 'ホーム', icon: HomeIcon },
    { id: 'customers' as const, label: '顧客', icon: UsersIcon },
    { id: 'sales' as const, label: '売上', icon: ChartIcon },
  ]
  
  return (
    <>
      {/* モバイル版 - 横スクロール可能なタブ */}
      <div className="sm:hidden flex items-center justify-center">
        <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center justify-center px-4 py-2 rounded-lg
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-secondary-600 text-white shadow-lg' 
                    : 'text-neutral-400 hover:text-white'
                  }
                `}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} />
                <span className={`ml-1.5 text-xs font-medium ${isActive ? 'block' : 'hidden'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* デスクトップ版 - フルラベル表示 */}
      <nav className="hidden sm:flex items-center">
        <div className="relative flex items-center bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/20 shadow-lg">
          {/* アクティブインジケーター */}
          <div 
            className="absolute h-10 bg-gradient-to-r from-purple-600 to-secondary-600 rounded-full transition-all duration-300 shadow-lg"
            style={{
              width: `${100 / tabs.length}%`,
              left: `${(tabs.findIndex(t => t.id === activeTab) * 100) / tabs.length}%`,
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
                  relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full
                  transition-all duration-300
                  ${isActive 
                    ? 'text-white' 
                    : 'text-neutral-300 hover:text-white'
                  }
                `}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}