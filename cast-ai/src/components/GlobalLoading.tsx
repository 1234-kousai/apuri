import { useEffect, useState } from 'react'
import { useCustomerStore } from '../stores/customerStore'

export function GlobalLoading() {
  const [isVisible, setIsVisible] = useState(false)
  const isLoading = useCustomerStore((state) => state.isLoading)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isLoading) {
      // 少し遅延させてチラつきを防ぐ
      timer = setTimeout(() => {
        setIsVisible(true)
      }, 200)
    } else {
      setIsVisible(false)
    }

    return () => clearTimeout(timer)
  }, [isLoading])

  if (!isVisible) return null

  return (
    <div className="loading-bar" role="progressbar" aria-label="読み込み中" />
  )
}