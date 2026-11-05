import { cn } from '../lib/format'
import { secondaryButtonClass } from '../lib/styles'

interface LoadErrorProps {
  message: string
  onRetry: () => void
}

export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="mt-6 border border-line bg-surface px-6 py-12 text-center"
    >
      <h2 className="text-xl font-bold tracking-[0.02em]">Não foi possível carregar</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted">{message}</p>
      <button type="button" onClick={onRetry} className={cn(secondaryButtonClass, 'mt-6')}>
        Tentar novamente
      </button>
    </div>
  )
}
