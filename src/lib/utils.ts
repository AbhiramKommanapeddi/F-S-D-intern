import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'published':
    case 'submitted':
      return 'bg-blue-100 text-blue-800'
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800'
    case 'shortlisted':
      return 'bg-purple-100 text-purple-800'
    case 'accepted':
    case 'awarded':
      return 'bg-green-100 text-green-800'
    case 'rejected':
    case 'closed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function timeUntilDeadline(deadline: string): string {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  
  if (diff < 0) {
    return 'Expired'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} left`
  }
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} left`
  }
  
  return 'Less than 1 hour left'
}
