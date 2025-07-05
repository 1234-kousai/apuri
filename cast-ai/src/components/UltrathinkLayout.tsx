import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { HomeIcon, UsersIcon, ChartIcon, PlusIcon } from './ui/Icons'

interface UltrathinkLayoutProps {
  children: ReactNode
  activeTab: 'home' | 'customers' | 'sales'
  onTabChange: (tab: 'home' | 'customers' | 'sales') => void
  onNewCustomer: () => void
  onNewVisit: () => void
}

export function UltrathinkLayout({ 
  children, 
  activeTab, 
  onTabChange,
  onNewCustomer,
  onNewVisit
}: UltrathinkLayoutProps) {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const navItems = [
    { id: 'home' as const, label: 'Dashboard', icon: HomeIcon },
    { id: 'customers' as const, label: 'Customers', icon: UsersIcon },
    { id: 'sales' as const, label: 'Revenue', icon: ChartIcon }
  ]

  return (
    <div className="ultrathink min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="ultra-nav w-80 min-h-screen flex flex-col">
        {/* Logo Section */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#9945ff] flex items-center justify-center">
              <span className="text-black font-thin text-2xl">C</span>
            </div>
            <div>
              <h1 className="text-2xl font-thin tracking-wide">CAST AI</h1>
              <p className="text-xs opacity-50 tracking-[0.3em] uppercase">System</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  ultra-nav-item w-full text-left flex items-center gap-4
                  ${isActive ? 'active text-[#00d4ff]' : 'text-gray-400 hover:text-white'}
                `}
              >
                <Icon size={20} />
                <span className="font-light tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-6 border-t border-white/5 space-y-3">
          <button
            onClick={onNewCustomer}
            className="ultra-btn ultra-btn-outline w-full flex items-center justify-center gap-2"
          >
            <PlusIcon size={16} />
            <span>New Customer</span>
          </button>
          <button
            onClick={onNewVisit}
            className="ultra-btn ultra-btn-primary w-full flex items-center justify-center gap-2"
          >
            <PlusIcon size={16} />
            <span>Record Visit</span>
          </button>
        </div>

        {/* Time Display */}
        <div className="p-6 border-t border-white/5">
          <div className="text-center">
            <div className="text-3xl font-thin tabular-nums">
              {time.toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-xs opacity-50 mt-1">
              {time.toLocaleDateString('ja-JP', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Grid */}
        <div className="ultra-grid absolute inset-0" />
        
        {/* Content */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}