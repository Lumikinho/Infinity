import { useEffect, useRef } from 'react'

export function useDialog(onClose: () => void, closeDisabled = false) {
  const onCloseRef = useRef(onClose)
  const disabledRef = useRef(closeDisabled)

  onCloseRef.current = onClose
  disabledRef.current = closeDisabled

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement as HTMLElement | null

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disabledRef.current) onCloseRef.current()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [])
}
