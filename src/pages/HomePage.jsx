import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '@/hooks/useAuthStore'
import { getUserCollection, getAllCards } from '@/lib/firestore'

export default function HomePage() {
  const { user, profile } = useAuthStore()
  const [collectionCount, setCollectionCount] = useState(0)
  const [totalCards, setTotalCards]           = useState(0)

  useEffect(() => {
    if (!user) return
    getUserCollection(user.uid).then(c => setCollectionCount(c.length))
    getAllCards().then(c => setTotalCards(c.length))
  }, [user])

  const progress = totalCards > 0 ? Math.round((collectionCount / totalCards) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-14">
        <p className="font-mono text-[11px] tracking-[5px] text-gold-400/60 mb-3">
          UCI PRO CYCLING SERIES
        </p>
        <h1 className="font-display text-6xl sm:text-8xl tracking-[8px] text-gold-200 mb-2 leading-none">
          VÉLOCARDS
        </h1>
        <p className="font-body text-gold-400/40 text-sm tracking-widest mb-1">
          Collection officielle · Saison 2025
        </p>
        <div className="divider-gold" />

        {profile && (
          <p className="font-mono text-xs text-gold-400/50 tracking-widest mt-4">
            Bienvenue, <span className="text-gold-400">{profile.displayName}</span>
          </p>
        )}
      </div>

      {/* Stats perso */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'MES CARTES',  value: collectionCount },
          { label: 'TOTAL SÉRIE', value: totalCards || '—' },
          { label: 'COMPLÉTÉ',    value: `${progress}%` },
          { label: 'MES POINTS',  value: (profile?.points ?? 0).toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="panel text-center">
            <div className="font-display text-3xl text-gold-400 tracking-wider mb-1">
              {value}
            </div>
            <div className="font-mono text-[9px] tracking-[2px] text-gold-400/40">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Barre de progression collection */}
      <div className="panel mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-[10px] tracking-widest text-gold-400/50">
            PROGRESSION COLLECTION
          </span>
          <span className="font-mono text-xs text-gold-400">
            {collectionCount} / {totalCards}
          </span>
        </div>
        <div className="stat-bar-bg">
          <div
            className="stat-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/boosters" className="panel-elevated group hover:border-gold-400/60 transition-colors duration-200 cursor-pointer block">
          <div className="text-3xl mb-3">🚴</div>
          <div className="font-display text-lg tracking-widest text-gold-300 mb-1 group-hover:text-gold-200 transition-colors">
            OUVRIR UN BOOSTER
          </div>
          <p className="font-body text-xs text-gold-400/40">
            Découvrez de nouveaux coureurs et complétez votre collection.
          </p>
        </Link>

        <Link to="/collection" className="panel-elevated group hover:border-gold-400/60 transition-colors duration-200 cursor-pointer block">
          <div className="text-3xl mb-3">📋</div>
          <div className="font-display text-lg tracking-widest text-gold-300 mb-1 group-hover:text-gold-200 transition-colors">
            MA COLLECTION
          </div>
          <p className="font-body text-xs text-gold-400/40">
            Consultez et gérez toutes vos cartes obtenues.
          </p>
        </Link>

        <Link to="/marche" className="panel-elevated group hover:border-gold-400/60 transition-colors duration-200 cursor-pointer block">
          <div className="text-3xl mb-3">⚡</div>
          <div className="font-display text-lg tracking-widest text-gold-300 mb-1 group-hover:text-gold-200 transition-colors">
            MARCHÉ
          </div>
          <p className="font-body text-xs text-gold-400/40">
            Échangez vos doublons contre des points ou d'autres cartes.
          </p>
        </Link>
      </div>
    </div>
  )
}
