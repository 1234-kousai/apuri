import { HomeIcon, UsersIcon, ChartIcon } from './ui/Icons'

interface UltraModernNavigationProps {
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
}

export function UltraModernNavigation({ activeTab, onTabChange }: UltraModernNavigationProps) {
  const tabs = [
    { id: 'home' as const, label: 'ホーム', icon: HomeIcon },
    { id: 'customers' as const, label: '顧客', icon: UsersIcon },
    { id: 'sales' as const, label: '売上', icon: ChartIcon },
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pt-2">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent backdrop-blur-xl" />
      
      {/* Navigation container */}
      <div className="relative mx-4 mb-4 rounded-3xl bg-gradient-to-r from-neutral-900/90 to-neutral-800/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-around p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center justify-center
                  w-20 h-16 rounded-2xl
                  transition-all duration-300 transform
                  ${isActive 
                    ? 'scale-105' 
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }
                `}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-secondary-600/30 rounded-2xl blur-xl" />
                )}
                
                {/* Button content */}
                <div className={`
                  relative z-10 flex flex-col items-center gap-1
                  ${isActive ? 'text-white' : 'text-neutral-400'}
                `}>
                  {/* Icon container */}
                  <div className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-br from-purple-600 to-secondary-600 shadow-lg shadow-purple-600/30' 
                      : 'bg-neutral-800/50'
                    }
                  `}>
                    <Icon 
                      size={24} 
                      className={`
                        transition-all duration-300
                        ${isActive ? 'scale-110' : ''}
                      `}
                    />
                    
                    {/* Glow effect */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-secondary-600 opacity-50 blur-md" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`
                    text-xs font-medium transition-all duration-300
                    ${isActive ? 'opacity-100' : 'opacity-60'}
                  `}>
                    {tab.label}
                  </span>
                </div>
                
                {/* Ripple effect container */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-transparent" />
                  </div>
                )}
              </button>
            )
          })}
          
          {/* Sliding indicator */}
          <div 
            className="absolute bottom-0 h-1 bg-gradient-to-r from-purple-600 to-secondary-600 rounded-full transition-all duration-300 shadow-lg shadow-purple-600/50"
            style={{
              width: '60px',
              left: `${tabs.findIndex(t => t.id === activeTab) * 33.33 + 16.67}%`,
              transform: 'translateX(-50%)'
            }}
          />
        </div>
      </div>
      
      {/* Floating orbs for premium effect */}
      <div className="absolute -top-10 left-10 w-20 h-20 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -top-10 right-10 w-20 h-20 bg-secondary-600/20 rounded-full blur-3xl animate-pulse" />
    </nav>
  )
}