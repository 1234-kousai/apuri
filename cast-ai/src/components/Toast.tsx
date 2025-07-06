import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  type: ToastType
  message: string
}

interface ToastProps {
  message: ToastMessage
  onClose: (id: string) => void
}

function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [message.id, onClose])

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[message.type]

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  }[message.type]

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}>
      {icon}
      <p className="flex-1">{message.message}</p>
      <button
        onClick={() => onClose(message.id)}
        className="text-white hover:text-gray-200"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

// トーストコンテナ
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ type: ToastType; message: string }>
      const newToast: ToastMessage = {
        id: Date.now().toString(),
        type: customEvent.detail.type,
        message: customEvent.detail.message
      }
      setToasts(prev => [...prev, newToast])
    }

    window.addEventListener('show-toast', handleToast)
    return () => window.removeEventListener('show-toast', handleToast)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast} onClose={removeToast} />
      ))}
    </div>
  )
}

// トースト表示用のヘルパー関数
export const showToast = (type: ToastType, message: string) => {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { type, message }
  }))
}