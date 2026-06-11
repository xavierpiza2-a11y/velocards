import {
  collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit,
  serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Collections ────────────────────────────────────────────────────────────
export const COLLECTIONS = {
  CARDS:    'cards',
  BOOSTERS: 'boosters',
  USERS:    'users',
  PACKS:    'packs',      // historique des ouvertures
}

// ─── Raretés ────────────────────────────────────────────────────────────────
export const RARITY = {
  COMMON:    { key: 'common',    label: 'Commun',    color: '#6B7280', weight: 60 },
  RARE:      { key: 'rare',      label: 'Rare',      color: '#3B82F6', weight: 28 },
  EPIC:      { key: 'epic',      label: 'Épique',    color: '#8B5CF6', weight: 10 },
  LEGENDARY: { key: 'legendary', label: 'Légendaire',color: '#F0D080', weight: 2  },
}

// ─── Modèle Carte ────────────────────────────────────────────────────────────
// {
//   id: string
//   name: string            — Nom du coureur
//   team: string            — Équipe UCI
//   nationality: string     — Code pays ISO
//   rarity: 'common'|'rare'|'epic'|'legendary'
//   season: number          — Ex: 2025
//   imageUrl: string        — Firebase Storage URL
//   stats: {
//     ftp: number           — Watts/kg FTP
//     sprint: number        — W max sprint
//     climbing: number      — Score grimpeur /100
//     endurance: number     — Score endurance /100
//     ttRating: number      — Score contre-la-montre /100
//   }
//   speciality: 'climber'|'sprinter'|'rouleur'|'puncheur'|'gc'
//   cardNumber: string      — Ex: "UCI-2025-001"
//   createdAt: Timestamp
//   updatedAt: Timestamp
// }

// ─── Modèle Booster ─────────────────────────────────────────────────────────
// {
//   id: string
//   name: string
//   description: string
//   price: number           — En points
//   cardCount: number       — Cartes par booster
//   icon: string            — Emoji ou URL
//   rarityRates: {          — Probabilités garanties
//     guaranteedRarity: 'common'|'rare'|'epic'|'legendary'|null
//   }
//   active: boolean
//   season: number
//   createdAt: Timestamp
// }

// ─── Helpers Firestore ───────────────────────────────────────────────────────

export async function getCard(cardId) {
  const snap = await getDoc(doc(db, COLLECTIONS.CARDS, cardId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getAllCards(filters = {}) {
  let q = collection(db, COLLECTIONS.CARDS)
  const constraints = []
  if (filters.rarity)     constraints.push(where('rarity', '==', filters.rarity))
  if (filters.team)       constraints.push(where('team', '==', filters.team))
  if (filters.season)     constraints.push(where('season', '==', filters.season))
  constraints.push(orderBy('cardNumber'))
  q = query(q, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getAllBoosters(activeOnly = true) {
  let q = collection(db, COLLECTIONS.BOOSTERS)
  if (activeOnly) q = query(q, where('active', '==', true), orderBy('price'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getUserCollection(uid) {
  const q = query(collection(db, COLLECTIONS.USERS, uid, 'collection'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ cardId: d.id, ...d.data() }))
}

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    points: 2000,   // Points de départ pour nouveaux utilisateurs
    role: 'user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function addCardToCollection(uid, cardId) {
  const ref = doc(db, COLLECTIONS.USERS, uid, 'collection', cardId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, { count: increment(1) })
  } else {
    await setDoc(ref, { count: 1, obtainedAt: serverTimestamp() })
  }
}

export async function deductPoints(uid, amount) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    points: increment(-amount),
    updatedAt: serverTimestamp(),
  })
}

export async function recordPackOpening(uid, boosterId, cards) {
  await addDoc(collection(db, COLLECTIONS.PACKS), {
    uid,
    boosterId,
    cards: cards.map(c => c.id),
    openedAt: serverTimestamp(),
  })
}

// ─── Admin helpers ───────────────────────────────────────────────────────────

export async function createCard(data) {
  return addDoc(collection(db, COLLECTIONS.CARDS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCard(cardId, data) {
  return updateDoc(doc(db, COLLECTIONS.CARDS, cardId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCard(cardId) {
  return deleteDoc(doc(db, COLLECTIONS.CARDS, cardId))
}

export async function createBooster(data) {
  return addDoc(collection(db, COLLECTIONS.BOOSTERS), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function updateBooster(boosterId, data) {
  return updateDoc(doc(db, COLLECTIONS.BOOSTERS, boosterId), data)
}

export async function setAdminRole(uid) {
  return updateDoc(doc(db, COLLECTIONS.USERS, uid), { role: 'admin' })
}
