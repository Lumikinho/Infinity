import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { AlertIcon, MinusIcon, PlusIcon, RefreshIcon } from './Icons'

const OUTPUT_SIZE = 512
const MIN_ZOOM = 1
const MAX_ZOOM = 3

interface ImageCropperProps {
  file: File
  onCancel: () => void
  onApply: (file: File) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function ImageCropper({ file, onCancel, onApply }: ImageCropperProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const [src, setSrc] = useState<string | null>(null)
  const [viewport, setViewport] = useState(288)
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(file)

    setSrc(url)
    setReady(false)
    setNatural({ width: 0, height: 0 })
    setZoom(1)
    setError(null)

    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const node = viewportRef.current

    if (!node) return

    const update = () => setViewport(node.getBoundingClientRect().width)

    update()

    const observer = new ResizeObserver(update)

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const baseScale =
    natural.width > 0 && natural.height > 0
      ? Math.max(viewport / natural.width, viewport / natural.height)
      : 1

  const getBounds = useCallback(
    (zoomLevel: number) => {
      const scale = baseScale * zoomLevel

      return { width: natural.width * scale, height: natural.height * scale }
    },
    [baseScale, natural.height, natural.width],
  )

  const clampOffset = useCallback(
    (next: { x: number; y: number }, zoomLevel: number) => {
      const { width, height } = getBounds(zoomLevel)

      return {
        x: clamp(next.x, viewport - width, 0),
        y: clamp(next.y, viewport - height, 0),
      }
    },
    [getBounds, viewport],
  )

  useEffect(() => {
    if (!ready || natural.width === 0) return

    setZoom(1)

    const { width, height } = getBounds(1)

    setOffset({ x: (viewport - width) / 2, y: (viewport - height) / 2 })
  }, [ready, natural.width, natural.height, viewport, getBounds])

  function recenter(zoomLevel = zoom) {
    const { width, height } = getBounds(zoomLevel)

    setOffset({ x: (viewport - width) / 2, y: (viewport - height) / 2 })
  }

  function updateZoom(next: number) {
    const clamped = clamp(next, MIN_ZOOM, MAX_ZOOM)

    if (Math.abs(clamped - zoom) < 0.001) return

    const ratio = clamped / zoom
    const center = viewport / 2

    setZoom(clamped)
    setOffset((previous) =>
      clampOffset(
        {
          x: center - (center - previous.x) * ratio,
          y: center - (center - previous.y) * ratio,
        },
        clamped,
      ),
    )
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!ready || processing) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current

    if (!drag || drag.pointerId !== event.pointerId) return

    setOffset(
      clampOffset(
        {
          x: drag.originX + event.clientX - drag.startX,
          y: drag.originY + event.clientY - drag.startY,
        },
        zoom,
      ),
    )
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return

    dragRef.current = null
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!ready) return

    const amount = event.shiftKey ? 24 : 8
    const moves: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: -amount, y: 0 },
      ArrowRight: { x: amount, y: 0 },
      ArrowUp: { x: 0, y: amount },
      ArrowDown: { x: 0, y: -amount },
    }

    const move = moves[event.key]

    if (!move) return

    event.preventDefault()
    setOffset((previous) =>
      clampOffset({ x: previous.x + move.x, y: previous.y + move.y }, zoom),
    )
  }

  async function handleApply() {
    const image = imageRef.current

    if (!image || !ready || processing) return

    setProcessing(true)
    setError(null)

    try {
      const canvas = document.createElement('canvas')

      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE

      const context = canvas.getContext('2d')

      if (!context) throw new Error('Seu navegador não conseguiu processar a imagem.')

      const scale = baseScale * zoom
      const sourceX = -offset.x / scale
      const sourceY = -offset.y / scale
      const sourceSize = viewport / scale

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
      context.imageSmoothingQuality = 'high'
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      )

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.92),
      )

      if (!blob) throw new Error('Não foi possível gerar a imagem redimensionada.')

      onApply(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível processar a imagem.')
      setProcessing(false)
    }
  }

  const imageWidth = natural.width * baseScale * zoom
  const imageHeight = natural.height * baseScale * zoom

  return (
    <div>
      <div className="px-6 py-5">
        <div
          ref={viewportRef}
          role="group"
          tabIndex={0}
          aria-label="Área de recorte da imagem. Arraste ou use as setas para reposicionar."
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          className="relative mx-auto aspect-square w-full max-w-72 cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-line bg-[#eeece7] active:cursor-grabbing"
        >
          {src && (
            <img
              ref={imageRef}
              src={src}
              alt="Prévia da foto para recorte"
              draggable={false}
              onLoad={(event) => {
                setNatural({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
                setReady(true)
              }}
              onError={() => setError('Não foi possível abrir esta imagem.')}
              className="absolute left-0 top-0 max-w-none select-none"
              style={{
                width: natural.width > 0 ? imageWidth : undefined,
                height: natural.height > 0 ? imageHeight : undefined,
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
                opacity: ready ? 1 : 0,
              }}
            />
          )}

          {!ready && !error && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="size-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
            </div>
          )}

          {ready && (
            <>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
              <div className="pointer-events-none absolute inset-4 rounded-full ring-1 ring-white/70" />
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} className="border border-white/10" />
                ))}
              </div>
            </>
          )}
        </div>

        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.14em] text-muted">
          Arraste ou use as setas · recorte 1:1
        </p>

        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => updateZoom(zoom - 0.2)}
            disabled={!ready || zoom <= MIN_ZOOM}
            aria-label="Diminuir zoom"
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink disabled:opacity-40"
          >
            <MinusIcon className="size-3.5" />
          </button>

          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(event) => updateZoom(Number(event.target.value))}
            disabled={!ready}
            aria-label="Zoom da imagem"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-ink disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => updateZoom(zoom + 0.2)}
            disabled={!ready || zoom >= MAX_ZOOM}
            aria-label="Aumentar zoom"
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-muted transition hover:text-ink disabled:opacity-40"
          >
            <PlusIcon className="size-3.5" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
          <button
            type="button"
            onClick={() => {
              setZoom(1)
              recenter(1)
            }}
            disabled={!ready}
            className="inline-flex items-center gap-1.5 transition hover:text-ink disabled:opacity-40"
          >
            <RefreshIcon className="size-3" />
            Centralizar
          </button>
          <span className="tabular-nums">{Math.round(zoom * 100)}% · {OUTPUT_SIZE} px</span>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2.5 text-[13px] leading-snug text-rose-700"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-[#fbfaf7] px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="h-10 rounded-xl px-4 text-sm font-medium text-muted transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void handleApply()}
          disabled={!ready || processing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {processing && (
            <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          Usar foto
        </button>
      </div>
    </div>
  )
}
