import { useState } from 'react'
import { PlusIcon } from '../ui/Icons'

interface FABOption {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color: string
}

interface FABProps {
  options: FABOption[]
}

export function FAB({ options }: FABProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Options */}
      <div className={`absolute bottom-16 right-0 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {options.map((option, index) => (
          <div
            key={index}
            className={`flex items-center justify-end mb-4 transform transition-all duration-300 ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
          >
            <span className="mr-3 px-3 py-1 bg-white rounded-full shadow-lg text-sm font-medium whitespace-nowrap">
              {option.label}
            </span>
            <button
              onClick={() => {
                option.onClick()
                setIsOpen(false)
              }}
              className={`w-12 h-12 rounded-full ${option.color} text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center`}
            >
              {option.icon}
            </button>
          </div>
        ))}
      </div>
      
      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fab"
      >
        <PlusIcon size={24} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  )
}