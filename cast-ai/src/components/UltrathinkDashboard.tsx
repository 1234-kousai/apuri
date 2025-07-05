import { UsersIcon, CalendarIcon, ChartIcon } from './ui/Icons'
import { AnimatedCounter } from './ui/AnimatedCounter'
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
  return (
    <div className="min-h-screen p-8 lg:p-12">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="max-w-7xl">
          <h1 className="ultra-heading text-[8rem] leading-none mb-4">
            DASHBOARD
          </h1>
          <p className="text-xl font-light opacity-60 tracking-wide">
            Real-time business intelligence
          </p>
        </div>
      </section>

      {/* Main Stats Grid */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Card - Large */}
          <div className="lg:col-span-7 ultra-card p-8 lg:p-12 ultra-hover-glow ultra-animate-reveal">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="ultra-stat-label mb-4">Monthly Revenue</p>
                <div className="ultra-stat-number">
                  <AnimatedCounter 
                    value={stats.totalRevenue} 
                    prefix="¥" 
                    separator=","
                    className="inherit"
                  />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-[#9945ff]/20">
                <ChartIcon size={32} className="text-[#00d4ff]" />
              </div>
            </div>
            
            {/* Mini Chart */}
            <div className="mt-8 h-32 relative">
              <svg className="w-full h-full">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 100 Q 50 80 100 90 T 200 70 T 300 85 T 400 60 T 500 75 L 500 130 L 0 130 Z"
                  fill="url(#gradient)"
                  className="animate-pulse"
                />
              </svg>
              <div className="absolute bottom-0 left-0 text-xs opacity-50">
                <span className="ultra-neon text-[#00ff88]">+24.5%</span> vs last month
              </div>
            </div>
          </div>

          {/* Prediction Card */}
          <div className="lg:col-span-5 ultra-card p-8 ultra-hover-glow ultra-animate-reveal" style={{ animationDelay: '0.1s' }}>
            <p className="ultra-stat-label mb-4">Revenue Prediction</p>
            <div className="text-5xl font-thin mb-4">
              <AnimatedCounter 
                value={stats.monthlyPrediction} 
                prefix="¥" 
                separator=","
                className="inherit"
              />
            </div>
            <div className="flex items-center gap-2 text-sm opacity-60">
              <div className="w-2 h-2 rounded-full bg-[#9945ff] animate-pulse" />
              <span>{stats.daysPassed} days analyzed</span>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="lg:col-span-6 ultra-glass p-8 ultra-hover-lift ultra-animate-reveal" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="ultra-stat-label mb-4">Total Customers</p>
                <div className="text-6xl font-thin">
                  <AnimatedCounter 
                    value={stats.customerCount} 
                    className="inherit"
                  />
                </div>
              </div>
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-[#00d4ff]/30 flex items-center justify-center">
                  <UsersIcon size={40} className="text-[#00d4ff]" />
                </div>
                <div className="absolute -inset-2 rounded-full border border-[#00d4ff]/10 animate-ping" />
              </div>
            </div>
          </div>

          {/* Visit Frequency */}
          <div className="lg:col-span-6 ultra-glass p-8 ultra-hover-lift ultra-animate-reveal" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="ultra-stat-label mb-4">Average Frequency</p>
                <div className="text-6xl font-thin">
                  {stats.avgFrequency}
                  <span className="text-2xl opacity-50 ml-2">visits/mo</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#ff0080]/20 to-[#ff6b00]/20">
                <CalendarIcon size={32} className="text-[#ff0080]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Suggestions Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-thin tracking-wide mb-2">AI Insights</h2>
          <p className="text-sm opacity-50 uppercase tracking-[0.2em]">Intelligent recommendations</p>
        </div>
        
        <div className="space-y-6">
          {children}
        </div>
      </section>
    </div>
  )
}