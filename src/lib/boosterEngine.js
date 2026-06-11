import { getAllCards, RARITY } from '@/lib/firestore'

/**
 * Sélectionne N cartes aléatoires depuis Firestore
 * en respectant les probabilités de rareté du booster.
 *
 * @param {Object} booster   - Définition du booster (cardCount, rarityRates)
 * @param {Array}  allCards  - Toutes les cartes disponibles
 * @returns {Array}          - Cartes tirées
 */
export function drawCards(booster, allCards) {
  if (!allCards.length) return []

  const result = []
  const { cardCount, rarityRates } = booster

  // Regrouper les cartes par rareté
  const byRarity = {
    common:    allCards.filter(c => c.rarity === 'common'),
    rare:      allCards.filter(c => c.rarity === 'rare'),
    epic:      allCards.filter(c => c.rarity === 'epic'),
    legendary: allCards.filter(c => c.rarity === 'legendary'),
  }

  // 1. Insérer la carte garantie (si configurée)
  if (rarityRates?.guaranteedRarity) {
    const pool = byRarity[rarityRates.guaranteedRarity]
    if (pool.length) {
      result.push(pickRandom(pool))
    }
  }

  // 2. Compléter avec des tirages pondérés
  while (result.length < cardCount) {
    const rarity = weightedRarityDraw()
    const pool   = byRarity[rarity]
    if (pool?.length) {
      result.push(pickRandom(pool))
    } else {
      // Fallback sur commun si pool vide
      const fallback = byRarity.common
      if (fallback.length) result.push(pickRandom(fallback))
    }
  }

  return result
}

/** Tirage pondéré d'une rareté selon les poids de RARITY */
function weightedRarityDraw() {
  const totalWeight = Object.values(RARITY).reduce((s, r) => s + r.weight, 0)
  let rand = Math.random() * totalWeight

  for (const rarity of Object.values(RARITY)) {
    rand -= rarity.weight
    if (rand <= 0) return rarity.key
  }
  return 'common'
}

/** Pioche une carte au hasard dans un tableau */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Constantes de rareté pour l'affichage */
export const RARITY_CONFIG = {
  common:    { label: 'Commun',     color: 'text-gray-400',   border: 'border-gray-600',   bg: 'bg-gray-800/40'   },
  rare:      { label: 'Rare',       color: 'text-blue-400',   border: 'border-blue-700',   bg: 'bg-blue-900/30'   },
  epic:      { label: 'Épique',     color: 'text-purple-400', border: 'border-purple-700', bg: 'bg-purple-900/30' },
  legendary: { label: 'Légendaire', color: 'text-gold-200',   border: 'border-gold-400',   bg: 'bg-gold-900/20'   },
}
