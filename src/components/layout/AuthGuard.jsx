import { Navigate } from 'react-router-dom'
import useAuthStore from '@/hooks/useAuthStore'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-400 flex items-center justify-center">
        <div className="font-display text-3xl text-gold-400 tracking-widest animate-pulse">
          VÉLOCARDS
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
