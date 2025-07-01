import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // キャンバスサイズ設定
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // パーティクル設定
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      hue: number
      
      constructor() {
        this.x = Math.random() * (canvas?.width ?? window.innerWidth)
        this.y = Math.random() * (canvas?.height ?? window.innerHeight)
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.2
        this.hue = Math.random() * 60 + 330 // ピンク〜赤の範囲
      }
      
      update() {
        this.x += this.speedX
        this.y += this.speedY
        
        // 画面外に出たら反対側から出現
        const width = canvas?.width ?? window.innerWidth
        const height = canvas?.height ?? window.innerHeight
        if (this.x > width) this.x = 0
        if (this.x < 0) this.x = width
        if (this.y > height) this.y = 0
        if (this.y < 0) this.y = height
        
        // 色相を少しずつ変化
        this.hue += 0.5
        if (this.hue > 390) this.hue = 330
      }
      
      draw() {
        if (!ctx) return
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`
        ctx.shadowBlur = 10
        ctx.shadowColor = `hsl(${this.hue}, 70%, 60%)`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }
    
    // パーティクル配列
    const particles: Particle[] = []
    const particleCount = 50
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }
    
    // 接続線を描画
    const drawConnections = () => {
      if (!ctx) return
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.hypot(
            particle.x - otherParticle.x,
            particle.y - otherParticle.y
          )
          
          if (distance < 150) {
            ctx.save()
            ctx.globalAlpha = (1 - distance / 150) * 0.2
            ctx.strokeStyle = `hsl(${particle.hue}, 70%, 60%)`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
            ctx.restore()
          }
        })
      })
    }
    
    // アニメーションループ
    const animate = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(250, 250, 250, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })
      
      drawConnections()
      
      requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])
  
  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{ zIndex: 0 }}
      />
      {/* グラデーションオーバーレイ */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary-500/10" />
      </div>
    </>
  )
}