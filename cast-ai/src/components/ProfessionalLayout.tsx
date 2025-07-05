import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { HomeIcon, UsersIcon, ChartIcon, PlusIcon, SettingsIcon, MenuIcon, XIcon } from './ui/Icons'

interface ProfessionalLayoutProps {
  children: ReactNode
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
  onNewCustomer: () => void
  onNewVisit: () => void
  onSettings?: () => void
}

export function ProfessionalLayout({ 
  children, 
  activeTab, 
  onTabChange,
  onNewCustomer,
  onNewVisit,
  onSettings
}: ProfessionalLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'home' as const, label: 'ホーム', icon: HomeIcon },
    { id: 'customers' as const, label: '顧客', icon: UsersIcon },
    { id: 'sales' as const, label: '売上', icon: ChartIcon }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Desktop & Mobile */}
      <header className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'bg-white/80 backdrop-blur-md'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl lg:text-2xl">C</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">CAST AI</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Customer Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`
                      relative px-6 py-3 rounded-xl font-medium text-sm
                      transition-all duration-300 transform
                      ${isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full" />
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={onNewVisit}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                来店記録
              </button>
              <button
                onClick={onNewCustomer}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <span className="flex items-center gap-2">
                  <PlusIcon size={16} />
                  <span>新規顧客</span>
                </span>
              </button>
              {onSettings && (
                <button
                  onClick={onSettings}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <SettingsIcon size={20} />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl
          transition-all duration-300 transform origin-top
          ${isMobileMenuOpen 
            ? 'opacity-100 scale-y-100' 
            : 'opacity-0 scale-y-0 pointer-events-none'
          }
        `}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`
                    w-full px-4 py-3 rounded-xl font-medium text-left
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </span>
                </button>
              )
            })}
            
            <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  onNewVisit()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-left"
              >
                来店記録を追加
              </button>
              <button
                onClick={() => {
                  onNewCustomer()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md"
              >
                <span className="flex items-center gap-2 justify-center">
                  <PlusIcon size={18} />
                  <span>新規顧客登録</span>
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20 min-h-screen">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex flex-col items-center gap-1 py-2 px-3 rounded-xl
                  transition-all duration-300
                  ${isActive 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <Icon size={22} className={isActive ? 'scale-110' : ''} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}