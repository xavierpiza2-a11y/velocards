import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getAllBoosters } from '@/lib/firestore'
import BoosterCard   from '@/components/boosters/BoosterCard'
import BoosterOpener from '@/components/boosters/BoosterOpener'
import useAuthStore  from '@/hooks/useAuthStore'

export default function BoostersPage() {
  const [boosters, setBoosters] = useState([])
  const [loading, setLoading]   = useState(true)
  const [active, setActive]     = useState(null)   // booster en cours d'ouverture
  const { profile } = useAuthStore()

  useEffect(() => {
    getAllBoosters(true).then(b => {
      setBoosters(b)
      setLoading(false)
    })
  }, [])

  const handleClose = () => {
    setActive(null)
    // Rafraîchir les points affichés (le store sera mis à jour au prochain
    // rendu via onAuthStateChanged — suffisant pour l'UX)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[4px] text-gold-400/50 mb-1">
          BOUTIQUE
        </p>
        <h1 className="font-display text-4xl tracking-widest text-gold-200 mb-2">
          BOOSTERS
        </h1>
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gold-dark/60" />
          <span className="font-mono text-xs text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
            {(profile?.points ?? 0).toLocaleString()} pts disponibles
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="font-mono text-xs tracking-[4px] text-gold-400/40 animate-pulse">
            CHARGEMENT...
          </div>
        </div>
      ) : boosters.length === 0 ? (
        <div className="text-center py-20 panel">
          <div className="text-4xl mb-4">📦</div>
          <p className="font-display text-xl tracking-widest text-gold-400/40">
            AUCUN BOOSTER DISPONIBLE
          </p>
          <p className="font-body text-xs text-gold-400/30 mt-2">
            L'administrateur n'a pas encore créé de boosters.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 relative">
          {boosters.map(booster => (
            <BoosterCard
              key={booster.id}
              booster={booster}
              onOpen={setActive}
              disabled={(profile?.points ?? 0) < (booster.price ?? 0)}
            />
          ))}
        </div>
      )}

      {/* Modal ouverture */}
      <AnimatePresence>
        {active && (
          <BoosterOpener booster={active} onClose={handleClose} />
        )}
      </AnimatePresence>
    </div>
  )
}
