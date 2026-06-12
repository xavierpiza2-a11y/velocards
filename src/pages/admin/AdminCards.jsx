import { useEffect, useState, useRef } from 'react'
import { getAllCards, createCard, updateCard, deleteCard } from '@/lib/firestore'
import {
  previewImport, executeImport,
  exportCardsToCSV, exportStatsToCSV, downloadCSV,
} from '@/lib/csvImport'
import CyclistCard from '@/components/cards/CyclistCard'
import toast from 'react-hot-toast'

const EMPTY_CARD = {
  name: '', team: '', nationality: '', rarity: 'common',
  season: 2025, imageUrl: '', speciality: 'rouleur', cardNumber: '',
  stats: { ftp: 5.0, sprint: 1200, climbing: 50, endurance: 50, ttRating: 50 },
}
const RARITIES     = ['common', 'rare', 'epic', 'legendary']
const SPECIALITIES = ['climber', 'sprinter', 'rouleur', 'puncheur', 'gc']

// ── Modal Import CSV ─────────────────────────────────────────────────────────
function ImportModal({ onClose, onDone }) {
  const [step, setStep]         = useState('pick')   // pick → preview → importing → done
  const [preview, setPreview]   = useState(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState(null)
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      setStep('loading')
      const p = await previewImport(text)
      setPreview(p)
      setStep('preview')
    } catch (err) {
      toast.error(err.message)
      setStep('pick')
    }
  }

  const handleConfirm = async () => {
    if (!preview) return
    setStep('importing')
    try {
      const res = await executeImport(preview, setProgress)
      setResult(res)
      setStep('done')
      onDone?.()
    } catch (err) {
      toast.error(err.message)
      setStep('preview')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-noir-100 border border-gold-400/40 rounded-2xl w-full max-w-lg p-6 relative">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gold-400/40 hover:text-gold-400 font-mono text-lg">✕</button>

        <p className="font-mono text-[10px] tracking-[4px] text-gold-400/40 mb-1">ADMINISTRATION</p>
        <h2 className="font-display text-xl tracking-widest text-gold-200 mb-6">IMPORTER CSV</h2>

        {/* ── Sélection fichier ── */}
        {step === 'pick' && (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed rounded-xl p-10 cursor-pointer hover:border-gold-400/60 transition-colors"
              style={{ borderColor: 'rgba(201,168,76,0.2)' }}
              onClick={() => fileRef.current?.click()}>
              <div className="text-4xl mb-3">📄</div>
              <p className="font-mono text-xs tracking-widest text-gold-400/50">
                CLIQUER POUR SÉLECTIONNER UN FICHIER .CSV
              </p>
              <p className="font-body text-[11px] text-gold-400/30 mt-2">
                Séparateur virgule ou point-virgule · UTF-8
              </p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            <a href="/coureurs-uci-2025.csv" download
              className="inline-block font-mono text-[10px] tracking-widest text-gold-400/40 hover:text-gold-400 underline underline-offset-2 transition-colors">
              ↓ Télécharger le modèle CSV
            </a>
          </div>
        )}

        {/* ── Chargement ── */}
        {step === 'loading' && (
          <div className="text-center py-10">
            <div className="font-mono text-xs tracking-[4px] text-gold-400/50 animate-pulse">ANALYSE EN COURS...</div>
          </div>
        )}

        {/* ── Prévisualisation ── */}
        {step === 'preview' && preview && (
          <div className="space-y-4">
            {/* Résumé */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'À CRÉER',    value: preview.toCreate.length, color: 'text-green-400' },
                { label: 'À METTRE À JOUR', value: preview.toUpdate.length, color: 'text-gold-400' },
                { label: 'ERREURS',    value: preview.errors.length,  color: 'text-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="panel text-center">
                  <div className={`font-display text-2xl ${color}`}>{value}</div>
                  <div className="font-mono text-[8px] tracking-widest text-gold-400/40 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Erreurs */}
            {preview.errors.length > 0 && (
              <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-3 max-h-32 overflow-y-auto">
                {preview.errors.map((e, i) => (
                  <p key={i} className="font-mono text-[10px] text-red-400">{e}</p>
                ))}
              </div>
            )}

            {/* Aperçu cartes à créer */}
            {preview.toCreate.length > 0 && (
              <div>
                <p className="font-mono text-[10px] tracking-widest text-gold-400/40 mb-2">
                  NOUVELLES CARTES (aperçu)
                </p>
                <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto">
                  {preview.toCreate.slice(0, 6).map((c, i) => (
                    <CyclistCard key={i} card={c} revealed size="sm" />
                  ))}
                  {preview.toCreate.length > 6 && (
                    <div className="flex items-center font-mono text-xs text-gold-400/40">
                      +{preview.toCreate.length - 6} autres
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-ghost">Annuler</button>
              <button
                onClick={handleConfirm}
                disabled={preview.toCreate.length + preview.toUpdate.length === 0}
                className="btn-gold flex-1">
                CONFIRMER L'IMPORT ({preview.toCreate.length + preview.toUpdate.length} cartes)
              </button>
            </div>
          </div>
        )}

        {/* ── Import en cours ── */}
        {step === 'importing' && (
          <div className="text-center py-8 space-y-4">
            <div className="font-mono text-xs tracking-[4px] text-gold-400/50 animate-pulse">
              IMPORT EN COURS...
            </div>
            <div className="stat-bar-bg mx-8">
              <div className="stat-bar-fill transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="font-display text-2xl text-gold-400">{progress}%</div>
          </div>
        )}

        {/* ── Terminé ── */}
        {step === 'done' && result && (
          <div className="text-center space-y-4 py-4">
            <div className="text-5xl">✅</div>
            <p className="font-display text-xl tracking-widest text-gold-200">IMPORT RÉUSSI</p>
            <div className="panel inline-block px-8 py-3">
              <p className="font-mono text-sm text-green-400">+{result.created} créées</p>
              <p className="font-mono text-sm text-gold-400">↑ {result.updated} mises à jour</p>
            </div>
            <button onClick={onClose} className="btn-gold block w-full mt-2">FERMER</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page principale AdminCards ────────────────────────────────────────────────
export default function AdminCards() {
  const [cards,    setCards]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY_CARD)
  const [saving,   setSaving]   = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [exporting,  setExporting]  = useState(false)

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
    } catch (err) { toast.error(err.message) }
    setSaving(false)
  }

  const remove = async (id) => {
    if (!confirm('Supprimer cette carte ?')) return
    await deleteCard(id)
    toast.success('Carte supprimée')
    await load()
  }

  const handleExportCards = async () => {
    setExporting(true)
    try {
      const csv = await exportCardsToCSV()
      const date = new Date().toISOString().slice(0, 10)
      downloadCSV(csv, `velocards-export-${date}.csv`)
      toast.success('Export téléchargé !')
    } catch (err) { toast.error(err.message) }
    setExporting(false)
  }

  const handleExportStats = async () => {
    setExporting(true)
    try {
      const csv = await exportStatsToCSV()
      const date = new Date().toISOString().slice(0, 10)
      downloadCSV(csv, `velocards-stats-${date}.csv`)
      toast.success('Rapport téléchargé !')
    } catch (err) { toast.error(err.message) }
    setExporting(false)
  }

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setStat  = (key, val) => setForm(f => ({ ...f, stats: { ...f.stats, [key]: Number(val) } }))

  // ── Formulaire édition ───────────────────────────────────────────
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
            <div className="panel">
              <p className="font-mono text-[10px] tracking-[3px] text-gold-400/50 mb-3">STATISTIQUES</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'climbing',  label: 'Grimpeur (/100)', max: 100,  step: 1   },
                  { key: 'sprint',    label: 'Sprint (W)',       max: 2500, step: 10  },
                  { key: 'endurance', label: 'Endurance (/100)', max: 100,  step: 1   },
                  { key: 'ttRating',  label: 'CLM (/100)',       max: 100,  step: 1   },
                  { key: 'ftp',       label: 'FTP (W/kg)',       max: 8,    step: 0.1 },
                ].map(({ key, label, max, step }) => (
                  <div key={key}>
                    <label className="field-label">{label}</label>
                    <div className="flex gap-2 items-center">
                      <input className="input-gold flex-1" type="number" min={0} max={max} step={step}
                        value={form.stats?.[key] ?? 0}
                        onChange={e => setStat(key, e.target.value)} />
                      <span className="font-mono text-xs w-10 text-right" style={{ color: 'rgba(201,168,76,0.4)' }}>
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
          <div className="flex flex-col items-center gap-2">
            <p className="font-mono text-[10px] tracking-[3px]" style={{ color: 'rgba(201,168,76,0.4)' }}>APERÇU</p>
            <CyclistCard card={form.name ? form : null} revealed size="lg" />
          </div>
        </div>
      </div>
    )
  }

  // ── Liste + barre d'actions ──────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-widest text-gold-200">CARTES</h2>
          <p className="font-mono text-[10px] tracking-widest mt-0.5" style={{ color: 'rgba(201,168,76,0.4)' }}>
            {cards.length} CARTES DANS LA BASE
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {/* Export stats */}
          <button onClick={handleExportStats} disabled={exporting}
            className="btn-ghost text-xs flex items-center gap-1.5 border rounded-lg px-3 py-2"
            style={{ borderColor: 'rgba(42,34,0,0.6)' }}
            title="Exporter un rapport d'activité">
            📊 RAPPORT
          </button>

          {/* Export cartes */}
          <button onClick={handleExportCards} disabled={exporting}
            className="btn-ghost text-xs flex items-center gap-1.5 border rounded-lg px-3 py-2"
            style={{ borderColor: 'rgba(42,34,0,0.6)' }}
            title="Exporter toutes les cartes en CSV">
            ↓ EXPORTER CSV
          </button>

          {/* Import */}
          <button onClick={() => setShowImport(true)}
            className="btn-outline-gold text-xs px-4 py-2">
            ↑ IMPORTER CSV
          </button>

          {/* Nouvelle carte */}
          <button onClick={openNew} className="btn-gold text-xs px-4 py-2">
            + NOUVELLE CARTE
          </button>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-10 font-mono text-xs animate-pulse tracking-widest"
          style={{ color: 'rgba(201,168,76,0.4)' }}>
          CHARGEMENT...
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 panel space-y-4">
          <p className="font-display text-xl tracking-widest" style={{ color: 'rgba(201,168,76,0.3)' }}>
            AUCUNE CARTE
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowImport(true)} className="btn-outline-gold text-sm">
              ↑ Importer un CSV
            </button>
            <button onClick={openNew} className="btn-gold text-sm">
              + Créer manuellement
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map(card => (
            <div key={card.id}
              className="panel flex items-center gap-4 hover:border-gold-400/40 transition-colors">
              <div className={`rarity-${card.rarity} rarity-badge shrink-0`}>{card.rarity}</div>
              <div className="flex-1 min-w-0">
                <div className="font-body text-sm text-gold-200 truncate">{card.name}</div>
                <div className="font-mono text-[10px] truncate" style={{ color: 'rgba(201,168,76,0.4)' }}>
                  {card.team} · {card.cardNumber}
                </div>
              </div>
              <div className="font-mono text-[10px] hidden sm:block" style={{ color: 'rgba(201,168,76,0.3)' }}>
                {card.season}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(card)} className="btn-ghost text-xs py-1 px-2">ÉDITER</button>
                <button onClick={() => remove(card.id)}
                  className="font-mono text-[10px] px-2 py-1 rounded transition-colors"
                  style={{ color: 'rgba(239,68,68,0.6)' }}
                  onMouseEnter={e => e.target.style.color = '#f87171'}
                  onMouseLeave={e => e.target.style.color = 'rgba(239,68,68,0.6)'}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal import */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onDone={load}
        />
      )}
    </div>
  )
}
