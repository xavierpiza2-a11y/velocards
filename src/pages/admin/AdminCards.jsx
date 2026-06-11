import { useEffect, useState } from 'react'
import { getAllCards, createCard, updateCard, deleteCard } from '@/lib/firestore'
import CyclistCard from '@/components/cards/CyclistCard'
import toast from 'react-hot-toast'

const EMPTY_CARD = {
  name: '', team: '', nationality: '', rarity: 'common',
  season: 2025, imageUrl: '', speciality: 'rouleur', cardNumber: '',
  stats: { ftp: 5.0, sprint: 1200, climbing: 50, endurance: 50, ttRating: 50 },
}

const RARITIES     = ['common', 'rare', 'epic', 'legendary']
const SPECIALITIES = ['climber', 'sprinter', 'rouleur', 'puncheur', 'gc']

export default function AdminCards() {
  const [cards,  setCards]  = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null = liste, 'new' = nouveau, id = édition
  const [form,   setForm]   = useState(EMPTY_CARD)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const c = await getAllCards()
    setCards(c)
    setLoading(false)
  }

  const openNew  = () => { setForm({ ...EMPTY_CARD }); setEditing('new') }
  const openEdit = (card) => { setForm({ ...card }); setEditing(card.id) }
  const cancel   = () => { setEditing(null); setForm(EMPTY_CARD) }

  const save = async () => {
    if (!form.name || !form.team) { toast.error('Nom et équipe requis'); return }
    setSaving(true)
    try {
      if (editing === 'new') {
        await createCard(form)
        toast.success('Carte créée !')
      } else {
        await updateCard(editing, form)
        toast.success('Carte mise à jour !')
      }
      await load()
      cancel()
    } catch (err) {
      toast.error(err.message)
    }
    setSaving(false)
  }

  const remove = async (id) => {
    if (!confirm('Supprimer cette carte ?')) return
    await deleteCard(id)
    toast.success('Carte supprimée')
    await load()
  }

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setStat  = (key, val) => setForm(f => ({ ...f, stats: { ...f.stats, [key]: Number(val) } }))

  // ── Formulaire ──────────────────────────────────────────────────
  if (editing !== null) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={cancel} className="btn-ghost text-xs">← Retour</button>
          <h2 className="font-display text-2xl tracking-widest text-gold-200">
            {editing === 'new' ? 'NOUVELLE CARTE' : 'MODIFIER LA CARTE'}
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-6">
          {/* Formulaire */}
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label">Nom du coureur *</label>
                <input className="input-gold" value={form.name}
                  onChange={e => setField('name', e.target.value)} placeholder="Tadej Pogačar" />
              </div>
              <div>
                <label className="field-label">Équipe *</label>
                <input className="input-gold" value={form.team}
                  onChange={e => setField('team', e.target.value)} placeholder="UAE Team Emirates" />
              </div>
              <div>
                <label className="field-label">Nationalité (ISO)</label>
                <input className="input-gold" value={form.nationality}
                  onChange={e => setField('nationality', e.target.value)} placeholder="SVN" maxLength={3} />
              </div>
              <div>
                <label className="field-label">Numéro de carte</label>
                <input className="input-gold" value={form.cardNumber}
                  onChange={e => setField('cardNumber', e.target.value)} placeholder="UCI-2025-001" />
              </div>
              <div>
                <label className="field-label">Rareté</label>
                <select className="input-gold" value={form.rarity}
                  onChange={e => setField('rarity', e.target.value)}>
                  {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Spécialité</label>
                <select className="input-gold" value={form.speciality}
                  onChange={e => setField('speciality', e.target.value)}>
                  {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Saison</label>
                <input className="input-gold" type="number" value={form.season}
                  onChange={e => setField('season', Number(e.target.value))} />
              </div>
              <div>
                <label className="field-label">Image URL</label>
                <input className="input-gold" value={form.imageUrl}
                  onChange={e => setField('imageUrl', e.target.value)} placeholder="https://..." />
              </div>
            </div>

            {/* Stats */}
            <div className="panel">
              <p className="font-mono text-[10px] tracking-[3px] text-gold-400/50 mb-3">STATISTIQUES</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'climbing',  label: 'Grimpeur (/100)',   max: 100, step: 1 },
                  { key: 'sprint',    label: 'Sprint (W)',         max: 2500, step: 10 },
                  { key: 'endurance', label: 'Endurance (/100)',   max: 100, step: 1 },
                  { key: 'ttRating',  label: 'CLM (/100)',         max: 100, step: 1 },
                  { key: 'ftp',       label: 'FTP (W/kg)',         max: 8, step: 0.1 },
                ].map(({ key, label, max, step }) => (
                  <div key={key}>
                    <label className="field-label">{label}</label>
                    <div className="flex gap-2 items-center">
                      <input
                        className="input-gold flex-1"
                        type="number" min={0} max={max} step={step}
                        value={form.stats?.[key] ?? 0}
                        onChange={e => setStat(key, e.target.value)}
                      />
                      <span className="font-mono text-xs text-gold-400/40 w-10 text-right">
                        {form.stats?.[key] ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={cancel} className="btn-ghost">Annuler</button>
              <button onClick={save} disabled={saving} className="btn-gold">
                {saving ? 'Enregistrement...' : 'ENREGISTRER'}
              </button>
            </div>
          </div>

          {/* Aperçu */}
          <div className="flex flex-col items-center gap-2">
            <p className="font-mono text-[10px] tracking-[3px] text-gold-400/40">APERÇU</p>
            <CyclistCard card={form.name ? form : null} revealed size="lg" />
          </div>
        </div>
      </div>
    )
  }

  // ── Liste ────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-widest text-gold-200">CARTES</h2>
          <p className="font-mono text-[10px] text-gold-400/40 tracking-widest mt-0.5">
            {cards.length} CARTES DANS LA BASE
          </p>
        </div>
        <button onClick={openNew} className="btn-gold text-sm">+ NOUVELLE CARTE</button>
      </div>

      {loading ? (
        <div className="text-center py-10 font-mono text-xs text-gold-400/40 animate-pulse tracking-widest">
          CHARGEMENT...
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 panel">
          <p className="font-display text-xl tracking-widest text-gold-400/30 mb-3">AUCUNE CARTE</p>
          <button onClick={openNew} className="btn-outline-gold text-sm">Créer la première carte</button>
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map(card => (
            <div key={card.id}
              className="panel flex items-center gap-4 hover:border-gold-400/40 transition-colors">
              <div className={`rarity-${card.rarity} rarity-badge shrink-0`}>
                {card.rarity}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-body text-sm text-gold-200 truncate">{card.name}</div>
                <div className="font-mono text-[10px] text-gold-400/40">{card.team} · {card.cardNumber}</div>
              </div>
              <div className="font-mono text-[10px] text-gold-400/30 hidden sm:block">
                {card.season}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(card)} className="btn-ghost text-xs py-1 px-2">
                  ÉDITER
                </button>
                <button onClick={() => remove(card.id)}
                  className="font-mono text-[10px] text-red-500/60 hover:text-red-400 px-2 py-1 rounded transition-colors">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
