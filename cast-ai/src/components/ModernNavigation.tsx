import { useState, useRef, useEffect } from 'react'
import { HomeIcon, UsersIcon, ChartIcon } from './ui/Icons'

interface NavItem {
  id: 'home' | 'customers' | 'sales'
  icon: React.ReactNode
  label: string
}

interface ModernNavigationProps {
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
}

export function ModernNavigation({ activeTab, onTabChange }: ModernNavigationProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  
  const navItems: NavItem[] = [
    { id: 'home', icon: <HomeIcon size={24} />, label: 'ホーム' },
    { id: 'customers', icon: <UsersIcon size={24} />, label: '顧客' },
    { id: 'sales', icon: <ChartIcon size={24} />, label: '売上' },
  ]
  
  useEffect(() => {
    const activeButton = itemRefs.current[activeTab]
    if (activeButton && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      setIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      })
    }
  }, [activeTab])
  
  return (
    <nav className="relative bg-white/80 backdrop-blur-xl border-t border-neutral-200/50 pb-safe">
      <div ref={navRef} className="relative flex justify-around items-center">
        {/* スライドインジケーター */}
        <div
          className="absolute top-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
        
        {/* 光るエフェクト */}
        <div
          className="absolute top-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 blur-sm transition-all duration-500 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
        
        {navItems.map((item) => (
          <button
            key={item.id}
            ref={(el) => {
              itemRefs.current[item.id] = el
            }}
            onClick={() => onTabChange(item.id)}
            className={`
              relative py-3 px-8 flex flex-col items-center gap-1 
              transition-all duration-300 group touch-target
              ${activeTab === item.id ? 'text-primary-600' : 'text-neutral-500'}
            `}
            aria-label={`${item.label}へ移動`}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {/* アイコンコンテナ */}
            <div className={`
              relative transition-all duration-500
              ${activeTab === item.id ? 'transform -translate-y-1 scale-110' : 'group-hover:scale-110'}
            `}>
              {/* 背景グロー */}
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse" />
              )}
              
              {/* アイコン */}
              <div className="relative z-10">
                {item.icon}
              </div>
              
              {/* ホバーリング */}
              <div className={`
                absolute inset-0 rounded-full border-2 transition-all duration-300
                ${activeTab === item.id 
                  ? 'border-primary-500/50 scale-150 opacity-100' 
                  : 'border-neutral-300 scale-100 opacity-0 group-hover:opacity-100 group-hover:scale-125'
                }
              `} />
            </div>
            
            {/* ラベル */}
            <span className={`
              text-xs font-medium transition-all duration-300
              ${activeTab === item.id 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-70 transform translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0'
              }
            `}>
              {item.label}
            </span>
            
            {/* リップルエフェクト */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute inset-0 transform scale-0 bg-primary-500/10 rounded-full transition-transform duration-600 group-active:scale-150" />
            </div>
          </button>
        ))}
      </div>
    </nav>
  )
}