import { useState, useEffect, useRef, useCallback } from 'react'

interface UseVirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  getScrollElement?: () => HTMLElement | null
}

export function useVirtualScroll<T>(
  items: T[],
  options: UseVirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 3, getScrollElement } = options
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLElement | null>(null)

  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback(() => {
    const element = scrollElementRef.current
    if (element) {
      setScrollTop(element.scrollTop)
    }
  }, [])

  useEffect(() => {
    const element = getScrollElement ? getScrollElement() : scrollElementRef.current
    if (element) {
      scrollElementRef.current = element
      element.addEventListener('scroll', handleScroll, { passive: true })
      return () => {
        element.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll, getScrollElement])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollElementRef,
    startIndex,
    endIndex
  }
}