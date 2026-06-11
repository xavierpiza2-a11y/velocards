import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import useAuthStore from '@/hooks/useAuthStore'
import Layout       from '@/components/layout/Layout'
import AuthGuard    from '@/components/layout/AuthGuard'
import AdminGuard   from '@/components/layout/AdminGuard'

// Pages (lazy pour perf)
import { lazy, Suspense } from 'react'
const HomePage       = lazy(() => import('@/pages/HomePage'))
const BoostersPage   = lazy(() => import('@/pages/BoostersPage'))
const CollectionPage = lazy(() => import('@/pages/CollectionPage'))
const MarketPage     = lazy(() => import('@/pages/MarketPage'))
const LoginPage      = lazy(() => import('@/pages/LoginPage'))
const AdminPage      = lazy(() => import('@/pages/admin/AdminPage'))
const AdminCards     = lazy(() => import('@/pages/admin/AdminCards'))
const AdminBoosters  = lazy(() => import('@/pages/admin/AdminBoosters'))
const AdminUsers     = lazy(() => import('@/pages/admin/AdminUsers'))

const PageLoader = () => (
  <div className="min-h-screen bg-noir-400 flex items-center justify-center">
    <div className="text-center">
      <div className="font-display text-4xl text-gold-400 tracking-widest mb-4 animate-pulse">
        VÉLOCARDS
      </div>
      <div className="w-8 h-0.5 bg-gold-400 mx-auto animate-pulse" />
    </div>
  </div>
)

export default function App() {
  const init = useAuthStore(s => s.init)

  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color:      '#F0D080',
            border:     '1px solid #2A2200',
            fontFamily: 'Inter, sans-serif',
            fontSize:   '14px',
          },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#0A0A0A' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#0A0A0A' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* App principale */}
          <Route element={<AuthGuard><Layout /></AuthGuard>}>
            <Route index               element={<HomePage />} />
            <Route path="boosters"     element={<BoostersPage />} />
            <Route path="collection"   element={<CollectionPage />} />
            <Route path="marche"       element={<MarketPage />} />

            {/* Admin */}
            <Route path="admin" element={<AdminGuard><AdminPage /></AdminGuard>}>
              <Route index              element={<Navigate to="cards" replace />} />
              <Route path="cards"       element={<AdminCards />} />
              <Route path="boosters"    element={<AdminBoosters />} />
              <Route path="users"       element={<AdminUsers />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
