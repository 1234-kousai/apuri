import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface TableProps {
  children: ReactNode
  className?: string
}

export function UltraModernTable({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl">
      <table className={cn(
        'w-full text-left',
        className
      )}>
        {children}
      </table>
    </div>
  )
}

export function UltraModernTableHeader({ children, className = '' }: TableProps) {
  return (
    <thead className={cn(
      'bg-gradient-to-r from-gray-900 to-gray-800',
      className
    )}>
      {children}
    </thead>
  )
}

export function UltraModernTableBody({ children, className = '' }: TableProps) {
  return (
    <tbody className={cn(
      'divide-y divide-gray-800',
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

export function UltraModernTableRow({ children, className = '', onClick, hover = true }: TableRowProps) {
  return (
    <tr 
      className={cn(
        'transition-all duration-300',
        hover && 'hover:bg-white/5',
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

export function UltraModernTableCell({ children, className = '', align = 'left' }: TableCellProps) {
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

export function UltraModernTableHeaderCell({ children, className = '', align = 'left' }: TableCellProps) {
  return (
    <th className={cn(
      'px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      className
    )}>
      {children}
    </th>
  )
}