import { cn } from '../lib/format'

interface NoticeProps {
  message: string | null
  className?: string
}

export function Notice({ message, className }: NoticeProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={
        message
          ? cn('border border-line bg-neutral-100 px-3 py-2 text-[13px]', className)
          : 'sr-only'
      }
    >
      {message}
    </p>
  )
}
