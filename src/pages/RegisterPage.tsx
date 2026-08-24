import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import teachpartnerIcon from '../assets/teachpartner.png'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Proses pendaftaran ke Supabase Auth
    const { error } = await supabase.auth.signUp({ 
      email, 
      password 
    })

    if (error) {
      alert('Gagal mendaftar: ' + error.message)
    } else {
      alert('Pendaftaran berhasil! Silakan masuk menggunakan akun baru Anda.')
      navigate('/') // Kembali ke halaman login utama
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tp-bg p-4 sm:p-6 bg-[radial-gradient(ellipse_at_0%_0%,rgba(125,211,167,0.25),transparent_50%),radial-gradient(ellipse_at_100%_100%,rgba(15,76,54,0.12),transparent_45%)]">
      <div className="grid w-full max-w-[920px] overflow-hidden rounded-3xl border border-tp-border bg-white shadow-tp-md md:grid-cols-2">
        
        {/* Kolom Kiri: Branding */}
        <div className="relative flex min-h-[auto] flex-col justify-between gap-7 overflow-hidden bg-gradient-to-br from-tp-green via-[#1a6b4a] to-[#0d3d2c] p-7 text-white md:min-h-[520px] md:gap-0 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(125,211,167,0.35),transparent_40%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.08),transparent_35%)]" />

          <div className="relative z-10 flex items-center gap-2.5 text-lg font-bold">
            <img 
              src={teachpartnerIcon} 
              alt="TeachPartner" 
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="relative z-10 py-0 md:py-6">
            <h2 className="mb-3 text-[22px] font-bold leading-snug tracking-tight md:text-[28px]">
              Mulai kelola administrasi mengajar Anda
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-white/80">
              Daftarkan akun Anda sekarang dan nikmati kemudahan pengelolaan perangkat ajar dalam satu platform terintegrasi.
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

        {/* Kolom Kanan: Form Pendaftaran */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-11 sm:py-12">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-tp-text">Buat Akun Baru</h2>
          <p className="mb-7 text-sm text-tp-muted">Daftar menggunakan email Anda.</p>

          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-gray-700" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-tp-text outline-none transition focus:border-tp-green focus:shadow-[0_0_0_3px_rgba(15,76,54,0.12)]"
                type="email"
                placeholder="nama@sekolah.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-gray-700" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-tp-text outline-none transition focus:border-tp-green focus:shadow-[0_0_0_3px_rgba(15,76,54,0.12)]"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-tp-green px-[18px] py-[11px] text-sm font-semibold text-white transition hover:bg-tp-green-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-65"
              disabled={loading}
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-tp-muted">
            Sudah punya akun?{' '}
            <Link to="/" className="font-semibold text-tp-green hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}