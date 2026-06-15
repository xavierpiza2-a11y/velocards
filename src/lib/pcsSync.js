// ── Client Parse.bot → ProCyclingStats ──────────────────────────────────────
// Endpoint de base Parse.bot pour ProCyclingStats
const PCS_BASE = 'https://api.parse.bot/scraper/cf66e8e3-c65a-4b3e-b418-c826000f01c2'

// La clé API est stockée dans les variables d'environnement Vite
const API_KEY = import.meta.env.VITE_PARSEBOTS_API_KEY

// Courses WorldTour utilisées comme source de données par saison
const RACE_SOURCES = {
  2025: 'race/tour-de-france/2025/startlist',
  2024: 'race/tour-de-france/2024/startlist',
  2023: 'race/tour-de-france/2023/startlist',
}

// ── Règles d'attribution de rareté basées sur le ranking UCI ────────────────
function assignRarity(rank) {
  if (rank <= 5)  return 'legendary'
  if (rank <= 20) return 'epic'
  if (rank <= 50) return 'rare'
  return 'common'
}

// ── Règles de spécialité basées sur le nom d'équipe et nationalité ───────────
// (heuristique simple — peut être affiné manuellement dans le CSV après export)
function guessSpeciality(riderName, teamName) {
  const name = riderName.toLowerCase()
  const team = teamName.toLowerCase()
  // Connus sprinters par nom de famille
  const sprinters = ['philipsen', 'milan', 'merlier', 'groenewegen', 'démare', 'ackermann',
    'de lie', 'bauhaus', 'girmay', 'coquard', 'capiot', 'dainese', 'groves']
  const climbers  = ['pogačar', 'vingegaard', 'evenepoel', 'roglič', 'gall', 'onley',
    'arensman', 'yates', "o'connor", 'barguil', 'vauquelin', 'higuita', 'buchmann',
    'martin', 'lipowitz', 'rubio', 'castrillo', 'rodriguez', 'mas', 'almeida']
  const tt = ['ganna', 'küng', 'bissegger', 'campenaerts', 'affini', 'foss']

  const lower = name.toLowerCase()
  if (sprinters.some(s => lower.includes(s))) return 'sprinter'
  if (climbers.some(c => lower.includes(c)))  return 'climber'
  if (tt.some(t => lower.includes(t)))        return 'rouleur'
  return 'rouleur'
}

// ── Stats réalistes basées sur la rareté + spécialité ───────────────────────
function generateStats(rarity, speciality, rankBonus = 0) {
  const base = {
    legendary: { ftp: 6.1, sprint: 1400, climbing: 93, endurance: 94, ttRating: 90 },
    epic:      { ftp: 5.6, sprint: 1280, climbing: 87, endurance: 88, ttRating: 82 },
    rare:      { ftp: 5.3, sprint: 1220, climbing: 80, endurance: 82, ttRating: 74 },
    common:    { ftp: 5.0, sprint: 1300, climbing: 68, endurance: 78, ttRating: 68 },
  }[rarity] || { ftp: 5.0, sprint: 1300, climbing: 68, endurance: 78, ttRating: 68 }

  // Ajuster selon la spécialité
  const modifiers = {
    climber:  { climbing: +8,  sprint: -200, ttRating: -5 },
    sprinter: { climbing: -20, sprint: +450, ttRating: -8, ftp: -0.3 },
    gc:       { climbing: +4,  ttRating: +5, endurance: +4 },
    puncheur: { climbing: +2,  sprint: +100 },
    rouleur:  { ttRating: +6,  endurance: +4 },
  }[speciality] || {}

  const jitter = () => Math.floor(Math.random() * 6) - 3 // ±3 de variation

  return {
    ftp:       Math.min(6.5, Math.max(4.5, parseFloat(((base.ftp + (modifiers.ftp || 0)) + jitter() * 0.05).toFixed(1)))),
    sprint:    Math.min(2200, Math.max(900, (base.sprint + (modifiers.sprint || 0)) + jitter() * 10)),
    climbing:  Math.min(99,  Math.max(30,  (base.climbing  + (modifiers.climbing  || 0)) + jitter())),
    endurance: Math.min(99,  Math.max(50,  (base.endurance + (modifiers.endurance || 0)) + jitter())),
    ttRating:  Math.min(99,  Math.max(40,  (base.ttRating  + (modifiers.ttRating  || 0)) + jitter())),
  }
}

// ── Formater le nom (PCS renvoie "NOM Prénom" en majuscules) ─────────────────
function formatName(rawName) {
  if (!rawName) return ''
  // PCS format : "POGAČAR Tadej" → "Tadej Pogačar"
  const parts = rawName.trim().split(' ')
  if (parts.length < 2) return rawName

  // Chercher où finissent les majuscules (nom de famille) et commence le prénom
  let lastUpperIdx = 0
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === parts[i].toUpperCase()) lastUpperIdx = i
  }

  const lastName  = parts.slice(0, lastUpperIdx + 1)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
  const firstName = parts.slice(lastUpperIdx + 1)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  return firstName ? `${firstName} ${lastName}` : lastName
}

// ── Normaliser le code pays (PCS utilise 2 lettres, on veut 3) ───────────────
const COUNTRY_MAP = {
  SI: 'SVN', BE: 'BEL', FR: 'FRA', NL: 'NED', DE: 'GER', GB: 'GBR',
  IT: 'ITA', ES: 'ESP', DK: 'DEN', NO: 'NOR', CH: 'SUI', AU: 'AUS',
  US: 'USA', PT: 'POR', CO: 'COL', EC: 'ECU', AT: 'AUT', PL: 'POL',
  ER: 'ERI', KZ: 'KAZ', LV: 'LAT', NZ: 'NZL', CZ: 'CZE', IE: 'IRL',
  AR: 'ARG', CA: 'CAN', RU: 'RUS', LU: 'LUX', HR: 'CRO', UA: 'UKR',
}

function normalizeCountry(code2) {
  return COUNTRY_MAP[code2?.toUpperCase()] ?? code2 ?? 'UCI'
}

// ────────────────────────────────────────────────────────────────────────────
// FONCTION PRINCIPALE : récupérer et convertir les coureurs depuis Parse.bot
// ────────────────────────────────────────────────────────────────────────────
export async function fetchRidersFromPCS(season = 2025, onProgress) {
  if (!API_KEY) {
    throw new Error('Clé API Parse.bot manquante (VITE_PARSEBOTS_API_KEY)')
  }

  onProgress?.('Connexion à ProCyclingStats...')

  // 1. Récupérer les résultats de course = liste de coureurs avec classement
  const raceUrl = RACE_SOURCES[season] ?? RACE_SOURCES[2025]

  const response = await fetch(
    `${PCS_BASE}/get_race_results?url=${encodeURIComponent(raceUrl)}`,
    {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Erreur API (${response.status}) : ${err.message ?? response.statusText}`)
  }

  const data = await response.json()

  onProgress?.('Traitement des données...')

  // 2. Extraire la liste des coureurs depuis la réponse
  // Parse.bot retourne { results: [...] } ou directement un tableau
  const rawRiders = data?.results ?? data?.startlist ?? data ?? []

  if (!Array.isArray(rawRiders) || rawRiders.length === 0) {
    throw new Error('Aucun coureur trouvé dans la réponse API. Vérifiez la saison ou réessayez.')
  }

  onProgress?.(`${rawRiders.length} coureurs récupérés, génération des cartes...`)

  // 3. Convertir en format carte VéloCards
  const cards = rawRiders.map((rider, index) => {
    const rank       = rider.rank ?? rider.rider_number ?? index + 1
    const rawName    = rider.rider_name ?? rider.name ?? ''
    const name       = formatName(rawName)
    const team       = rider.team_name ?? rider.team ?? 'UCI WorldTour'
    const nat2       = rider.nationality ?? rider.nat ?? ''
    const nationality = normalizeCountry(nat2)
    const speciality  = guessSpeciality(name, team)
    const rarity      = assignRarity(rank)
    const cardNumber  = `UCI-${season}-${String(index + 1).padStart(3, '0')}`

    return {
      cardNumber,
      name,
      team,
      nationality,
      speciality,
      rarity,
      season,
      imageUrl: '',
      stats: generateStats(rarity, speciality, rank),
    }
  })

  return cards
}

// ── Convertir un tableau de cartes en texte CSV ──────────────────────────────
export function cardsToCSV(cards) {
  const headers = 'cardNumber;name;team;nationality;speciality;rarity;season;ftp;sprint;climbing;endurance;ttRating;imageUrl'
  const rows = cards.map(c => [
    c.cardNumber,
    c.name,
    c.team,
    c.nationality,
    c.speciality,
    c.rarity,
    c.season,
    c.stats.ftp,
    c.stats.sprint,
    c.stats.climbing,
    c.stats.endurance,
    c.stats.ttRating,
    c.imageUrl ?? '',
  ].join(';'))

  return [headers, ...rows].join('\n')
}
