import { useRef } from 'react'
import type { MouseEvent } from 'react'

export function useRipple() {
  const rippleContainerRef = useRef<HTMLDivElement>(null)

  const createRipple = (event: MouseEvent<HTMLElement>) => {
    const container = rippleContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    container.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  return { rippleContainerRef, createRipple }
}