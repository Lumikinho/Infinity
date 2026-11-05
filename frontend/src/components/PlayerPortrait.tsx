import { useEffect, useState } from 'react'

import { cn, initials } from '../lib/format'

interface PlayerPortraitProps {
  name: string
  src: string | null
  className?: string
  initialsClassName?: string
}

export function PlayerPortrait({
  name,
  src,
  className,
  initialsClassName,
}: PlayerPortraitProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={cn('size-full object-cover', className)}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-full place-items-center bg-neutral-100 font-medium uppercase tracking-tight text-neutral-600',
        initialsClassName,
      )}
    >
      {initials(name)}
    </span>
  )
}
