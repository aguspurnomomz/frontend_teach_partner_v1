import * as Sentry from '@sentry/react'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import teachpartnerIcon from '../../assets/teachpartner.png'

interface UserItem {
  id: string
  nama_guru: string
  nip_guru: string
  nama_sekolah: string
  mata_pelajaran: string
  token_balance: number
  is_active: boolean
  last_login: string | null
  updated_at: string
}

interface EbookItem {
  id: string
  judul: string
  jenjang: string
  mata_pelajaran: string
  kategori: string
  cover_url: string
  file_url: string
  created_at: string
}

interface LogItem {
  id: number
  email: string
  action: string
  ip_address: string
  user_agent: string
  details: string
  created_at: string
}

interface SuperAdminDashboardProps {
  adminName: string
  onLogout: () => void
}

type AdminView = 'dashboard' | 'users' | 'ebooks' | 'security'

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M12 6h6" />
      <path d="M12 10h6" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

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

export default function SuperAdminDashboard({ adminName, onLogout }: SuperAdminDashboardProps) {
  const [users, setUsers] = useState<UserItem[]>([])
  const [ebooks, setEbooks] = useState<EbookItem[]>([])
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeView, setActiveView] = useState<AdminView>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')

  // State Form Modal Tambah E-Book
  const [showModal, setShowModal] = useState(false)
  const [judul, setJudul] = useState('')
  const [jenjang, setJenjang] = useState('SMA/MA')
  const [mataPelajaran, setMataPelajaran] = useState('')
  const [kategori, setKategori] = useState('Kurikulum Merdeka')
  const [coverUrl, setCoverUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // State Form Ganti Password & Visibility
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  const initial = (adminName?.charAt(0) || 'S').toUpperCase()

  const fetchRegisteredUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('superadmin_token')
      const res = await axios.get(`${API_URL}/api/superadmin/registered-users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data.users || [])
      setErrorMsg('')
    } catch (err: any) {
      setErrorMsg('Gagal memuat data pengguna.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEbooks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('superadmin_token')
      const res = await axios.get(`${API_URL}/api/superadmin/ebooks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEbooks(res.data.ebooks || [])
      setErrorMsg('')
    } catch (err: any) {
      setErrorMsg('Gagal memuat data e-book.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('superadmin_token')
      const res = await axios.get(`${API_URL}/api/superadmin/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLogs(res.data.logs || [])
    } catch (err) {
      console.error('Gagal memuat log aktivitas:', err)
    }
  }

  useEffect(() => {
    fetchRegisteredUsers()
    fetchEbooks()
    fetchLogs()
  }, [])

  // Fungsi Pengujian Sentry
  const handleTestSentryFrontend = () => {
    try {
      throw new Error('Test Error dari Frontend React Superadmin!')
    } catch (err) {
      Sentry.captureException(err)
      alert('Berhasil! Error tes Frontend telah dikirim ke Sentry.')
    }
  }

  const handleTestSentryBackend = async () => {
    try {
      await axios.get(`${API_URL}/debug-sentry`)
    } catch (err: any) {
      alert('Berhasil! Endpoint tes Backend berhasil dipicu (Status 500). Cek dashboard Sentry Anda.')
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const actionText = currentStatus ? 'memblokir' : 'mengaktifkan kembali'
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} pengguna ini?`)) return

    try {
      const token = localStorage.getItem('superadmin_token')
      await axios.patch(
        `${API_URL}/api/superadmin/users/${userId}/status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchRegisteredUsers()
    } catch (err: any) {
      alert('Gagal mengubah status pengguna.')
      console.error(err)
    }
  }

  const handleCreateEbook = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem('superadmin_token')
      await axios.post(
        `${API_URL}/api/superadmin/ebooks`,
        {
          judul,
          jenjang,
          mata_pelajaran: mataPelajaran,
          kategori,
          cover_url: coverUrl,
          file_url: fileUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('E-book berhasil ditambahkan!')
      setShowModal(false)
      setJudul('')
      setMataPelajaran('')
      setKategori('Kurikulum Merdeka')
      setCoverUrl('')
      setFileUrl('')
      fetchEbooks()
    } catch (err: any) {
      alert('Gagal menambah e-book: ' + (err.response?.data?.error || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEbook = async (id: string, judulBuku: string) => {
    if (!window.confirm(`Yakin ingin menghapus e-book "${judulBuku}"?`)) return

    try {
      const token = localStorage.getItem('superadmin_token')
      await axios.delete(`${API_URL}/api/superadmin/ebooks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('E-book berhasil dihapus.')
      fetchEbooks()
    } catch (err: any) {
      alert('Gagal menghapus e-book: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok!')
      return
    }

    const confirmSave = window.confirm('Apakah Anda yakin ingin menyimpan kata sandi baru ini?')
    if (!confirmSave) return

    setChangingPass(true)
    try {
      const token = localStorage.getItem('superadmin_token')
      await axios.post(
        `${API_URL}/api/superadmin/change-password`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Kata sandi berhasil diubah!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      fetchLogs()
    } catch (err: any) {
      alert('Gagal mengubah kata sandi: ' + (err.response?.data?.error || err.message))
    } finally {
      setChangingPass(false)
    }
  }

  const stats = useMemo(() => {
    const active = users.filter((u) => u.is_active).length
    const blocked = users.length - active
    const tokens = users.reduce((sum, u) => sum + (Number(u.token_balance) || 0), 0)
    return { total: users.length, active, blocked, tokens, totalEbooks: ebooks.length }
  }, [users, ebooks])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      [u.nama_guru, u.nip_guru, u.nama_sekolah, u.mata_pelajaran]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [users, search])

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <IconHome /> },
    { id: 'users' as const, label: 'User Guru', icon: <IconUsers />, badge: String(stats.total) },
    { id: 'ebooks' as const, label: 'Kelola E-Book', icon: <IconBook />, badge: String(stats.totalEbooks) },
    { id: 'security' as const, label: 'Keamanan & Log', icon: <IconShield /> },
  ]

  const openView = (view: AdminView) => {
    setActiveView(view)
    setSidebarOpen(false)
    if (view === 'users') fetchRegisteredUsers()
    if (view === 'ebooks') fetchEbooks()
    if (view === 'security') fetchLogs()
  }

  return (
    <div className="flex min-h-screen bg-tp-bg">
      <button
        type="button"
        className={`fixed inset-0 z-40 border-0 bg-slate-900/40 p-0 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        aria-label="Tutup menu"
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-tp-border bg-tp-sidebar px-5 py-7 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-9 flex items-center gap-2.5 px-2">
          <img src={teachpartnerIcon} alt="TeachPartner" className="h-7 w-auto object-contain" />
        </div>

        <div className="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tp-faint">
          Menu
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {menuItems.map((item) => {
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`relative flex w-full items-center gap-3 rounded-[10px] px-3 py-[11px] text-left text-sm transition ${
                  active
                    ? 'font-semibold text-tp-green before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-r before:bg-tp-green'
                    : 'font-medium text-tp-muted hover:bg-tp-green/5 hover:text-tp-text'
                }`}
                onClick={() => openView(item.id)}
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

        <div className="mt-auto">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-[11px] text-sm font-medium text-tp-muted transition hover:bg-rose-50 hover:text-rose-600"
            onClick={onLogout}
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

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-tp-faint">Superadmin Panel</p>
            <h2 className="text-sm font-bold text-tp-text sm:text-base">
              {activeView === 'dashboard'
                ? 'Dashboard'
                : activeView === 'users'
                ? 'User Guru Terdaftar'
                : activeView === 'ebooks'
                ? 'Kelola E-Book Referensi'
                : 'Keamanan & Log'}
            </h2>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tp-green text-sm font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-col">
                <strong className="block max-w-[160px] truncate text-[13px] font-bold text-tp-text">
                  {adminName || 'Superadmin'}
                </strong>
                <span className="text-xs text-tp-faint">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full max-w-[1200px] px-4 pb-6 pt-2 sm:px-7 sm:pb-8">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          {activeView === 'dashboard' ? (
            <div>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="mb-1 text-2xl font-bold tracking-tight text-tp-text sm:text-[28px]">Dashboard</h1>
                  <p className="text-sm text-tp-muted">Ringkasan aktivitas dan pengguna sistem TeachPartner.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { fetchRegisteredUsers(); fetchEbooks(); }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-tp-border bg-white px-[18px] py-[11px] text-sm font-semibold text-tp-text transition hover:bg-gray-50"
                >
                  <IconRefresh /> Muat Ulang
                </button>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-green bg-tp-green p-[22px] text-white shadow-tp sm:min-h-[140px]">
                  <span className="text-[13px] font-medium text-white/80">User Terdaftar</span>
                  <div className="text-[32px] font-bold leading-none tracking-tight text-white">
                    {loading ? '—' : stats.total}
                  </div>
                  <div className="mt-auto text-xs text-white/70">Total guru di sistem</div>
                </div>

                <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-border bg-white p-[22px] shadow-tp sm:min-h-[140px]">
                  <span className="text-[13px] font-medium text-tp-muted">Akun Aktif</span>
                  <div className="text-[32px] font-bold leading-none tracking-tight text-tp-text">
                    {loading ? '—' : stats.active}
                  </div>
                  <div className="mt-auto text-xs text-tp-faint">Bisa login ke platform</div>
                </div>

                <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-border bg-white p-[22px] shadow-tp sm:min-h-[140px]">
                  <span className="text-[13px] font-medium text-tp-muted">Total E-Book</span>
                  <div className="text-[32px] font-bold leading-none tracking-tight text-tp-text">
                    {loading ? '—' : stats.totalEbooks}
                  </div>
                  <div className="mt-auto text-xs text-tp-faint">Referensi buku tersedia</div>
                </div>

                <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-border bg-white p-[22px] shadow-tp sm:min-h-[140px]">
                  <span className="text-[13px] font-medium text-tp-muted">Total Token</span>
                  <div className="text-[32px] font-bold leading-none tracking-tight text-tp-text">
                    {loading ? '—' : stats.tokens}
                  </div>
                  <div className="mt-auto text-xs text-tp-faint">Saldo AI seluruh guru</div>
                </div>
              </div>
            </div>
          ) : activeView === 'users' ? (
            <div>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="mb-1 text-2xl font-bold tracking-tight text-tp-text sm:text-[28px]">User Guru</h1>
                  <p className="text-sm text-tp-muted">
                    {loading ? 'Memuat...' : `${stats.total} guru terdaftar di sistem.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, NIP, atau sekolah..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-tp-text outline-none transition focus:border-tp-green focus:shadow-[0_0_0_3px_rgba(15,76,54,0.12)] sm:w-64"
                  />
                  <button
                    type="button"
                    onClick={fetchRegisteredUsers}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-tp-border bg-white px-4 py-2.5 text-xs font-semibold text-tp-text transition hover:bg-gray-50"
                  >
                    <IconRefresh /> Muat Ulang
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-tp-border bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-tp-border bg-gray-50 text-xs font-semibold uppercase tracking-wider text-tp-muted">
                      <tr>
                        <th className="px-6 py-4">Nama Guru & NIP</th>
                        <th className="px-6 py-4">Sekolah & Mata Pelajaran</th>
                        <th className="px-6 py-4 text-center">Token</th>
                        <th className="px-6 py-4 text-center">Status Akun</th>
                        <th className="px-6 py-4">Login Terakhir</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tp-border">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-tp-muted">
                            Memuat data pengguna...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-tp-muted">
                            {search ? 'Tidak ada guru yang cocok dengan pencarian.' : 'Belum ada pengguna terdaftar.'}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="transition hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-tp-text">{user.nama_guru || 'Tanpa Nama'}</div>
                              <div className="text-xs text-tp-muted">NIP: {user.nip_guru || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-tp-text">{user.nama_sekolah || '-'}</div>
                              <div className="text-xs text-tp-muted">{user.mata_pelajaran || '-'}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-tp-green">
                                {user.token_balance}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {user.is_active ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                                  Diblokir
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-tp-muted">
                              {user.last_login ? new Date(user.last_login).toLocaleString('id-ID') : 'Belum pernah'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleToggleStatus(user.id, user.is_active)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  user.is_active
                                    ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {user.is_active ? 'Blokir' : 'Aktifkan'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeView === 'ebooks' ? (
            <div>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h1 className="mb-1 text-2xl font-bold tracking-tight text-tp-text sm:text-[28px]">Kelola E-Book</h1>
                  <p className="text-sm text-tp-muted">Tambah dan kelola daftar buku pegangan kurikulum untuk guru.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-xl bg-tp-green px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-tp-green-hover"
                  >
                    + Tambah E-Book
                  </button>
                  <button
                    type="button"
                    onClick={fetchEbooks}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-tp-border bg-white px-4 py-2.5 text-xs font-semibold text-tp-text transition hover:bg-gray-50"
                  >
                    <IconRefresh /> Muat Ulang
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-tp-border bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-tp-border bg-gray-50 text-xs font-semibold uppercase tracking-wider text-tp-muted">
                      <tr>
                        <th className="px-6 py-4">Judul Buku</th>
                        <th className="px-6 py-4">Jenjang</th>
                        <th className="px-6 py-4">Mata Pelajaran</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tp-border">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-tp-muted">
                            Memuat data e-book...
                          </td>
                        </tr>
                      ) : ebooks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-tp-muted">
                            Belum ada data e-book yang tersimpan.
                          </td>
                        </tr>
                      ) : (
                        ebooks.map((b) => (
                          <tr key={b.id} className="transition hover:bg-gray-50/50">
                            <td className="px-6 py-4 font-semibold text-tp-text">{b.judul}</td>
                            <td className="px-6 py-4 text-tp-muted">{b.jenjang}</td>
                            <td className="px-6 py-4 text-tp-muted">{b.mata_pelajaran}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-tp-green border border-emerald-200">
                                {b.kategori || 'Kurikulum Merdeka'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={b.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
                                >
                                  Lihat PDF
                                </a>
                                <button
                                  onClick={() => handleDeleteEbook(b.id, b.judul)}
                                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* --- TAMPILAN VIEW KEAMANAN, GANTI SANDI & PENGUJIAN SENTRY --- */
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="mb-1 text-2xl font-bold tracking-tight text-tp-text sm:text-[28px]">Keamanan & Log Aktivitas</h1>
                <p className="text-sm text-tp-muted">Perbarui kata sandi, uji monitoring error, dan pantau riwayat jejak keamanan administrator sistem.</p>
              </div>

              {/* Grid 2 Kolom: Ubah Password & Tes Sentry */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                
                {/* 1. Form Ganti Sandi */}
                <div className="rounded-2xl border border-tp-border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-tp-text">Ubah Kata Sandi</h3>
                  <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Kata Sandi Lama</label>
                      <div className="relative flex items-center">
                        <input
                          type={showOldPass ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-tp-green"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowOldPass(!showOldPass)}
                          tabIndex={-1}
                        >
                          {showOldPass ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Kata Sandi Baru (Min. 6 Karakter)</label>
                      <div className="relative flex items-center">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-tp-green"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowNewPass(!showNewPass)}
                          tabIndex={-1}
                        >
                          {showNewPass ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">Konfirmasi Kata Sandi Baru</label>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-tp-green"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          tabIndex={-1}
                        >
                          {showConfirmPass ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={changingPass}
                        className="rounded-xl bg-tp-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-tp-green-hover disabled:opacity-50"
                      >
                        {changingPass ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. CARD PENGUJIAN SENTRY */}
                <div className="flex flex-col justify-between rounded-2xl border border-tp-border bg-white p-6 shadow-sm">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <h3 className="text-base font-bold text-tp-text">Pengujian Sentry Monitoring</h3>
                    </div>
                    <p className="mb-4 text-xs text-tp-muted leading-relaxed">
                      Gunakan fitur ini untuk memastikan integrasi pemantau kesalahan (Sentry) berjalan dengan baik pada lingkungan Client (Vite) maupun Server (Golang Cloud Run).
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleTestSentryFrontend}
                      className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/50 px-4 py-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      <span>Trigger Error Frontend (React)</span>
                      <span className="rounded-md bg-indigo-200/60 px-2 py-0.5 text-[10px] font-bold">Client Test</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestSentryBackend}
                      className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <span>Trigger Panic Backend (Golang)</span>
                      <span className="rounded-md bg-rose-200/60 px-2 py-0.5 text-[10px] font-bold">Server Test</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Tabel Riwayat Log Aktivitas */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-tp-text">Riwayat Log Keamanan (Audit Trail)</h3>
                  <button
                    type="button"
                    onClick={fetchLogs}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-tp-border bg-white px-3 py-1.5 text-xs font-semibold text-tp-text transition hover:bg-gray-50"
                  >
                    <IconRefresh /> Muat Ulang Log
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-tp-border bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-tp-border bg-gray-50 text-xs font-semibold uppercase tracking-wider text-tp-muted">
                        <tr>
                          <th className="px-5 py-3.5">Waktu</th>
                          <th className="px-5 py-3.5">Aksi / Aktivitas</th>
                          <th className="px-5 py-3.5">IP Address</th>
                          <th className="px-5 py-3.5">Detail / Perangkat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-tp-border">
                        {logs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-5 py-8 text-center text-tp-muted text-xs">
                              Belum ada catatan log aktivitas keamanan.
                            </td>
                          </tr>
                        ) : (
                          logs.map((log) => (
                            <tr key={log.id} className="transition hover:bg-gray-50/50">
                              <td className="px-5 py-3.5 text-xs text-tp-muted whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString('id-ID')}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                  log.action === 'LOGIN_SUCCESS' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : log.action === 'CHANGE_PASSWORD'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-xs font-mono text-tp-muted">
                                {log.ip_address || '-'}
                              </td>
                              <td className="px-5 py-3.5 text-xs text-tp-text max-w-xs truncate" title={log.user_agent}>
                                {log.details || log.user_agent || '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Tambah E-Book */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-tp-text">Tambah E-Book Baru</h2>
            <form onSubmit={handleCreateEbook} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Judul Buku</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika Kelas X SMA"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Jenjang</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                  >
                    <option value="SD/MI">SD/MI</option>
                    <option value="SMP/MTs">SMP/MTs</option>
                    <option value="SMA/MA">SMA/MA</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Matematika"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                    value={mataPelajaran}
                    onChange={(e) => setMataPelajaran(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Kategori Buku</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Kurikulum 2013">Kurikulum 2013</option>
                  <option value="Nonteks">Nonteks (Buku Pengayaan/Literasi)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">URL File PDF (Link Resmi / Cloudflare R2)</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">URL Cover Buku (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-tp-green px-4 py-2 text-sm font-semibold text-white hover:bg-tp-green-hover disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan E-Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}