import { HomeIcon, UsersIcon, ChartIcon } from './ui/Icons'
import { useState } from 'react'

interface HeaderNavigationProps {
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
}

export function HeaderNavigation({ activeTab, onTabChange }: HeaderNavigationProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  
  const tabs = [
    { 
      id: 'home' as const, 
      label: 'ホーム', 
      icon: HomeIcon,
      gradient: 'from-violet-600 to-indigo-600',
      shadow: 'shadow-violet-500/30'
    },
    { 
      id: 'customers' as const, 
      label: '顧客', 
      icon: UsersIcon,
      gradient: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/30'
    },
    { 
      id: 'sales' as const, 
      label: '売上', 
      icon: ChartIcon,
      gradient: 'from-amber-600 to-orange-600',
      shadow: 'shadow-amber-500/30'
    },
  ]
  
  return (
    <>
      {/* モバイル版 - プレミアムグラスモーフィズムデザイン */}
      <div className="sm:hidden w-full flex justify-center">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl rounded-2xl p-1.5 border border-white/10 shadow-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isHovered = hoveredTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                onTouchStart={() => setHoveredTab(tab.id)}
                onTouchEnd={() => setHoveredTab(null)}
                className={`
                  relative flex flex-col items-center justify-center
                  w-20 h-16 rounded-xl
                  transition-all duration-300 transform
                  ${isActive 
                    ? 'scale-105' 
                    : 'scale-100 active:scale-95'
                  }
                `}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* アクティブ背景 */}
                {isActive && (
                  <div className={`
                    absolute inset-0 rounded-xl
                    bg-gradient-to-br ${tab.gradient}
                    shadow-lg ${tab.shadow}
                    animate-pulse-slow
                  `} />
                )}
                
                {/* ホバー背景 */}
                {!isActive && isHovered && (
                  <div className="absolute inset-0 rounded-xl bg-white/10" />
                )}
                
                {/* コンテンツ */}
                <div className={`
                  relative z-10 flex flex-col items-center gap-1
                  ${isActive ? 'text-white' : 'text-neutral-400'}
                `}>
                  <Icon 
                    size={22} 
                    className={`
                      transition-all duration-300
                      ${isActive ? 'drop-shadow-lg' : ''}
                    `}
                  />
                  <span className={`
                    text-[10px] font-bold tracking-wide
                    ${isActive ? 'opacity-100' : 'opacity-60'}
                  `}>
                    {tab.label}
                  </span>
                </div>
                
                {/* グロウエフェクト */}
                {isActive && (
                  <div className={`
                    absolute inset-0 rounded-xl
                    bg-gradient-to-br ${tab.gradient}
                    blur-xl opacity-50
                    animate-pulse-slow
                  `} />
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* デスクトップ版 - ラグジュアリーピルデザイン */}
      <nav className="hidden sm:flex items-center">
        <div className="relative">
          {/* 背景のグラデーション */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-secondary-600/20 rounded-full blur-xl" />
          
          {/* メインコンテナ */}
          <div className="relative flex items-center gap-1 bg-black/20 backdrop-blur-2xl rounded-full p-1.5 border border-white/20 shadow-2xl">
            {/* アクティブインジケーター */}
            <div 
              className={`
                absolute h-12 rounded-full
                bg-gradient-to-r ${tabs.find(t => t.id === activeTab)?.gradient}
                shadow-lg ${tabs.find(t => t.id === activeTab)?.shadow}
                transition-all duration-500 ease-out
              `}
              style={{
                width: `${100 / tabs.length - 2}%`,
                left: `${(tabs.findIndex(t => t.id === activeTab) * 100) / tabs.length + 1}%`,
              }}
            />
            
            {/* タブボタン */}
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isHovered = hoveredTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`
                    relative z-10 flex items-center gap-2.5
                    px-6 py-3 rounded-full
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
                    size={20} 
                    className={`
                      transition-all duration-300
                      ${isActive || isHovered ? 'scale-110' : 'scale-100'}
                      ${isActive ? 'drop-shadow-lg' : ''}
                    `}
                  />
                  <span className={`
                    text-sm font-bold tracking-wide
                    transition-all duration-300
                    ${isActive ? 'opacity-100' : 'opacity-80'}
                  `}>
                    {tab.label}
                  </span>
                  
                  {/* ホバーエフェクト */}
                  {!isActive && isHovered && (
                    <div className={`
                      absolute inset-0 rounded-full
                      bg-gradient-to-r ${tab.gradient} opacity-10
                      animate-pulse
                    `} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}