import { useEffect, useState } from 'react'
import { getAllBoosters, createBooster, updateBooster } from '@/lib/firestore'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '', description: '', price: 1500,
  cardCount: 5, icon: '📦', active: true,
  season: 2025, rarityRates: { guaranteedRarity: null },
}

const RARITIES = ['', 'common', 'rare', 'epic', 'legendary']

export default function AdminBoosters() {
  const [boosters, setBoosters] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const b = await getAllBoosters(false)
    setBoosters(b)
    setLoading(false)
  }

  const openNew  = () => { setForm({ ...EMPTY }); setEditing('new') }
  const openEdit = b => { setForm({ ...b });       setEditing(b.id)  }
  const cancel   = () => { setEditing(null) }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name) { toast.error('Nom requis'); return }
    setSaving(true)
    try {
      if (editing === 'new') {
        await createBooster(form)
        toast.success('Booster créé !')
      } else {
        await updateBooster(editing, form)
        toast.success('Booster mis à jour !')
      }
      await load()
      cancel()
    } catch (err) {
      toast.error(err.message)
    }
    setSaving(false)
  }

  const toggleActive = async (b) => {
    await updateBooster(b.id, { active: !b.active })
    await load()
    toast.success(b.active ? 'Booster désactivé' : 'Booster activé')
  }

  if (editing !== null) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={cancel} className="btn-ghost text-xs">← Retour</button>
          <h2 className="font-display text-2xl tracking-widest text-gold-200">
            {editing === 'new' ? 'NOUVEAU BOOSTER' : 'MODIFIER LE BOOSTER'}
          </h2>
        </div>

        <div className="panel max-w-lg space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="field-label">Nom *</label>
              <input className="input-gold" value={form.name}
                onChange={e => setField('name', e.target.value)} placeholder="Booster Peloton" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Description</label>
              <textarea className="input-gold resize-none" rows={2} value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="5 cartes issues des équipes WorldTour..." />
            </div>
            <div>
              <label className="field-label">Prix (pts)</label>
              <input className="input-gold" type="number" min={0} value={form.price}
                onChange={e => setField('price', Number(e.target.value))} />
            </div>
            <div>
              <label className="field-label">Nb de cartes</label>
              <input className="input-gold" type="number" min={1} max={10} value={form.cardCount}
                onChange={e => setField('cardCount', Number(e.target.value))} />
            </div>
            <div>
              <label className="field-label">Icône (emoji)</label>
              <input className="input-gold" value={form.icon}
                onChange={e => setField('icon', e.target.value)} placeholder="📦" />
            </div>
            <div>
              <label className="field-label">Saison</label>
              <input className="input-gold" type="number" value={form.season}
                onChange={e => setField('season', Number(e.target.value))} />
            </div>
            <div>
              <label className="field-label">Rareté garantie</label>
              <select className="input-gold"
                value={form.rarityRates?.guaranteedRarity ?? ''}
                onChange={e => setField('rarityRates', { guaranteedRarity: e.target.value || null })}>
                {RARITIES.map(r => (
                  <option key={r} value={r}>{r || '— aucune —'}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <label className="font-mono text-[10px] tracking-widest text-gold-400/50">ACTIF</label>
              <button
                type="button"
                onClick={() => setField('active', !form.active)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                  form.active ? 'bg-gold-400' : 'bg-noir-50'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  form.active ? 'left-5' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={cancel} className="btn-ghost">Annuler</button>
            <button onClick={save} disabled={saving} className="btn-gold">
              {saving ? 'Enregistrement...' : 'ENREGISTRER'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-widest text-gold-200">BOOSTERS</h2>
          <p className="font-mono text-[10px] text-gold-400/40 tracking-widest mt-0.5">
            {boosters.length} BOOSTER(S) CONFIGURÉ(S)
          </p>
        </div>
        <button onClick={openNew} className="btn-gold text-sm">+ NOUVEAU BOOSTER</button>
      </div>

      {loading ? (
        <div className="text-center py-10 font-mono text-xs text-gold-400/40 animate-pulse tracking-widest">
          CHARGEMENT...
        </div>
      ) : boosters.length === 0 ? (
        <div className="text-center py-16 panel">
          <p className="font-display text-xl tracking-widest text-gold-400/30 mb-3">AUCUN BOOSTER</p>
          <button onClick={openNew} className="btn-outline-gold text-sm">Créer le premier booster</button>
        </div>
      ) : (
        <div className="space-y-2">
          {boosters.map(b => (
            <div key={b.id}
              className="panel flex items-center gap-4 hover:border-gold-400/40 transition-colors">
              <span className="text-xl shrink-0">{b.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-body text-sm text-gold-200">{b.name}</div>
                <div className="font-mono text-[10px] text-gold-400/40">
                  {(b.price ?? 0).toLocaleString()} pts · {b.cardCount} cartes · saison {b.season}
                </div>
              </div>
              <div className={`font-mono text-[9px] tracking-widest px-2 py-0.5 rounded shrink-0 ${
                b.active ? 'bg-green-900/40 text-green-400' : 'bg-noir-50 text-gold-400/30'
              }`}>
                {b.active ? 'ACTIF' : 'INACTIF'}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => toggleActive(b)} className="btn-ghost text-xs py-1 px-2">
                  {b.active ? 'DÉSACTIVER' : 'ACTIVER'}
                </button>
                <button onClick={() => openEdit(b)} className="btn-ghost text-xs py-1 px-2">
                  ÉDITER
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
