import { cn, getStatusColor } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger'
  className?: string
  status?: string
}

export function Badge({ children, variant = 'default', className, status }: BadgeProps) {
  const statusClass = status ? getStatusColor(status) : ''
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-gray-100 text-gray-800': variant === 'default' && !status,
          'bg-blue-100 text-blue-800': variant === 'secondary',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
        },
        statusClass,
        className
      )}
    >
      {children}
    </span>
  )
}
