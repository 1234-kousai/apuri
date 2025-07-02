import { useEffect, useRef } from 'react'

export function PremiumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let animationFrameId: number
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Gradient orbs
    const orbs = [
      { x: 0.2, y: 0.3, size: 300, color: 'rgba(124, 58, 237, 0.3)' },
      { x: 0.8, y: 0.7, size: 400, color: 'rgba(217, 119, 6, 0.2)' },
      { x: 0.5, y: 0.5, size: 350, color: 'rgba(99, 102, 241, 0.25)' },
      { x: 0.1, y: 0.8, size: 250, color: 'rgba(16, 185, 129, 0.2)' },
      { x: 0.9, y: 0.2, size: 280, color: 'rgba(239, 68, 68, 0.15)' },
    ]
    
    let time = 0
    
    const animate = () => {
      time += 0.001
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(15, 15, 20, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw animated gradient orbs
      orbs.forEach((orb, index) => {
        const x = orb.x * canvas.width + Math.sin(time + index) * 50
        const y = orb.y * canvas.height + Math.cos(time + index) * 50
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.size)
        gradient.addColorStop(0, orb.color)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })
      
      // Draw mesh grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1
      
      const gridSize = 50
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])
  
  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ 
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f3460 100%)',
          opacity: 0.9 
        }}
      />
      {/* Noise overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />
    </>
  )
}