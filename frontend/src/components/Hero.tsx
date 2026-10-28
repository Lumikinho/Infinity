import { motion } from 'motion/react'
import { cn } from '../lib/utils'

interface HeroProps {
  total: number
  admins: number
  players: number
}

const ease = [0.22, 1, 0.36, 1] as const

export function Hero({ total, admins, players }: HeroProps) {
  const stats = [
    { label: 'Total', value: total },
    { label: 'Admins', value: admins },
    { label: 'Jogadores', value: players },
  ]

  return (
    <section className="relative pt-14 md:pt-20">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-0 hidden select-none font-serif text-[13rem] leading-none text-ink/[0.045] lg:block"
      >
        ∞
      </span>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted"
      >
        <span className="h-px w-6 bg-ink/30" />
        Painel de usuários
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.06 }}
        className="mt-5 max-w-2xl text-[2.7rem] font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl"
      >
        Sua equipe,
        <br />
        em <span className="font-serif text-[1.08em] font-normal italic tracking-[-0.01em]">um só lugar.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.12 }}
        className="mt-6 max-w-md text-[15px] leading-relaxed text-muted"
      >
        Cadastre, edite e organize quem faz parte da Infinity. Simples, rápido e sem ruído.
      </motion.p>

      <motion.dl
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.18 }}
        className="mt-10 grid max-w-md grid-cols-3 divide-x divide-line border-t border-line pt-5"
      >
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn('flex flex-col-reverse', index === 0 ? 'pr-6' : 'px-6')}
          >
            <dt className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              {stat.label}
            </dt>
            <dd className="text-[26px] font-medium leading-none tracking-[-0.03em] tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </motion.dl>
    </section>
  )
}
