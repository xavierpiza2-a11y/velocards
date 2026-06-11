import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CyclistCard from '@/components/cards/CyclistCard'
import { drawCards } from '@/lib/boosterEngine'
import {
  getAllCards, deductPoints, addCardToCollection, recordPackOpening,
} from '@/lib/firestore'
import useAuthStore from '@/hooks/useAuthStore'
import toast from 'react-hot-toast'

export default function BoosterOpener({ booster, onClose }) {
  const { user, profile } = useAuthStore()
  const [step, setStep]         = useState('confirm') // confirm → opening → reveal → done
  const [drawnCards, setDrawn]  = useState([])
  const [revealIdx, setRevealIdx] = useState(-1)      // index de la dernière carte révélée
  const [allCards, setAllCards] = useState([])

  useEffect(() => {
    getAllCards().then(setAllCards)
  }, [])

  const canAfford = (profile?.points ?? 0) >= (booster?.price ?? 0)

  const handleOpen = async () => {
    if (!canAfford) {
      toast.error('Points insuffisants')
      return
    }

    setStep('opening')

    try {
      // Tirage
      const cards = drawCards(booster, allCards)
      setDrawn(cards)

      // Déduire les points
      await deductPoints(user.uid, booster.price)

      // Ajouter à la collection
      await Promise.all(cards.map(c => addCardToCollection(user.uid, c.id)))

      // Enregistrer l'ouverture
      await recordPackOpening(user.uid, booster.id, cards)

      // Animer la révélation
      setStep('reveal')
      cards.forEach((_, i) => {
        setTimeout(() => setRevealIdx(i), i * 500 + 300)
      })
      setTimeout(() => setStep('done'), cards.length * 500 + 600)

    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de l\'ouverture')
      setStep('confirm')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-noir-100 border border-gold-400/40 rounded-2xl w-full max-w-2xl p-6 relative shadow-gold-lg"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gold-400/40 hover:text-gold-400 font-mono text-lg leading-none transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <p className="font-mono text-[10px] tracking-[4px] text-gold-400/40 mb-1">
            OUVERTURE DE BOOSTER
          </p>
          <h2 className="font-display text-2xl tracking-widest text-gold-200">
            {booster.name}
          </h2>
        </div>

        {/* ── Étape : confirmation ──────────────────────────────── */}
        {step === 'confirm' && (
          <div className="text-center space-y-6">
            <div className="text-6xl animate-float">{booster.icon ?? '📦'}</div>
            <div className="panel inline-block px-8 py-4">
              <div className="font-mono text-[10px] text-gold-400/40 tracking-widest mb-1">COÛT</div>
              <div className="font-display text-3xl text-gold-400 tracking-wider">
                {(booster.price ?? 0).toLocaleString()} pts
              </div>
              <div className="font-mono text-[10px] text-gold-400/30 mt-1">
                Solde : {(profile?.points ?? 0).toLocaleString()} pts
              </div>
            </div>
            {!canAfford && (
              <p className="font-mono text-xs text-red-400 tracking-widest">
                POINTS INSUFFISANTS
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={onClose} className="btn-ghost">Annuler</button>
              <button
                onClick={handleOpen}
                disabled={!canAfford || !allCards.length}
                className="btn-gold"
              >
                OUVRIR
              </button>
            </div>
          </div>
        )}

        {/* ── Étape : animation ouverture ──────────────────────── */}
        {step === 'opening' && (
          <div className="text-center py-10">
            <div className="text-5xl animate-pulse mb-4">{booster.icon ?? '📦'}</div>
            <p className="font-mono text-xs tracking-[4px] text-gold-400/60 animate-pulse">
              OUVERTURE EN COURS...
            </p>
          </div>
        )}

        {/* ── Étape : révélation ───────────────────────────────── */}
        {(step === 'reveal' || step === 'done') && (
          <div>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {drawnCards.map((card, i) => (
                <AnimatePresence key={card.id + i}>
                  {i <= revealIdx ? (
                    <motion.div
                      initial={{ rotateY: 90, scale: 0.8, opacity: 0 }}
                      animate={{ rotateY: 0,  scale: 1,   opacity: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                      <CyclistCard card={card} revealed size="md" />
                    </motion.div>
                  ) : (
                    <CyclistCard card={null} revealed={false} size="md" />
                  )}
                </AnimatePresence>
              ))}
            </div>

            {step === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
              >
                <p className="font-mono text-[10px] tracking-[3px] text-gold-400/50">
                  {drawnCards.length} CARTES AJOUTÉES À VOTRE COLLECTION
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={onClose} className="btn-ghost">Fermer</button>
                  <button onClick={handleOpen} disabled={!canAfford} className="btn-outline-gold">
                    OUVRIR UN AUTRE
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
