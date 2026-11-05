import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useInView,
  useReducedMotion,
  type Transition,
} from 'motion/react'

const CHARACTERS = [
  '0',
  '1',
  '<',
  '>',
  '{',
  '}',
  '[',
  ']',
  '/',
  '\\',
  '+',
  '-',
  '=',
  ':',
  '.',
  '#',
  '*',
] as const

const FONT_SIZE = 10
const LINE_HEIGHT = 14
const MIN_COLUMNS = 18
const MAX_COLUMNS = 38
const MIN_ROWS = 5
const MAX_ROWS = 11
const DEFAULT_COLUMNS = 28
const DEFAULT_ROWS = 8

const panelTransition: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value + 0x6d2b79f5) >>> 0

    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function buildGrid(columns: number, rows: number, seed: number) {
  const random = createRandom(seed)

  return Array.from(
    { length: columns * rows },
    () => CHARACTERS[Math.floor(random() * CHARACTERS.length)],
  )
}

export function AsciiHero() {
  const reduceMotion = useReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const characterRef = useRef<HTMLSpanElement>(null)
  const lastTick = useRef(0)

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [characterWidth, setCharacterWidth] = useState(6)

  const inView = useInView(hostRef, { margin: '160px' })

  useLayoutEffect(() => {
    const host = hostRef.current

    if (!host) return

    const sync = () => {
      const rect = host.getBoundingClientRect()
      const measured = characterRef.current?.getBoundingClientRect().width

      setSize({ width: rect.width, height: rect.height })

      if (measured && measured > 0) setCharacterWidth(measured)
    }

    sync()

    const observer = new ResizeObserver(sync)
    observer.observe(host)

    return () => observer.disconnect()
  }, [])

  const columns =
    size.width > 0
      ? clamp(Math.floor(size.width / characterWidth), MIN_COLUMNS, MAX_COLUMNS)
      : DEFAULT_COLUMNS

  const rows =
    size.height > 0
      ? clamp(Math.floor(size.height / LINE_HEIGHT), MIN_ROWS, MAX_ROWS)
      : DEFAULT_ROWS

  const seed = columns * 131 + rows * 17

  const [characters, setCharacters] = useState(() =>
    buildGrid(DEFAULT_COLUMNS, DEFAULT_ROWS, DEFAULT_COLUMNS * 131 + DEFAULT_ROWS * 17),
  )

  useEffect(() => {
    setCharacters(buildGrid(columns, rows, seed))
  }, [columns, rows, seed])

  const liveIndices = useMemo(() => {
    const total = columns * rows
    const count = clamp(Math.round(total * 0.09), 6, 30)
    const random = createRandom(seed + 9973)
    const indices = new Set<number>()

    while (indices.size < count) {
      indices.add(Math.floor(random() * total))
    }

    return indices
  }, [columns, rows, seed])

  const liveList = useMemo(() => [...liveIndices], [liveIndices])

  useAnimationFrame((time) => {
    if (reduceMotion || !inView || liveList.length === 0) return
    if (time - lastTick.current < 170) return

    lastTick.current = time

    setCharacters((current) => {
      if (current.length !== columns * rows) return current

      const next = current.slice()
      const updates = 2 + Math.floor(Math.random() * 3)

      for (let index = 0; index < updates; index += 1) {
        const target = liveList[Math.floor(Math.random() * liveList.length)]
        next[target] = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
      }

      return next
    })
  })

  const motionEnabled = !reduceMotion && inView

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={panelTransition}
      className="overflow-hidden rounded-lg border border-line bg-canvas"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Infinity // Live
        </p>

        <span aria-hidden="true" className="flex items-center gap-1">
          <span className="size-1 rounded-full bg-neutral-300" />
          <span className="size-1 rounded-full bg-neutral-300" />
          <motion.span
            className="size-1 rounded-full bg-neutral-500"
            animate={motionEnabled ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.7 }}
            transition={
              motionEnabled
                ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0 }
            }
          />
        </span>
      </div>

      <div className="relative h-40 overflow-hidden p-3 sm:h-48">
        <span
          ref={characterRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute font-mono text-[10px] leading-none"
          style={{ fontSize: FONT_SIZE }}
        >
          0
        </span>

        <div ref={hostRef} aria-hidden="true" className="relative h-full w-full overflow-hidden">
          <div
            className="grid content-center"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gridAutoRows: `${LINE_HEIGHT}px`,
            }}
          >
            {characters.map((character, index) => {
              const live = liveIndices.has(index)
              const delay = (index % 9) * 0.32
              const duration = 3.4 + (index % 5) * 0.6

              if (!live) {
                return (
                  <span
                    key={index}
                    className="select-none font-mono text-neutral-300"
                    style={{ fontSize: FONT_SIZE, lineHeight: `${LINE_HEIGHT}px` }}
                  >
                    {character}
                  </span>
                )
              }

              return (
                <motion.span
                  key={index}
                  className="select-none font-mono text-neutral-400"
                  style={{ fontSize: FONT_SIZE, lineHeight: `${LINE_HEIGHT}px` }}
                  animate={motionEnabled ? { opacity: [0.2, 0.68, 0.2] } : { opacity: 0.5 }}
                  transition={
                    motionEnabled
                      ? { duration, delay, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0 }
                  }
                >
                  {character}
                </motion.span>
              )
            })}
          </div>

          {motionEnabled && (
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-neutral-400/10 to-transparent"
              initial={{ y: -64 }}
              animate={{ y: [-64, 280] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
