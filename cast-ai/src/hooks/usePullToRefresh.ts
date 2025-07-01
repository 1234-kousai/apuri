import { useRef, useEffect, useState, useCallback } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  resistance?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 100,
  resistance = 2.5
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number | null>(null)
  const isRefreshingRef = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const container = containerRef.current
    if (!container || container.scrollTop > 0 || isRefreshingRef.current) return
    
    startYRef.current = e.touches[0].clientY
    setIsPulling(true)
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startYRef.current || !isPulling || isRefreshingRef.current) return
    
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, (currentY - startYRef.current) / resistance)
    
    if (distance > 0) {
      e.preventDefault()
      setPullDistance(distance)
    }
  }, [isPulling, resistance])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshingRef.current) return
    
    setIsPulling(false)
    
    if (pullDistance >= threshold) {
      isRefreshingRef.current = true
      
      try {
        await onRefresh()
      } finally {
        isRefreshingRef.current = false
      }
    }
    
    setPullDistance(0)
    startYRef.current = null
  }, [isPulling, pullDistance, threshold, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    containerRef,
    isPulling: isPulling && pullDistance > 0,
    pullProgress: Math.min(pullDistance / threshold, 1),
    isRefreshing: isRefreshingRef.current
  }
}