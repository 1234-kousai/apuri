import { useEffect, useRef } from 'react'

export function useFocusManagement(isOpen: boolean, autoFocus = true) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen && autoFocus) {
      // 現在のフォーカス要素を保存
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // コンテナ内の最初のフォーカス可能な要素にフォーカス
      setTimeout(() => {
        if (containerRef.current) {
          const focusableElements = containerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          firstElement?.focus()
        }
      }, 50)
    }

    return () => {
      // ダイアログが閉じられたら前のフォーカス要素に戻す
      if (!isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus()
        previousFocusRef.current = null
      }
    }
  }, [isOpen, autoFocus])

  // キーボードナビゲーション（タブトラップ）
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return

      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const focusArray = Array.from(focusableElements) as HTMLElement[]
      const firstElement = focusArray[0]
      const lastElement = focusArray[focusArray.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return containerRef
}