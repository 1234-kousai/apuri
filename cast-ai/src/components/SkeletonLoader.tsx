import { Card, CardContent } from './ui/Card'

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'stat'
  count?: number
}

export function SkeletonLoader({ type = 'card', count = 1 }: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (type === 'card') {
    return (
      <div className="space-y-4">
        {items.map((index) => (
          <Card key={index} variant="elevated" className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="skeleton h-6 w-32"></div>
                    <div className="skeleton h-5 w-16 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-24"></div>
                    <div className="skeleton h-4 w-32"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="skeleton h-7 w-24 mb-1"></div>
                  <div className="skeleton h-3 w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {items.map((index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg animate-pulse">
            <div className="skeleton h-12 w-12 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-32"></div>
              <div className="skeleton h-4 w-48"></div>
            </div>
            <div className="skeleton h-6 w-20"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((index) => (
          <Card key={index} variant="elevated" className="animate-pulse">
            <CardContent className="p-6">
              <div className="skeleton h-5 w-24 mb-3"></div>
              <div className="skeleton h-8 w-32 mb-1"></div>
              <div className="skeleton h-4 w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return null
}