import { useEffect, useState } from 'react'
import { getUserCollection, getCard } from '@/lib/firestore'
import CyclistCard from '@/components/cards/CyclistCard'
import useAuthStore from '@/hooks/useAuthStore'
import { RARITY_CONFIG } from '@/lib/boosterEngine'

const RARITIES = ['all', 'common', 'rare', 'epic', 'legendary']

export default function CollectionPage() {
  const { user } = useAuthStore()
  const [cards,   setCards]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    if (!user) return
    loadCollection()
  }, [user])

  const loadCollection = async () => {
    setLoading(true)
    const entries = await getUserCollection(user.uid)
    const full = await Promise.all(
      entries.map(async e => {
        const card = await getCard(e.cardId)
        return card ? { ...card, count: e.count } : null
      })
    )
    setCards(full.filter(Boolean))
    setLoading(false)
  }

  const filtered = cards.filter(c => {
    if (filter !== 'all' && c.rarity !== filter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.team?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = RARITIES.slice(1).reduce((acc, r) => ({
    ...acc, [r]: cards.filter(c => c.rarity === r).length
  }), {})

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[4px] text-gold-400/50 mb-1">INVENTAIRE</p>
        <h1 className="font-display text-4xl tracking-widest text-gold-200 mb-4">MA COLLECTION</h1>

        {/* Compteurs par rareté */}
        <div className="flex flex-wrap gap-3 mb-4">
          {RARITIES.slice(1).map(r => (
            <div key={r} className={`rarity-${r} rarity-badge`}>
              {counts[r] ?? 0} {RARITY_CONFIG[r]?.label ?? r}
            </div>
          ))}
          <div className="font-mono text-[10px] text-gold-400/50 px-2 py-0.5">
            TOTAL : {cards.length}
          </div>
        </div>

        {/* Filtres + recherche */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-noir-50 rounded-lg p-0.5">
            {RARITIES.map(r => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-3 py-1.5 rounded-md font-mono text-[10px] tracking-widest transition-all duration-150 ${
                  filter === r
                    ? 'bg-gold-400 text-noir-900'
                    : 'text-gold-400/40 hover:text-gold-400/70'
                }`}
              >
                {r === 'all' ? 'TOUT' : r.toUpperCase()}
              </button>
            ))}
          </div>
          <input
            className="input-gold max-w-xs"
            placeholder="Rechercher coureur ou équipe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="font-mono text-xs tracking-[4px] text-gold-400/40 animate-pulse">
            CHARGEMENT...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 panel">
          <div className="text-4xl mb-4">📋</div>
          <p className="font-display text-xl tracking-widest text-gold-400/40">
            {cards.length === 0 ? 'COLLECTION VIDE' : 'AUCUN RÉSULTAT'}
          </p>
          <p className="font-body text-xs text-gold-400/30 mt-2">
            {cards.length === 0
              ? 'Ouvrez des boosters pour obtenir vos premières cartes !'
              : 'Essayez un autre filtre ou terme de recherche.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {filtered.map((card, i) => (
            <div key={card.id + i} className="relative">
              <CyclistCard card={card} revealed size="md" />
              {card.count > 1 && (
                <div className="absolute top-1.5 left-1.5 bg-gold-400 text-noir-900 font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {card.count}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
