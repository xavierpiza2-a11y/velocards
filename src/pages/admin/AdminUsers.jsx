import { useEffect, useState } from 'react'
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const toggleAdmin = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    await updateDoc(doc(db, 'users', u.id), { role: newRole })
    toast.success(`${u.displayName} → ${newRole}`)
    await load()
  }

  const addPoints = async (u, amount) => {
    const { increment, updateDoc: upd, doc: d } = await import('firebase/firestore')
    const { db: database } = await import('@/lib/firebase')
    await updateDoc(doc(db, 'users', u.id), {
      points: (u.points ?? 0) + amount,
    })
    toast.success(`+${amount} pts pour ${u.displayName}`)
    await load()
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl tracking-widest text-gold-200">UTILISATEURS</h2>
        <p className="font-mono text-[10px] text-gold-400/40 tracking-widest mt-0.5">
          {users.length} COMPTE(S) ENREGISTRÉ(S)
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 font-mono text-xs text-gold-400/40 animate-pulse tracking-widest">
          CHARGEMENT...
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id}
              className="panel flex flex-wrap items-center gap-3 hover:border-gold-400/40 transition-colors">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gold-400/20 border border-gold-400/30 flex items-center justify-center shrink-0">
                {u.photoURL
                  ? <img src={u.photoURL} className="w-full h-full rounded-full object-cover" alt="" />
                  : <span className="font-display text-xs text-gold-400">
                      {(u.displayName ?? '?')[0].toUpperCase()}
                    </span>
                }
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="font-body text-sm text-gold-200 truncate">{u.displayName ?? '—'}</div>
                <div className="font-mono text-[10px] text-gold-400/40 truncate">{u.email}</div>
              </div>

              {/* Points */}
              <div className="font-mono text-xs text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20 shrink-0">
                {(u.points ?? 0).toLocaleString()} pts
              </div>

              {/* Rôle */}
              <div className={`font-mono text-[9px] tracking-widest px-2 py-0.5 rounded shrink-0 ${
                u.role === 'admin'
                  ? 'bg-gold-400/20 text-gold-300 border border-gold-400/30'
                  : 'bg-noir-50 text-gold-400/30'
              }`}>
                {(u.role ?? 'user').toUpperCase()}
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => addPoints(u, 1000)}
                  className="btn-ghost text-[10px] py-1 px-2 tracking-wide"
                  title="Ajouter 1 000 pts"
                >
                  +1k pts
                </button>
                <button
                  onClick={() => toggleAdmin(u)}
                  className={`font-mono text-[10px] px-2 py-1 rounded transition-colors ${
                    u.role === 'admin'
                      ? 'text-red-400/60 hover:text-red-400'
                      : 'text-gold-400/40 hover:text-gold-400/80'
                  }`}
                >
                  {u.role === 'admin' ? 'RETIRER ADMIN' : 'ADMIN'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
