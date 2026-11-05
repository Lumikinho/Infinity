import { cn, roleLabels, roleStyles } from '../lib/format'
import type { UserRole } from '../types'

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
        roleStyles[role],
        className,
      )}
    >
      {roleLabels[role]}
    </span>
  )
}
