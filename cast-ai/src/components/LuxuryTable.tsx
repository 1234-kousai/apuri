import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface TableProps {
  children: ReactNode
  className?: string
}

export function LuxuryTable({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl luxury-shimmer">
      <table className={cn(
        'w-full text-left',
        className
      )}>
        {children}
      </table>
    </div>
  )
}

export function LuxuryTableHeader({ children, className = '' }: TableProps) {
  return (
    <thead className={cn(
      'bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95',
      'border-b border-[#d4af37]/20',
      className
    )}>
      {children}
    </thead>
  )
}

export function LuxuryTableBody({ children, className = '' }: TableProps) {
  return (
    <tbody className={cn(
      'divide-y divide-gray-800/50',
      className
    )}>
      {children}
    </tbody>
  )
}

interface TableRowProps extends TableProps {
  onClick?: () => void
  hover?: boolean
}

export function LuxuryTableRow({ children, className = '', onClick, hover = true }: TableRowProps) {
  return (
    <tr 
      className={cn(
        'transition-all duration-300',
        hover && 'hover:bg-gradient-to-r hover:from-[#d4af37]/5 hover:to-transparent',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface TableCellProps extends TableProps {
  align?: 'left' | 'center' | 'right'
}

export function LuxuryTableCell({ children, className = '', align = 'left' }: TableCellProps) {
  return (
    <td className={cn(
      'px-6 py-4 text-sm text-gray-300',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      className
    )}>
      {children}
    </td>
  )
}

export function LuxuryTableHeaderCell({ children, className = '', align = 'left' }: TableCellProps) {
  return (
    <th className={cn(
      'px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-[0.1em]',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      className
    )}>
      {children}
    </th>
  )
}