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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const navItems = [
    { id: 'home' as const, label: 'Dashboard', icon: HomeIcon, gradient: 'from-[#00d4ff] to-[#9945ff]' },
    { id: 'customers' as const, label: 'Customers', icon: UsersIcon, gradient: 'from-[#9945ff] to-[#ff0080]' },
    { id: 'sales' as const, label: 'Revenue', icon: ChartIcon, gradient: 'from-[#ff0080] to-[#ff6b00]' }
  ]

  return (
    <div className="ultrathink min-h-screen flex bg-[#000000] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Dynamic Gradient Orb */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)',
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
            transform: 'translate3d(0, 0, 0)',
            transition: 'all 0.3s ease-out',
            filter: 'blur(100px)'
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#00d4ff] rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2
              }}
            />
          ))}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="w-80 min-h-screen flex flex-col backdrop-blur-xl bg-white/[0.01] border-r border-white/[0.05] relative z-20">
        {/* Logo Section */}
        <div className="p-8 border-b border-white/[0.05]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff] to-[#9945ff] blur-xl opacity-50" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#9945ff] flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                <span className="text-black font-thin text-2xl">C</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-thin tracking-[0.2em] bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                CAST AI
              </h1>
              <p className="text-xs opacity-50 tracking-[0.3em] uppercase text-[#00d4ff]">Premium System</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-8 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  group relative w-full text-left flex items-center gap-4 px-6 py-4 rounded-xl mb-2
                  transition-all duration-300 overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-2xl shadow-[#00d4ff]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                  }
                `}
              >
                {/* Hover Effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{ backgroundImage: `linear-gradient(to right, ${item.gradient.replace('from-', '').replace('to-', ',')})` }}
                  />
                )}
                
                <Icon size={20} className={isActive ? 'drop-shadow-glow' : ''} />
                <span className="font-light tracking-wider">{item.label}</span>
                
                {isActive && (
                  <>
                    <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                    {/* Active Indicator Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50" />
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-6 border-t border-white/[0.05] space-y-3">
          <button
            onClick={onNewCustomer}
            className="group relative w-full px-4 py-3 rounded-xl border border-white/10 
                     bg-white/[0.02] backdrop-blur-sm text-white/80 font-light tracking-wider
                     flex items-center justify-center gap-2 overflow-hidden transition-all duration-300
                     hover:bg-white/[0.05] hover:border-[#00d4ff]/50 hover:text-white hover:shadow-xl hover:shadow-[#00d4ff]/10"
          >
            <PlusIcon size={16} />
            <span>New Customer</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/0 via-[#00d4ff]/5 to-[#00d4ff]/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
          
          <button
            onClick={onNewVisit}
            className="group relative w-full px-4 py-3 rounded-xl overflow-hidden
                     bg-gradient-to-r from-[#00d4ff] to-[#9945ff] text-white font-medium tracking-wider
                     flex items-center justify-center gap-2 transition-all duration-300
                     hover:shadow-2xl hover:shadow-[#00d4ff]/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusIcon size={16} />
            <span>Record Visit</span>
            <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>

        {/* Status Section */}
        <div className="p-6 border-t border-white/[0.05] space-y-4">
          {/* Time Display */}
          <div className="text-center">
            <div className="text-3xl font-thin tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9945ff]">
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
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>
          
          {/* System Status */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-gray-400">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-auto">
        {/* Content with Padding */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}