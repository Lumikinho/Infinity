import { useRef } from 'react'
import { createPortal } from 'react-dom'
import type { KeyboardEvent, ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '../lib/utils'
import { useDialog } from '../lib/useDialog'

interface DialogShellProps {
  children: ReactNode
  onClose: () => void
  labelledBy: string
  closeDisabled?: boolean
  width?: string
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function DialogShell({
  children,
  onClose,
  labelledBy,
  closeDisabled = false,
  width = 'max-w-md',
}: DialogShellProps) {
  useDialog(onClose, closeDisabled)
  const panelRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !panelRef.current) return

    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter((element) => element.offsetParent !== null)

    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          if (!closeDisabled) onClose()
        }}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[3px]"
      />

      <motion.div
        ref={panelRef}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        className={cn(
          'relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_30px_80px_-30px_rgba(20,20,19,0.55)] sm:rounded-3xl sm:pb-0',
          width,
        )}
      >
        {children}
      </motion.div>
    </div>,
    document.body,
  )
}
