export function LoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="mt-6 overflow-hidden border border-line bg-surface">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b border-line px-4 py-4 last:border-0"
        >
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-neutral-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-56 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="hidden h-3 w-32 animate-pulse rounded bg-neutral-100 md:block" />
        </div>
      ))}
    </div>
  )
}
