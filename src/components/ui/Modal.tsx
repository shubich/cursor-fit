import type { ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  titleId?: string
  children: ReactNode
  /** Optional: custom class for the inner content box */
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  titleId = 'modal-title',
  children,
  className = '',
}: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800 ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}
