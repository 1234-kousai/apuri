import { UsersIcon, CalendarIcon, ChartIcon } from './ui/Icons'
import { AnimatedCounter } from './ui/AnimatedCounter'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface StatData {
  totalRevenue: number
  monthlyPrediction: number
  customerCount: number
  avgFrequency: number
  visitCount: number
  daysPassed: number
}

interface UltrathinkDashboardProps {
  stats: StatData
  children?: ReactNode
}

export function UltrathinkDashboard({ stats, children }: UltrathinkDashboardProps) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([])
  
  useEffect(() => {
    const newParticles = Array.from({length: 15}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="min-h-screen p-8 lg:p-12 relative">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-32 h-32 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: `radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)`,
              animation: `ultra-float ${10 + particle.id * 2}s ease-in-out infinite`,
              animationDelay: `${particle.id * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="mb-16 relative">
        <div className="max-w-7xl">
          <h1 className="ultra-heading text-[8rem] leading-none mb-4" data-text="DASHBOARD">
            DASHBOARD
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-xl font-light opacity-60 tracking-wide">
              Real-time business intelligence
            </p>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" style={{animationDelay: '0.3s'}} />
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" style={{animationDelay: '0.6s'}} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Stats Grid */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Card - Large */}
          <div className="lg:col-span-7 ultra-card p-8 lg:p-12 relative overflow-hidden group">
            {/* Animated gradient background */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(45deg, #00d4ff, #9945ff, #ff0080)',
                  backgroundSize: '300% 300%',
                  animation: 'ultra-gradient-shift 10s ease infinite'
                }}
              />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">Monthly Revenue</p>
                  <div className="text-6xl lg:text-7xl font-thin ultra-gradient-text">
                    <AnimatedCounter 
                      value={stats.totalRevenue} 
                      prefix="¥" 
                      separator=","
                      className="inherit"
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff] to-[#9945ff] blur-xl opacity-50 animate-pulse" />
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-[#9945ff]/20 backdrop-blur-sm">
                    <ChartIcon size={32} className="text-[#00d4ff] drop-shadow-glow" />
                  </div>
                </div>
              </div>
              
              {/* Enhanced Mini Chart */}
              <div className="mt-8 h-32 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#00d4ff]/5 to-transparent rounded-lg" />
                <svg className="w-full h-full relative z-10">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    d="M 0 100 Q 50 80 100 90 T 200 70 T 300 85 T 400 60 T 500 75 L 500 130 L 0 130 Z"
                    fill="url(#gradient)"
                    filter="url(#glow)"
                    className="animate-pulse"
                  />
                  <path
                    d="M 0 100 Q 50 80 100 90 T 200 70 T 300 85 T 400 60 T 500 75"
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="2"
                    filter="url(#glow)"
                    className="opacity-80"
                  />
                </svg>
                <div className="absolute bottom-0 left-0 flex items-center gap-2">
                  <div className="px-2 py-1 rounded-full bg-[#00ff88]/20 backdrop-blur-sm">
                    <span className="text-[#00ff88] text-xs font-medium">+24.5%</span>
                  </div>
                  <span className="text-xs opacity-50">vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Card */}
          <div className="lg:col-span-5 ultra-card p-8 relative overflow-hidden group">
            {/* Floating orbs background */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#9945ff]/20 to-[#ff0080]/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#9945ff]/20 blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
            
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">Revenue Prediction</p>
              <div className="text-5xl font-thin mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#9945ff] to-[#ff0080]">
                <AnimatedCounter 
                  value={stats.monthlyPrediction} 
                  prefix="¥" 
                  separator=","
                  className="inherit"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#9945ff] to-[#ff0080] rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((stats.daysPassed / 30) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs opacity-50">{stats.daysPassed}/30 days</span>
              </div>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="lg:col-span-6 ultra-glass p-8 relative overflow-hidden group">
            {/* Animated background pattern */}
            <div 
              className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-700"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #00d4ff 0%, transparent 50%), radial-gradient(circle at 80% 80%, #9945ff 0%, transparent 50%)',
                backgroundSize: '100% 100%',
                animation: 'ultra-float 15s ease-in-out infinite'
              }}
            />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">Total Customers</p>
                <div className="text-6xl font-thin ultra-gradient-text">
                  <AnimatedCounter 
                    value={stats.customerCount} 
                    className="inherit"
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff] to-[#9945ff] blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#00d4ff]/10 to-[#9945ff]/10 backdrop-blur-sm flex items-center justify-center">
                  <UsersIcon size={40} className="text-[#00d4ff] drop-shadow-glow" />
                </div>
                <div className="absolute -inset-4 rounded-full border border-[#00d4ff]/20 animate-ping" />
              </div>
            </div>
          </div>

          {/* Visit Frequency */}
          <div className="lg:col-span-6 ultra-glass p-8 relative overflow-hidden group">
            {/* Grid pattern background */}
            <div className="absolute inset-0 ultra-grid-pattern opacity-10" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">Average Frequency</p>
                <div className="text-6xl font-thin">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0080] to-[#ff6b00]">
                    {stats.avgFrequency}
                  </span>
                  <span className="text-2xl opacity-50 ml-2">visits/mo</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff0080] to-[#ff6b00] blur-xl opacity-40 animate-pulse" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#ff0080]/20 to-[#ff6b00]/20 backdrop-blur-sm">
                  <CalendarIcon size={32} className="text-[#ff0080] drop-shadow-glow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Suggestions Section */}
      <section className="relative">
        <div className="mb-8 relative">
          <h2 className="text-3xl font-thin tracking-wide mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            AI Insights
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-sm opacity-50 uppercase tracking-[0.2em]">Intelligent recommendations</p>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            <div className="flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div 
                  key={i}
                  className="w-1 h-4 rounded-full bg-gradient-to-t from-[#00d4ff] to-[#9945ff] opacity-60"
                  style={{
                    animation: 'ultra-pulse 2s ease-in-out infinite',
                    animationDelay: `${delay}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6 relative">
          {/* Decorative lines */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          {children}
        </div>
      </section>
    </div>
  )
}