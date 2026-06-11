import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/hooks/useAuthStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [mode, setMode]         = useState('login') // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [busy, setBusy]         = useState(false)

  const { loginWithGoogle, loginWithEmail, register, user, error } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleEmail = async (e) => {
    e.preventDefault()
    setBusy(true)
    if (mode === 'login') {
      await loginWithEmail(email, password)
    } else {
      await register(email, password, name)
    }
    setBusy(false)
  }

  const handleGoogle = async () => {
    setBusy(true)
    await loginWithGoogle()
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-noir-400 flex items-center justify-center px-4">
      {/* Background décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-400/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl tracking-[8px] text-gold-400 mb-1">
            VÉLO<span className="text-gold-200">CARDS</span>
          </h1>
          <p className="font-mono text-[10px] tracking-[4px] text-gold-400/40">
            UCI PRO CYCLING SERIES
          </p>
          <div className="divider-gold" />
        </div>

        {/* Formulaire */}
        <div className="panel-elevated">
          {/* Tabs */}
          <div className="flex mb-6 bg-noir-100 rounded-lg p-0.5">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md font-mono text-xs tracking-widest transition-all duration-200 ${
                  mode === m
                    ? 'bg-gold-400 text-noir-900'
                    : 'text-gold-400/50 hover:text-gold-400/80'
                }`}
              >
                {m === 'login' ? 'CONNEXION' : 'INSCRIPTION'}
              </button>
            ))}
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === 'register' && (
              <input
                className="input-gold"
                placeholder="Pseudo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            )}
            <input
              className="input-gold"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="input-gold"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-gold w-full mt-2"
            >
              {busy ? '...' : mode === 'login' ? 'ENTRER' : "S'INSCRIRE"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gold-dark/60" />
            <span className="font-mono text-[10px] text-gold-400/30 tracking-widest">OU</span>
            <div className="flex-1 h-px bg-gold-dark/60" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="btn-outline-gold w-full flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            GOOGLE
          </button>
        </div>

        <p className="text-center font-mono text-[10px] text-gold-400/20 mt-6 tracking-widest">
          2 000 POINTS OFFERTS À L'INSCRIPTION
        </p>
      </div>
    </div>
  )
}
