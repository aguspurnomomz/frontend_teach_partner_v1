import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import axios from 'axios'
import LoginPage from './pages/LoginPage'
import MainLayout from './components/MainLayout'
import DashboardOverview from './pages/DashboardOverview'
import QuestionBankPage from './pages/QuestionBankPage'
import ProfilePage from './pages/ProfilePage'

import SuperAdminLoginPage from './pages/superadmin/SuperAdminLoginPage'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('superadmin_token'))
  const [adminName, setAdminName] = useState<string>(localStorage.getItem('superadmin_name') || '')

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchTokenBalance(session.access_token)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchTokenBalance(session.access_token)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchTokenBalance = async (token: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTokenBalance(res.data.token_balance)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('superadmin_token')
    localStorage.removeItem('superadmin_name')
    setAdminToken(null)
    setAdminName('')
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center font-sans text-tp-muted">
        Memuat aplikasi...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Route Superadmin --- */}
        <Route 
          path="/superadmin/login" 
          element={
            adminToken ? (
              <Navigate to="/superadmin/dashboard" replace />
            ) : (
              <SuperAdminLoginPage 
                onLoginSuccess={(token, name) => {
                  setAdminToken(token)
                  setAdminName(name)
                }} 
              />
            )
          } 
        />
        <Route 
          path="/superadmin/dashboard" 
          element={
            adminToken ? (
              <SuperAdminDashboard 
                adminName={adminName} 
                onLogout={handleAdminLogout} 
              />
            ) : (
              <Navigate to="/superadmin/login" replace />
            )
          } 
        />

        {/* --- Route User guru --- */}
        <Route 
          path="/" 
          element={session ? <MainLayout session={session} /> : <LoginPage />}
        >
          <Route index element={<DashboardOverview tokenBalance={tokenBalance} />} />
          <Route path="profile" element={<ProfilePage session={session} />} />
          <Route path="question-bank" element={<QuestionBankPage onBack={() => window.location.href = '/'} />} />
        </Route>

        {/* --- 404 --- */}
        <Route 
          path="*" 
          element={
            <div className="grid min-h-screen place-items-center bg-tp-bg text-center p-6">
              <div>
                <h1 className="text-4xl font-bold text-tp-text mb-2">404</h1>
                <p className="text-sm text-tp-muted mb-4">Halaman yang Anda cari tidak ditemukan.</p>
                <a href="/" className="inline-block rounded-xl bg-tp-green px-4 py-2 text-xs font-semibold text-white transition hover:bg-tp-green-hover">
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}