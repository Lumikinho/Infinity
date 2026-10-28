import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertIcon, CheckIcon, XIcon } from './Icons'
import { cn } from '../lib/utils'

type ToastVariant = 'success' | 'error'

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = ++counter.current

      setToasts((current) => [...current.slice(-2), { ...toast, id }])
      window.setTimeout(() => remove(id), 4500)
    },
    [remove],
  )

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 18, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-[0_20px_50px_-24px_rgba(20,20,19,0.45)]"
            >
              <span
                className={cn(
                  'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
                  toast.variant === 'success'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600',
                )}
              >
                {toast.variant === 'success' ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  <AlertIcon className="size-3.5" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 truncate text-[13px] text-muted">{toast.description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(toast.id)}
                aria-label="Fechar aviso"
                className="-mr-1 -mt-1 rounded-full p-1.5 text-muted transition hover:bg-canvas hover:text-ink"
              >
                <XIcon className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) throw new Error('useToast precisa estar dentro de ToastProvider')

  return context
}
