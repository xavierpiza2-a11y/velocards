import clsx from 'clsx'

const BOOSTER_ICONS = { peloton: '🚴', grimpeur: '⛰️', sprint: '⚡', default: '📦' }

export default function BoosterCard({ booster, onOpen, disabled = false }) {
  const icon = BOOSTER_ICONS[booster.id] ?? booster.icon ?? BOOSTER_ICONS.default
  const stars = Math.min(5, Math.ceil((booster.price ?? 1000) / 1200))

  return (
    <div className={clsx(
      'panel-elevated flex flex-col gap-3 transition-all duration-200 group',
      !disabled && 'hover:border-gold-400/60 hover:-translate-y-0.5 cursor-pointer',
      disabled && 'opacity-50',
    )}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-xl" />

      <div className="flex items-start justify-between">
        <div className="text-3xl">{icon}</div>
        <span className="font-mono text-[10px] text-gold-400/40 tracking-wider">
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </span>
      </div>

      <div>
        <div className="font-display text-lg tracking-[3px] text-gold-300 mb-0.5">
          {booster.name}
        </div>
        <p className="font-body text-xs text-gold-400/40 leading-relaxed">
          {booster.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gold-dark/40">
        <div>
          <span className="font-mono text-lg text-gold-400">
            {(booster.price ?? 0).toLocaleString()}
          </span>
          <span className="font-mono text-[10px] text-gold-400/40 ml-1">pts</span>
        </div>
        <span className="font-mono text-[10px] text-gold-400/40 tracking-widest">
          {booster.cardCount} CARTES
        </span>
      </div>

      {booster.rarityRates?.guaranteedRarity && (
        <div className="text-[10px] font-mono text-gold-400/40 tracking-wide -mt-1">
          ✓ {booster.rarityRates.guaranteedRarity.toUpperCase()} GARANTI
        </div>
      )}

      <button
        onClick={() => !disabled && onOpen?.(booster)}
        disabled={disabled}
        className="btn-outline-gold text-sm mt-1"
      >
        OUVRIR CE BOOSTER
      </button>
    </div>
  )
}
