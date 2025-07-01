import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-xl bg-white transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border border-neutral-200 shadow-soft hover:shadow-medium',
        elevated: 'shadow-medium hover:shadow-large',
        ghost: 'border border-neutral-100',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div
      className={cardVariants({ variant, padding, className })}
      {...props}
    />
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={`mb-4 ${className}`}
      {...props}
    />
  )
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function CardTitle({ className, as: Comp = 'h3', ...props }: CardTitleProps) {
  return (
    <Comp
      className={`text-xl font-semibold text-neutral-900 ${className}`}
      {...props}
    />
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      className={`text-neutral-600 ${className}`}
      {...props}
    />
  )
}