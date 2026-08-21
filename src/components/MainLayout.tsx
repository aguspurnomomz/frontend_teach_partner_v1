import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

export default function MainLayout({ session }: { session: any }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const email = session?.user?.email ?? ''
  const displayName = email.split('@')[0] || 'Guru'
  const initial = (email.charAt(0) || 'G').toUpperCase()

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <IconHome /> },
    { path: '/question-bank', label: 'Bank Soal', icon: <IconBook />, badge: 'AI' },
    { path: '/profile', label: 'Identitas', icon: <IconSettings /> },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-tp-bg">
      <button
        type="button"
        className={`fixed inset-0 z-40 border-0 bg-slate-900/40 p-0 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        aria-label="Tutup menu"
        onClick={closeSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-tp-border bg-tp-sidebar px-5 py-7 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-9 flex items-center gap-2.5 px-2">
          <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-tp-green text-xs font-bold text-white">
            TP
          </div>
          <span className="text-lg font-bold tracking-tight text-tp-text">TeachPartner</span>
        </div>

        <div className="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tp-faint">
          Menu
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                type="button"
                className={`relative flex w-full items-center gap-3 rounded-[10px] px-3 py-[11px] text-left text-sm transition ${
                  active
                    ? 'font-semibold text-tp-green before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-r before:bg-tp-green'
                    : 'font-medium text-tp-muted hover:bg-tp-green/5 hover:text-tp-text'
                }`}
                onClick={() => {
                  navigate(item.path)
                  closeSidebar()
                }}
              >
                {item.icon}
                {item.label}
                {item.badge ? (
                  <span className="ml-auto rounded-lg bg-tp-green px-[7px] py-0.5 text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3.5">
          <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-tp-green to-[#1a6b4a] p-5 text-white">
            <div className="pointer-events-none absolute -top-10 -right-8 h-[140px] w-[140px] rounded-full bg-tp-mint/20" />
            <h4 className="relative mb-1.5 text-sm font-bold">Aplikasi Mobile</h4>
            <p className="relative mb-3.5 text-xs leading-snug text-white/75">
              Akses perangkat ajar & bank soal dari mana saja.
            </p>
            <button
              type="button"
              className="relative inline-flex w-full items-center justify-center rounded-xl bg-white px-3.5 py-2 text-[13px] font-semibold text-tp-green"
            >
              Download
            </button>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-[11px] text-sm font-medium text-tp-muted transition hover:bg-rose-50 hover:text-rose-600"
            onClick={handleLogout}
          >
            <IconLogout />
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[260px]">
        <header className="flex items-center gap-4 px-4 py-3 sm:px-7 sm:py-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-tp-border bg-white text-tp-text lg:hidden"
            aria-label="Buka menu"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <IconMenu />
          </button>

          <div className="flex max-w-none flex-1 items-center gap-2.5 rounded-full border border-tp-border bg-white px-4 py-2.5 text-tp-faint lg:max-w-[420px]">
            <IconSearch />
            <input
              type="search"
              placeholder="Cari perangkat, soal, atau kelas..."
              aria-label="Pencarian"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-tp-text outline-none"
            />
            <kbd className="hidden rounded-md border border-tp-border bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-tp-faint sm:inline">
              ⌘ F
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <button
              type="button"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-tp-border bg-white text-tp-muted transition hover:bg-gray-50 hover:text-tp-text sm:inline-flex"
              aria-label="Pesan"
            >
              <IconMail />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-tp-border bg-white text-tp-muted transition hover:bg-gray-50 hover:text-tp-text"
              aria-label="Notifikasi"
            >
              <IconBell />
            </button>
            <div className="flex items-center gap-2.5 pl-1.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tp-green text-sm font-bold text-white">
                {initial}
              </div>
              <div className="hidden min-w-0 flex-col lg:flex">
                <strong className="max-w-[160px] truncate text-[13px] font-bold text-tp-text">{displayName}</strong>
                <span className="max-w-[160px] truncate text-xs text-tp-faint">{email}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full max-w-[1200px] px-4 pb-6 pt-2 sm:px-7 sm:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
