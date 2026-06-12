import { getAllCards, createCard, updateCard } from '@/lib/firestore'
import { getDocs, collection, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// ── Colonnes attendues dans le CSV ───────────────────────────────────────────
const REQUIRED_COLS = ['cardNumber', 'name', 'team', 'nationality', 'speciality', 'rarity', 'season']
const STAT_COLS     = ['ftp', 'sprint', 'climbing', 'endurance', 'ttRating']
const ALL_COLS      = [...REQUIRED_COLS, ...STAT_COLS, 'imageUrl']

// ── Valeurs valides ──────────────────────────────────────────────────────────
const VALID_RARITIES     = ['common', 'rare', 'epic', 'legendary']
const VALID_SPECIALITIES = ['climber', 'sprinter', 'rouleur', 'puncheur', 'gc']

// ────────────────────────────────────────────────────────────────────────────
// PARSE CSV → tableau d'objets
// ────────────────────────────────────────────────────────────────────────────
export function parseCSV(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) throw new Error('Le fichier CSV est vide ou ne contient pas de données.')

  // Détecter le séparateur (, ou ;)
  const sep = lines[0].includes(';') ? ';' : ','

  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''))

  // Vérifier les colonnes requises
  const missing = REQUIRED_COLS.filter(c => !headers.includes(c))
  if (missing.length) {
    throw new Error(`Colonnes manquantes dans le CSV : ${missing.join(', ')}`)
  }

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i], sep)
    if (values.length !== headers.length) continue // ligne vide ou malformée

    const row = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.trim().replace(/^"|"$/g, '') ?? ''
    })
    rows.push(row)
  }

  return rows
}

// Split CSV en tenant compte des guillemets
function splitCSVLine(line, sep) {
  const result = []
  let current  = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes }
    else if (char === sep && !inQuotes) { result.push(current); current = '' }
    else { current += char }
  }
  result.push(current)
  return result
}

// ────────────────────────────────────────────────────────────────────────────
// VALIDER + TRANSFORMER une ligne CSV en carte Firestore
// ────────────────────────────────────────────────────────────────────────────
export function validateRow(row, index) {
  const errors = []
  const lineNum = index + 2 // +1 header, +1 base 1

  if (!row.cardNumber) errors.push(`Ligne ${lineNum} : cardNumber manquant`)
  if (!row.name)       errors.push(`Ligne ${lineNum} : name manquant`)
  if (!row.team)       errors.push(`Ligne ${lineNum} : team manquant`)
  if (!VALID_RARITIES.includes(row.rarity))
    errors.push(`Ligne ${lineNum} : rareté invalide "${row.rarity}" (valeurs : ${VALID_RARITIES.join(', ')})`)
  if (!VALID_SPECIALITIES.includes(row.speciality))
    errors.push(`Ligne ${lineNum} : spécialité invalide "${row.speciality}" (valeurs : ${VALID_SPECIALITIES.join(', ')})`)

  return errors
}

export function rowToCard(row) {
  return {
    cardNumber:  row.cardNumber,
    name:        row.name,
    team:        row.team,
    nationality: row.nationality ?? '',
    speciality:  row.speciality,
    rarity:      row.rarity,
    season:      parseInt(row.season) || 2025,
    imageUrl:    row.imageUrl ?? '',
    stats: {
      ftp:       parseFloat(row.ftp)      || 5.0,
      sprint:    parseInt(row.sprint)     || 1200,
      climbing:  parseInt(row.climbing)   || 50,
      endurance: parseInt(row.endurance)  || 50,
      ttRating:  parseInt(row.ttRating)   || 50,
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// PRÉVISUALISER l'import (comparer CSV avec Firestore)
// ────────────────────────────────────────────────────────────────────────────
export async function previewImport(csvText) {
  const rows    = parseCSV(csvText)
  const existing = await getAllCards()
  const byNumber = Object.fromEntries(existing.map(c => [c.cardNumber, c]))

  const preview  = { toCreate: [], toUpdate: [], errors: [] }

  rows.forEach((row, i) => {
    const errs = validateRow(row, i)
    if (errs.length) {
      preview.errors.push(...errs)
      return
    }
    const card = rowToCard(row)
    if (byNumber[card.cardNumber]) {
      preview.toUpdate.push({ ...card, _firestoreId: byNumber[card.cardNumber].id })
    } else {
      preview.toCreate.push(card)
    }
  })

  return preview
}

// ────────────────────────────────────────────────────────────────────────────
// EXÉCUTER l'import (create + update)
// ────────────────────────────────────────────────────────────────────────────
export async function executeImport(preview, onProgress) {
  const total = preview.toCreate.length + preview.toUpdate.length
  let done    = 0

  for (const card of preview.toCreate) {
    await createCard(card)
    done++
    onProgress?.(Math.round((done / total) * 100))
  }

  for (const card of preview.toUpdate) {
    const { _firestoreId, ...data } = card
    await updateCard(_firestoreId, data)
    done++
    onProgress?.(Math.round((done / total) * 100))
  }

  return { created: preview.toCreate.length, updated: preview.toUpdate.length }
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORT CARTES → CSV
// ────────────────────────────────────────────────────────────────────────────
export async function exportCardsToCSV() {
  const cards = await getAllCards()

  const headers = ALL_COLS.join(',')
  const rows = cards.map(c => [
    c.cardNumber  ?? '',
    csvEscape(c.name ?? ''),
    csvEscape(c.team ?? ''),
    c.nationality ?? '',
    c.speciality  ?? '',
    c.rarity      ?? '',
    c.season      ?? 2025,
    c.stats?.ftp       ?? 0,
    c.stats?.sprint    ?? 0,
    c.stats?.climbing  ?? 0,
    c.stats?.endurance ?? 0,
    c.stats?.ttRating  ?? 0,
    c.imageUrl    ?? '',
  ].join(','))

  return [headers, ...rows].join('\n')
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORT STATS → CSV
// ────────────────────────────────────────────────────────────────────────────
export async function exportStatsToCSV() {
  // Récupérer les données
  const [cardsSnap, usersSnap, packsSnap] = await Promise.all([
    getDocs(collection(db, 'cards')),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'packs')),
  ])

  const cards  = cardsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const users  = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const packs  = packsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Compter les obtentions par carte
  const cardCount = {}
  packs.forEach(p => {
    (p.cards ?? []).forEach(cardId => {
      cardCount[cardId] = (cardCount[cardId] ?? 0) + 1
    })
  })

  // Compter les ouvertures par booster
  const boosterCount = {}
  packs.forEach(p => {
    if (p.boosterId) boosterCount[p.boosterId] = (boosterCount[p.boosterId] ?? 0) + 1
  })

  const now = new Date().toLocaleDateString('fr-FR')

  // Section 1 : résumé global
  const summary = [
    '# RAPPORT VÉLOCARDS UCI — ' + now,
    '',
    '## RÉSUMÉ GLOBAL',
    'Métrique,Valeur',
    `Total cartes,${cards.length}`,
    `Total utilisateurs,${users.length}`,
    `Total boosters ouverts,${packs.length}`,
    `Points distribués,${users.reduce((s, u) => s + (u.points ?? 0), 0).toLocaleString()}`,
    '',
  ]

  // Section 2 : cartes les plus obtenues
  const cardStats = cards
    .map(c => ({ ...c, obtained: cardCount[c.id] ?? 0 }))
    .sort((a, b) => b.obtained - a.obtained)

  const cardStatsRows = [
    '## TOP CARTES OBTENUES',
    'Rang,Carte,Équipe,Rareté,Fois obtenue',
    ...cardStats.slice(0, 20).map((c, i) =>
      `${i + 1},${csvEscape(c.name)},${csvEscape(c.team)},${c.rarity},${c.obtained}`
    ),
    '',
  ]

  // Section 3 : répartition par rareté
  const byRarity = ['common', 'rare', 'epic', 'legendary'].map(r => ({
    rarity: r,
    count:  cards.filter(c => c.rarity === r).length,
    obtained: cards.filter(c => c.rarity === r).reduce((s, c) => s + (cardCount[c.id] ?? 0), 0),
  }))

  const rarityRows = [
    '## RÉPARTITION PAR RARETÉ',
    'Rareté,Nb cartes,Total obtentions',
    ...byRarity.map(r => `${r.rarity},${r.count},${r.obtained}`),
    '',
  ]

  return [...summary, ...cardStatsRows, ...rarityRows].join('\n')
}

// ────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ────────────────────────────────────────────────────────────────────────────
function csvEscape(str) {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function downloadCSV(content, filename) {
  const BOM  = '\uFEFF' // BOM UTF-8 pour Excel
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
