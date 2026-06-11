import { Navigate } from 'react-router-dom'
import useAuthStore from '@/hooks/useAuthStore'

export default function AdminGuard({ children }) {
  const isAdmin = useAuthStore(s => s.isAdmin)

  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }

  return children
}
