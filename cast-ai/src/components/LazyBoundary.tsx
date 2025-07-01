import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { LoadingSpinner } from './LoadingSpinner'

interface LazyBoundaryProps {
  children: ReactNode
  componentName: string
  fallback?: ReactNode
}

export function LazyBoundary({ 
  children, 
  componentName, 
  fallback = <LoadingSpinner /> 
}: LazyBoundaryProps) {
  return (
    <ComponentErrorBoundary componentName={componentName}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ComponentErrorBoundary>
  )
}