import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import teachpartnerIcon from '../assets/teachpartner.png'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) 
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert('Gagal login: ' + error.message)
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) {
      alert('Gagal login dengan Google: ' + error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tp-bg p-4 sm:p-6 bg-[radial-gradient(ellipse_at_0%_0%,rgba(125,211,167,0.25),transparent_50%),radial-gradient(ellipse_at_100%_100%,rgba(15,76,54,0.12),transparent_45%)]">
      <div className="grid w-full max-w-[920px] overflow-hidden rounded-3xl border border-tp-border bg-white shadow-tp-md md:grid-cols-2">
        
        {/* Kolom Kiri: Branding / Banner */}
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
              Kelola administrasi mengajar lebih mudah
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-white/80">
              Satu platform terintegrasi untuk perangkat ajar, bank soal, panduan dan e-book dan kebutuhan asesmen.
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

        {/* Kolom Kanan: Form Login */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-11 sm:py-12">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-tp-text">Masuk ke akun</h2>
          <p className="mb-7 text-sm text-tp-muted">Gunakan email anda atau lanjutkan dengan Google.</p>

          <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
            <div className="grid gap-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="nama@sekolah.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative flex items-center">
                <Input
                  id="login-password"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-tp-green hover:bg-tp-green-hover text-white font-semibold py-2.5 rounded-xl transition active:scale-[0.98]"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="my-[22px] flex items-center gap-3 text-[13px] text-tp-faint before:h-px before:flex-1 before:bg-tp-border after:h-px after:flex-1 after:bg-tp-border">
            Atau lanjutkan dengan
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2.5 rounded-xl border-tp-border text-tp-text hover:bg-gray-50 active:scale-[0.98]"
            onClick={handleGoogleLogin}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.17 21.31 7.26 24 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.19C.43 8.15 0 9.89 0 12s.43 3.85 1.19 5.39l4.08-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.26 0 3.17 2.69 1.19 6.61l4.08 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
            </svg>
            Masuk Menggunakan Akun Google
          </Button>

          <p className="mt-6 text-center text-[13px] text-tp-muted">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-tp-green hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}