import { HomeIcon, UsersIcon, ChartIcon } from './ui/Icons'
import { useState } from 'react'

interface HeaderNavigationProps {
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
}

export function HeaderNavigation({ activeTab, onTabChange }: HeaderNavigationProps) {
  const [hoverTab, setHoverTab] = useState<string | null>(null)
  
  const tabs = [
    { id: 'home' as const, label: 'ホーム', icon: HomeIcon, color: 'from-violet-600 to-purple-600' },
    { id: 'customers' as const, label: '顧客', icon: UsersIcon, color: 'from-emerald-600 to-green-600' },
    { id: 'sales' as const, label: '売上', icon: ChartIcon, color: 'from-amber-600 to-orange-600' },
  ]
  
  return (
    <nav className="flex items-center gap-3">
      {/* デスクトップ版 - ピル型ナビゲーション */}
      <div className="hidden sm:flex relative items-center bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/20 shadow-lg">
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
          const isHovered = hoverTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onMouseEnter={() => setHoverTab(tab.id)}
              onMouseLeave={() => setHoverTab(null)}
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
              <Icon 
                size={18} 
                className={`
                  transition-all duration-300
                  ${isActive || isHovered ? 'scale-110' : ''}
                `}
              />
              <span className={`
                text-sm font-semibold transition-all duration-300
                ${isActive ? 'opacity-100' : 'opacity-80'}
              `}>
                {tab.label}
              </span>
              
              {/* ホバーエフェクト */}
              {!isActive && isHovered && (
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${tab.color} opacity-20 blur-xl`} />
              )}
            </button>
          )
        })}
      </div>
      
      {/* モバイル版 - アイコンのみ */}
      <div className="flex sm:hidden items-center gap-1 bg-black/30 backdrop-blur-xl rounded-2xl p-1 border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center justify-center w-11 h-11 rounded-xl
                transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-secondary-600 text-white shadow-lg' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }
              `}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                size={20} 
                className={`
                  transition-all duration-300
                  ${isActive ? 'scale-110' : ''}
                `}
              />
              
              {/* アクティブドット */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* ステータスインジケーター */}
      <div className="hidden lg:flex items-center gap-3 ml-3">
        <div className="w-px h-8 bg-white/20" />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">オンライン</span>
        </div>
      </div>
    </nav>
  )
}