import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import axios from 'axios'
import LoginPage from './pages/LoginPage'
import MainLayout from './components/MainLayout'
import DashboardOverview from './pages/DashboardOverview'
import QuestionBankPage from './pages/QuestionBankPage'
import ProfilePage from './pages/ProfilePage' 

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)

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
      const res = await axios.get('http://localhost:8080/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTokenBalance(res.data.token_balance)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center font-sans text-tp-muted">
        Memuat aplikasi...
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout session={session} />}>
          <Route path="/" element={<DashboardOverview tokenBalance={tokenBalance} />} />
          <Route path="/profile" element={<ProfilePage session={session} />} />
          <Route path="/question-bank" element={<QuestionBankPage onBack={() => window.location.href = '/'} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}