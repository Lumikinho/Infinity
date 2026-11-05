import { useEffect, useState } from 'react'

export function useNotice() {
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) return

    const timer = window.setTimeout(() => setNotice(null), 5000)

    return () => window.clearTimeout(timer)
  }, [notice])

  return [notice, setNotice] as const
}
