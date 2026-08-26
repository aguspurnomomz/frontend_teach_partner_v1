import React, { useState } from 'react'
import axios from 'axios'
import teachpartnerIcon from '../../assets/teachpartner.png'

interface SuperAdminLoginPageProps {
  onLoginSuccess: (token: string, adminName: string) => void
}

// Icon Mata Terbuka
function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// Icon Mata Tertutup (Coret)
function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

export default function SuperAdminLoginPage({ onLoginSuccess }: SuperAdminLoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // <--- State untuk toggle visibilitas password
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const response = await axios.post(`${API_URL}/api/superadmin/superadmin-login`, {
        email,
        password,
      })

      const { token, nama } = response.data
      
      // Simpan token admin ke localStorage khusus superadmin
      localStorage.setItem('superadmin_token', token)
      localStorage.setItem('superadmin_name', nama)

      // Panggil callback untuk mengubah state di App.tsx
      onLoginSuccess(token, nama)
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error)
      } else {
        setErrorMsg('Gagal terhubung ke server backend.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tp-bg p-4 sm:p-6 bg-[radial-gradient(ellipse_at_0%_0%,rgba(125,211,167,0.25),transparent_50%),radial-gradient(ellipse_at_100%_100%,rgba(15,76,54,0.12),transparent_45%)]">
      <div className="grid w-full max-w-[920px] overflow-hidden rounded-3xl border border-tp-border bg-white shadow-tp-md md:grid-cols-2">
        
        {/* Kolom Kiri: Branding khusus Superadmin */}
        <div className="relative flex min-h-[auto] flex-col justify-between gap-7 overflow-hidden bg-gradient-to-br from-gray-900 via-[#112a20] to-[#0d3d2c] p-7 text-white md:min-h-[520px] md:gap-0 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(125,211,167,0.25),transparent_40%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.05),transparent_35%)]" />

          <div className="relative z-10 flex items-center gap-2.5 text-lg font-bold">
            <img 
              src={teachpartnerIcon} 
              alt="TeachPartner" 
              className="h-8 w-auto object-contain"
            />
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              Portal Superadmin
            </span>
          </div>

          <div className="relative z-10 py-0 md:py-6">
            <h2 className="mb-3 text-[22px] font-bold leading-snug tracking-tight md:text-[28px]">
              Pusat Kendali Sistem 
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-white/80">
              Akses khusus Role Super Admin internal pengelola system.
            </p>
          </div>

          <div className="relative z-10 text-xs text-white/55">
            © 2026 TeachPartner by{' '}
            <a 
              href="https://skoolago.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors duration-200 underline-offset-2 hover:underline"
            >
              SkoolaGo
            </a>
          </div>
        </div>

        {/* Kolom Kanan: Form Login Admin */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-11 sm:py-12">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-tp-text">Login Superadmin</h2>
          <p className="mb-6 text-sm text-tp-muted">Masukkan kredensial administrator internal Anda.</p>

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              {errorMsg}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleAdminLogin}>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-gray-700" htmlFor="admin-email">
                Email Administrator
              </label>
              <input
                id="admin-email"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-tp-text outline-none transition focus:border-tp-green focus:shadow-[0_0_0_3px_rgba(15,76,54,0.12)]"
                type="email"
                placeholder="super.admin@teachpartner.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-gray-700" htmlFor="admin-password">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="admin-password"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 pr-10 text-sm text-tp-text outline-none transition focus:border-tp-green focus:shadow-[0_0_0_3px_rgba(15,76,54,0.12)]"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-tp-green px-[18px] py-[11px] text-sm font-semibold text-white transition hover:bg-tp-green-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-65"
              disabled={loading}
            >
              {loading ? 'Memverifikasi...' : 'Masuk sebagai Superadmin'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-tp-muted">
            Kembali ke <a href="/" className="font-semibold text-tp-green hover:underline">Halaman Login Guru</a>
          </div>
        </div>
      </div>
    </div>
  )
}