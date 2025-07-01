import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useFocusManagement } from '../hooks/useFocusManagement'
import { CloseIcon } from './ui/Icons'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  showCloseButton?: boolean
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  const containerRef = useFocusManagement(isOpen)

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // スクロール防止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    full: 'w-full h-full sm:w-full sm:h-full sm:max-w-none'
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={containerRef}
        className={`bg-white w-full ${sizeClasses[size]} ${
          size === 'full' ? 'h-full' : 'max-h-[90vh] sm:max-h-[85vh]'
        } sm:rounded-xl shadow-xl flex flex-col ${
          size === 'full' ? 'animate-slide-up' : 'animate-slide-up sm:animate-scale-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 shrink-0">
          <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-neutral-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100"
              aria-label="閉じる"
            >
              <CloseIcon size={24} />
            </button>
          )}
        </div>
        
        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}