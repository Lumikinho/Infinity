import { useEffect, useState } from 'react'

import { cn, initials } from '../lib/format'

const sizes = {
  sm: 'size-8 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-16 text-lg',
}

interface AvatarProps {
  name: string
  src: string | null
  size?: keyof typeof sizes
  className?: string
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
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
        className={cn(
          'shrink-0 rounded-full border border-line object-cover',
          sizes[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full border border-line bg-neutral-100 font-medium uppercase tracking-tight text-neutral-600',
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
