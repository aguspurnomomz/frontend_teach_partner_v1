import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import axios from 'axios'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import DisclaimerPage from './pages/DisclaimerPage'

import MainLayout from './components/MainLayout'
import DashboardOverview from './pages/DashboardOverview'
import QuestionBankPage from './pages/QuestionBankPage'
import ProfilePage from './pages/ProfilePage'
import EbooksPage from './pages/EbooksPage' 
import BillingPage from './pages/BillingPage'

import SuperAdminLoginPage from './pages/superadmin/SuperAdminLoginPage'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import SuperAdminEbooks from './pages/superadmin/SuperAdminEbooks'

// Dedupe /api/profile antar Strict Mode remount (dev) untuk token yang sama
let lastProfileTokenFetched: string | null = null

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('superadmin_token'))
  const [adminName, setAdminName] = useState<string>(localStorage.getItem('superadmin_name') || '')

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    let cancelled = false

    const fetchTokenBalance = async (token: string) => {
      if (!token || token === lastProfileTokenFetched) return
      lastProfileTokenFetched = token
      try {
        const res = await axios.get(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!cancelled) setTokenBalance(res.data.token_balance)
      } catch (e) {
        console.error(e)
        lastProfileTokenFetched = null
      }
    }

    // getSession hanya hydrate UI — fetch profile cukup dari onAuthStateChange
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setSession(session)
      if (session) {
        fetchTokenBalance(session.access_token)
      } else {
        lastProfileTokenFetched = null
        setTokenBalance(0)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [API_URL])

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
        <Route 
          path="/superadmin/ebooks" 
          element={
            adminToken ? (
              <SuperAdminEbooks />
            ) : (
              <Navigate to="/superadmin/login" replace />
            )
          } 
        />

        {/* --- Route Register (Publik) --- */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />

        {/* --- Route User guru --- */}
        <Route 
          path="/" 
          element={session ? <MainLayout session={session} /> : <LoginPage />}
        >
          <Route index element={<DashboardOverview tokenBalance={tokenBalance} />} />
          <Route path="profile" element={<ProfilePage session={session} />} />
          <Route path="question-bank" element={<QuestionBankPage onBack={() => window.location.href = '/'} />} />
          <Route path="ebooks" element={<EbooksPage />} /> 
          <Route path="billing" element={<BillingPage />} />
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