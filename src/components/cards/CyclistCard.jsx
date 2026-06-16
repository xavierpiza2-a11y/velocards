import { RARITY_CONFIG } from '@/lib/boosterEngine'
import clsx from 'clsx'

const SPECIALITY_ICON = {
  climber:  '⛰️',
  sprinter: '⚡',
  rouleur:  '🔄',
  puncheur: '👊',
  gc:       '🏆',
}

const SPECIALITY_LABEL = {
  climber:  'GRIMPEUR',
  sprinter: 'SPRINTER',
  rouleur:  'ROULEUR',
  puncheur: 'PUNCHEUR',
  gc:       'G.C.',
}

// Dimensions fixes par taille — la carte ne dépend plus de flex-1
const SIZE = {
  sm: {
    card:      'w-28',
    image:     'h-32',
    name:      'text-[0.6rem]',
    team:      'text-[0.5rem]',
    stat:      'text-[0.45rem]',
    badge:     'text-[0.45rem]',
    number:    'text-[0.4rem]',
    barH:      'h-1',
    padding:   'px-1.5',
    showStats: false,
  },
  md: {
    card:      'w-40',
    image:     'h-44',
    name:      'text-[0.75rem]',
    team:      'text-[0.55rem]',
    stat:      'text-[0.55rem]',
    badge:     'text-[0.5rem]',
    number:    'text-[0.45rem]',
    barH:      'h-1.5',
    padding:   'px-2',
    showStats: true,
  },
  lg: {
    card:      'w-52',
    image:     'h-56',
    name:      'text-sm',
    team:      'text-[0.6rem]',
    stat:      'text-[0.6rem]',
    badge:     'text-[0.55rem]',
    number:    'text-[0.5rem]',
    barH:      'h-1.5',
    padding:   'px-3',
    showStats: true,
  },
}

export default function CyclistCard({ card, revealed = true, size = 'md', className = '' }) {
  const s  = SIZE[size] ?? SIZE.md

  // ── Carte dos (non révélée) ──────────────────────────────────────────────
  if (!revealed || !card) {
    return (
      <div className={clsx(
        'rounded-xl border border-gold-dark/60 bg-noir-50 select-none',
        'flex flex-col items-center justify-center gap-1',
        s.card, className,
      )} style={{ minHeight: size === 'sm' ? 168 : size === 'md' ? 260 : 320 }}>
        <div className="font-display tracking-widest text-gold-400/20" style={{ fontSize: '0.55rem' }}>
          VÉLOCARDS
        </div>
        <div style={{ fontSize: size === 'sm' ? '1.2rem' : '1.8rem' }}>🚴</div>
        <div className="font-mono text-gold-400/10" style={{ fontSize: '0.4rem' }}>UCI PRO</div>
      </div>
    )
  }

  const rc          = RARITY_CONFIG[card.rarity] ?? RARITY_CONFIG.common
  const isLegendary = card.rarity === 'legendary'

  const statBar = (value, max = 100) => {
    const pct = Math.min((value / max) * 100, 100)
    return (
      <div className={clsx('w-full bg-noir-200 rounded-full overflow-hidden', s.barH)}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #C9A84C 0%, #F0D080 100%)',
          }}
        />
      </div>
    )
  }

  const stats = [
    { key: 'climbing',  label: 'GRI', max: 100  },
    { key: 'sprint',    label: 'SPR', max: 2000 },
    { key: 'endurance', label: 'END', max: 100  },
    { key: 'ttRating',  label: 'CLM', max: 100  },
  ]

  return (
    <div
      className={clsx(
        'relative rounded-xl border flex flex-col select-none overflow-hidden',
        'transition-transform duration-200 hover:scale-[1.03]',
        rc.border, rc.bg,
        isLegendary && 'shadow-legendary card-legendary-shine',
        s.card,
        className,
      )}
    >
      {/* ── Bandeau rareté + numéro ──────────────────────────────────────── */}
      <div className={clsx('flex items-center justify-between pt-1.5 pb-1', s.padding)}>
        <span className={clsx('font-mono tracking-widest text-gold-400/40', s.number)}>
          {card.cardNumber ?? '—'}
        </span>
        <span className={clsx(
          'font-mono tracking-widest px-1.5 py-0.5 rounded font-bold',
          s.badge,
          card.rarity === 'legendary' && 'bg-yellow-900/60 text-gold-200',
          card.rarity === 'epic'      && 'bg-purple-900/60 text-purple-300',
          card.rarity === 'rare'      && 'bg-blue-900/60 text-blue-300',
          card.rarity === 'common'    && 'bg-gray-800/60 text-gray-300',
        )}>
          {rc.label.toUpperCase()}
        </span>
      </div>

      {/* ── Zone image ───────────────────────────────────────────────────── */}
      <div className={clsx('relative mx-1.5 rounded-lg overflow-hidden bg-noir-200 shrink-0', s.image)}>
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <div style={{ fontSize: size === 'sm' ? '2rem' : size === 'md' ? '2.8rem' : '3.5rem' }}>
              {SPECIALITY_ICON[card.speciality] ?? '🚴'}
            </div>
            <span className={clsx('font-mono text-gold-400/30', s.number)}>
              {card.nationality ?? '??'}
            </span>
          </div>
        )}

        {/* Dégradé bas de l'image → fondu vers la carte */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Spécialité flottante sur l'image */}
        {size !== 'sm' && (
          <div className="absolute bottom-1 left-1.5">
            <span className={clsx('font-mono tracking-widest', s.number, rc.color, 'opacity-80')}>
              {SPECIALITY_LABEL[card.speciality] ?? ''}
            </span>
          </div>
        )}

        {/* Shimmer légendaire */}
        {isLegendary && (
          <div className="absolute inset-0 bg-gradient-to-t from-gold-400/20 via-transparent to-transparent pointer-events-none" />
        )}
      </div>

      {/* ── Nom + équipe ─────────────────────────────────────────────────── */}
      <div className={clsx('pt-1.5 pb-0.5', s.padding)}>
        <div className={clsx('font-display tracking-wide leading-tight truncate font-bold', rc.color, s.name)}>
          {card.name}
        </div>
        <div className={clsx('font-mono text-gold-400/50 truncate leading-tight', s.team)}>
          {card.team}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      {s.showStats && card.stats && (
        <div className={clsx('pt-1 pb-2 space-y-1 border-t mt-1', s.padding)}
          style={{ borderColor: 'rgba(42,34,0,0.5)' }}>
          {stats.map(({ key, label, max }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={clsx('font-mono text-gold-400/40 shrink-0 w-6', s.stat)}>
                {label}
              </span>
              <div className="flex-1">
                {statBar(card.stats[key] ?? 0, max)}
              </div>
              <span className={clsx('font-mono text-gold-400/70 shrink-0 w-7 text-right', s.stat)}>
                {key === 'ftp'
                  ? (card.stats[key] ?? 0)
                  : (card.stats[key] ?? 0)}
              </span>
            </div>
          ))}
          {/* FTP séparé car unité différente */}
          <div className="flex items-center gap-1.5">
            <span className={clsx('font-mono text-gold-400/40 shrink-0 w-6', s.stat)}>FTP</span>
            <div className="flex-1">
              {statBar(((card.stats.ftp ?? 5) - 4) * 40, 100)}
            </div>
            <span className={clsx('font-mono text-gold-400/70 shrink-0 w-7 text-right', s.stat)}>
              {card.stats.ftp ?? 0}
            </span>
          </div>
        </div>
      )}

      {/* ── Pied de carte : saison ───────────────────────────────────────── */}
      <div className={clsx('pb-1 text-right', s.padding)}>
        <span className={clsx('font-mono text-gold-400/20', s.number)}>
          {card.season ?? 2025}
        </span>
      </div>
    </div>
  )
}
