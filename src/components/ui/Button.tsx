import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerFilled' | 'ghost' | 'nav'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
  danger:
    'border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30',
  dangerFilled: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
  ghost:
    'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700',
  nav: 'w-full rounded-xl border-2 border-slate-200 bg-white py-4 pl-4 text-left font-medium text-slate-900 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'rounded-lg px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
  md: 'rounded-lg px-4 py-2 text-sm font-medium',
  lg: 'rounded-xl py-4 text-lg font-semibold',
}

const invertedPrimary =
  'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  /** Use dark-style primary (e.g. Start workout, Finish) */
  inverted?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  inverted = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none'
  const variantClass =
    variant === 'primary' && inverted ? invertedPrimary : variantClasses[variant]
  const sizeClass = variant === 'nav' ? '' : sizeClasses[size]
  const widthClass = fullWidth ? 'w-full' : variant === 'nav' ? '' : ''

  return (
    <button
      type={type}
      className={`${base} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
