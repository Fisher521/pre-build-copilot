/**
 * CategoryCard Component
 * Selectable card for project type selection
 */

'use client'

import { cn } from '@/lib/utils'

interface CategoryCardProps {
  id: string
  icon: string
  title: string
  description: string
  selected?: boolean
  onClick: (id: string) => void
}

export function CategoryCard({
  id,
  icon,
  title,
  description,
  selected,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        'flex flex-col items-center justify-center p-6 rounded-2xl text-center',
        'border-2 transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-lg',
        'active:translate-y-0',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        selected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-primary-300'
      )}
    >
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  )
}
