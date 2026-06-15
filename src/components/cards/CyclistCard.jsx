import { RARITY_CONFIG } from '@/lib/boosterEngine'
import clsx from 'clsx'

const SPECIALITY_ICON = {
  climber:  '⛰️',
  sprinter: '⚡',
  rouleur:  '🔄',
  puncheur: '👊',
  gc:       '🏆',
}

export default function CyclistCard({ card, revealed = true, size = 'md', className = '' }) {
  if (!card) return null

  const rc = RARITY_CONFIG[card.rarity] ?? RARITY_CONFIG.common
  const isLegendary = card.rarity === 'legendary'

  const sizeClasses = {
    sm: 'w-24 h-36 text-[8px]',
    md: 'w-36 h-52 text-[10px]',
    lg: 'w-48 h-72 text-xs',
  }

  const statBar = (value, max = 100) => (
    <div className="stat-bar-bg">
      <div className="stat-bar-fill" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
    </div>
  )

  if (!revealed) {
    return (
      <div className={clsx(
        'relative rounded-xl border border-gold-dark/60 bg-noir-50 flex items-center justify-center',
        'cursor-default select-none',
        sizeClasses[size],
        className,
      )}>
        <div className="text-center">
          <div className="font-display tracking-widest text-gold-400/30" style={{ fontSize: '0.6rem' }}>
            VÉLOCARDS
          </div>
          <div className="text-xl mt-1">🚴</div>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(
      'relative rounded-xl border flex flex-col overflow-hidden select-none',
      'transition-transform duration-200 hover:scale-[1.03]',
      rc.border, rc.bg,
      isLegendary && 'shadow-legendary card-legendary-shine',
      sizeClasses[size],
      className,
    )}>
      {/* Header rareté */}
      <div className={clsx('flex items-center justify-between px-2 pt-2 pb-1', rc.color)}>
        <span className="font-mono tracking-widest" style={{ fontSize: '0.55rem' }}>
          {card.cardNumber ?? '—'}
        </span>
        <span className={clsx('rarity-badge', `rarity-${card.rarity}`)}>
          {rc.label.toUpperCase()}
        </span>
      </div>

      {/* Image coureur (placeholder si pas d'image) */}
      <div className="flex-1 mx-2 rounded-lg bg-noir-200 overflow-hidden flex items-center justify-center relative">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-1">
              {SPECIALITY_ICON[card.speciality] ?? '🚴'}
            </div>
            <div className={clsx('font-mono', rc.color)} style={{ fontSize: '0.5rem' }}>
              {card.nationality ?? '??'}
            </div>
          </div>
        )}
        {isLegendary && (
          <div className="absolute inset-0 bg-gradient-to-t from-gold-400/10 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Nom + équipe */}
      <div className="px-2 pt-1.5">
        <div className={clsx('font-display tracking-wide leading-none truncate', rc.color)}
             style={{ fontSize: size === 'sm' ? '0.55rem' : '0.7rem' }}>
          {card.name}
        </div>
        <div className="font-mono text-gold-400/40 truncate" style={{ fontSize: '0.5rem' }}>
          {card.team}
        </div>
      </div>

      {/* Stats (masquées en taille sm) */}
      {size !== 'sm' && card.stats && (
        <div className="px-2 py-1.5 space-y-0.5">
          {[
            { key: 'climbing',  label: 'GRI' },
            { key: 'sprint',    label: 'SPR', max: 2000 },
            { key: 'endurance', label: 'END' },
          ].map(({ key, label, max = 100 }) => (
            <div key={key} className="flex items-center gap-1">
              <span className="font-mono text-gold-400/30 w-5 shrink-0" style={{ fontSize: '0.5rem' }}>
                {label}
              </span>
              <div className="flex-1">
                {statBar(card.stats[key] ?? 0, max)}
              </div>
              <span className="font-mono text-gold-400/50 w-6 text-right shrink-0" style={{ fontSize: '0.5rem' }}>
                {card.stats[key] ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Numéro de saison */}
      <div className="px-2 pb-1.5 text-right">
        <span className="font-mono text-gold-400/20" style={{ fontSize: '0.45rem' }}>
          {card.season ?? 2025}
        </span>
      </div>
    </div>
  )
}
