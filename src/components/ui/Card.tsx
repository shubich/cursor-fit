import type { ReactNode } from 'react'

export interface CardProps {
  as?: 'div' | 'li' | 'section'
  className?: string
  children?: ReactNode
  onClick?: () => void
}

export function Card({
  as: Component = 'div',
  className = '',
  children,
  onClick,
}: CardProps) {
  return (
    <Component
      className={`rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}
