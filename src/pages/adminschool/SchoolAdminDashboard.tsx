import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import teachpartnerIcon from '../../assets/teachpartner.png'
import { Users, Building2, ShieldCheck, LogOut, Calendar, LayoutDashboard, GraduationCap } from 'lucide-react'

export default function SchoolAdminDashboard({ session }: { session: any }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const email = session?.user?.email ?? 'Admin Sekolah'
  const displayName = email.split('@')[0] || 'Admin'
  const initial = (email.charAt(0) || 'A').toUpperCase()

  // Menu Sidebar Khusus Admin Sekolah
  const menuItems = [
    { path: '/school-admin/dashboard', label: 'Ringkasan', icon: <LayoutDashboard size={18} /> },
    { path: '/school-admin/dashboard/school', label: 'Sekolah', icon: <Building2 size={18} /> },
    { path: '/school-admin/dashboard/academic-years', label: 'Tahun Akademik', icon: <Calendar size={18} /> },
    { path: '/school-admin/dashboard/classes', label: 'Kurikulum & Kelas', icon: <Users size={18} /> },
    { path: '/school-admin/dashboard/students', label: 'Daftar Murid', icon: <GraduationCap size={18} /> },
  ]

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) {
        navigate('/', { replace: true })
      }
    }
    checkSession()
  }, [navigate])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Gagal keluar:', error)
      setIsLoggingOut(false)
    }
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

      {/* Sidebar Admin Sekolah */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-tp-border bg-tp-sidebar px-5 py-7 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-9 flex items-center gap-2.5 px-2">
          <img src={teachpartnerIcon} alt="TeachPartner" className="h-[34px] w-[34px] object-contain" />
          <span className="font-bold text-tp-text text-sm">Panel B2B Sekolah</span>
        </div>

        <div className="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tp-faint">
          Menu Admin
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
              </button>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3.5">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-[11px] text-sm font-medium text-tp-muted transition hover:bg-rose-50 hover:text-rose-600"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Modal Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isLoggingOut && setShowLogoutModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-center text-xl font-bold text-gray-900">Keluar Sistem</h3>
            <p className="mb-6 text-center text-sm text-gray-600">Apakah Anda yakin ingin keluar dari Panel Admin Sekolah?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                {isLoggingOut ? 'Keluar...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Utama Kanan */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[260px]">
        <header className="flex items-center gap-4 px-4 py-3 sm:px-7 sm:py-4 bg-white border-b border-tp-border">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-tp-border bg-white text-tp-text lg:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <Building2 size={20} />
          </button>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="flex items-center gap-2.5 pl-1.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tp-green text-sm font-bold text-white">
                {initial}
              </div>
              <div className="hidden min-w-0 flex-col lg:flex">
                <strong className="max-w-[160px] truncate text-[13px] font-bold text-tp-text">{displayName}</strong>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <ShieldCheck size={12} /> Admin Sekolah
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full max-w-[1200px] px-4 pb-6 pt-6 sm:px-7 sm:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}