import { useEffect, useRef } from 'react'

export function UltraModernBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
    }> = []
    
    // Create floating particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: ['#8b5cf6', '#3b82f6', '#10b981', '#f97316'][Math.floor(Math.random() * 4)]
      })
    }
    
    let animationId: number
    
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color + '20'
        ctx.fill()
        
        ctx.shadowBlur = 20
        ctx.shadowColor = particle.color
        ctx.fill()
        ctx.shadowBlur = 0
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  return (
    <>
      {/* Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 opacity-50"
        aria-hidden="true"
      />
      
      {/* Mesh Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute inset-0 ultra-mesh" />
      </div>
      
      {/* Grid Pattern */}
      <div className="fixed inset-0 z-0 ultra-grid opacity-20" />
      
      {/* Noise Texture */}
      <div className="fixed inset-0 z-0 opacity-[0.015]">
        <svg width="100%" height="100%">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </>
  )
}