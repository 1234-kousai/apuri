import { HomeIcon, UsersIcon, ChartIcon } from './ui/Icons'

interface LuxuryNavigationProps {
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
}

export function LuxuryNavigation({ activeTab, onTabChange }: LuxuryNavigationProps) {
  const tabs = [
    { id: 'home' as const, label: 'ホーム', icon: HomeIcon },
    { id: 'customers' as const, label: '顧客', icon: UsersIcon },
    { id: 'sales' as const, label: '売上', icon: ChartIcon }
  ]

  return (
    <nav className="flex items-center">
      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-6 py-2.5 rounded-xl
                font-medium text-sm tracking-wide uppercase
                transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f9e4aa] text-black shadow-lg shadow-[#d4af37]/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={16} />
                <span className="hidden lg:inline">{tab.label}</span>
              </span>
              
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f9e4aa] opacity-20 blur-md" />
              )}
            </button>
          )
        })}
      </div>

      {/* Mobile Navigation - Premium Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <div className="mx-4 mb-4">
          <div className="p-2 rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-around">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                      relative flex-1 py-3 px-4 rounded-2xl
                      transition-all duration-300 ease-out
                      ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                    `}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className={`
                        p-2 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-br from-[#d4af37] to-[#f9e4aa] shadow-lg' 
                          : 'bg-white/5'
                        }
                      `}>
                        <Icon 
                          size={20} 
                          className={isActive ? 'text-black' : 'text-gray-400'}
                        />
                      </div>
                      <span className={`
                        text-xs font-medium tracking-wide
                        ${isActive ? 'text-[#d4af37]' : 'text-gray-500'}
                      `}>
                        {tab.label}
                      </span>
                    </div>
                    
                    {isActive && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f9e4aa]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}