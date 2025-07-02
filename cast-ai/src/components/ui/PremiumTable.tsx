interface PremiumTableProps {
  children: React.ReactNode
  className?: string
}

export function PremiumTable({ children, className = '' }: PremiumTableProps) {
  return (
    <div className="overflow-hidden rounded-xl shadow-lg">
      <table className={`table-premium ${className}`}>
        {children}
      </table>
    </div>
  )
}

interface PremiumTableHeaderProps {
  children: React.ReactNode
}

export function PremiumTableHeader({ children }: PremiumTableHeaderProps) {
  return <thead>{children}</thead>
}

interface PremiumTableBodyProps {
  children: React.ReactNode
}

export function PremiumTableBody({ children }: PremiumTableBodyProps) {
  return <tbody>{children}</tbody>
}

interface PremiumTableRowProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function PremiumTableRow({ children, onClick, className = '' }: PremiumTableRowProps) {
  return (
    <tr 
      className={`${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

interface PremiumTableCellProps {
  children: React.ReactNode
  className?: string
}

export function PremiumTableCell({ children, className = '' }: PremiumTableCellProps) {
  return <td className={className}>{children}</td>
}

export function PremiumTableHeaderCell({ children, className = '' }: PremiumTableCellProps) {
  return <th className={className}>{children}</th>
}