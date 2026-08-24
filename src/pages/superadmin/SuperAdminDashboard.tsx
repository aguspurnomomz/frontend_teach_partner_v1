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

interface SuperAdminDashboardProps {
  adminName: string
  onLogout: () => void
}

type AdminView = 'dashboard' | 'users'

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

export default function SuperAdminDashboard({ adminName, onLogout }: SuperAdminDashboardProps) {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeView, setActiveView] = useState<AdminView>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')

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

  useEffect(() => {
    fetchRegisteredUsers()
  }, [])

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

  const stats = useMemo(() => {
    const active = users.filter((u) => u.is_active).length
    const blocked = users.length - active
    const tokens = users.reduce((sum, u) => sum + (Number(u.token_balance) || 0), 0)
    return { total: users.length, active, blocked, tokens }
  }, [users])

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
  ]

  const openView = (view: AdminView) => {
    setActiveView(view)
    setSidebarOpen(false)
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
              {activeView === 'dashboard' ? 'Dashboard' : 'User Guru Terdaftar'}
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
                  <p className="text-sm text-tp-muted">Ringkasan pengguna yang terdaftar di sistem TeachPartner.</p>
                </div>
                <button
                  type="button"
                  onClick={fetchRegisteredUsers}
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
                  <span className="text-[13px] font-medium text-tp-muted">Diblokir</span>
                  <div className="text-[32px] font-bold leading-none tracking-tight text-tp-text">
                    {loading ? '—' : stats.blocked}
                  </div>
                  <div className="mt-auto text-xs text-tp-faint">Akses dinonaktifkan</div>
                </div>

                <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-border bg-white p-[22px] shadow-tp sm:min-h-[140px]">
                  <span className="text-[13px] font-medium text-tp-muted">Total Token</span>
                  <div className="text-[32px] font-bold leading-none tracking-tight text-tp-text">
                    {loading ? '—' : stats.tokens}
                  </div>
                  <div className="mt-auto text-xs text-tp-faint">Saldo AI seluruh guru</div>
                </div>
              </div>

              <div className="rounded-tp border border-tp-border bg-white p-[18px] shadow-tp sm:p-[22px]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-tp-text">Guru terbaru</h3>
                  <button
                    type="button"
                    className="text-[13px] font-semibold text-tp-green"
                    onClick={() => openView('users')}
                  >
                    Lihat semua
                  </button>
                </div>

                {loading ? (
                  <p className="py-8 text-center text-sm text-tp-muted">Memuat data pengguna...</p>
                ) : users.length === 0 ? (
                  <p className="py-8 text-center text-sm text-tp-muted">Belum ada pengguna terdaftar.</p>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {users.slice(0, 5).map((user) => (
                      <div className="flex items-center gap-3" key={user.id}>
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tp-green text-[13px] font-bold text-white">
                          {(user.nama_guru || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-[13px] font-semibold text-tp-text">
                            {user.nama_guru || 'Tanpa Nama'}
                          </strong>
                          <span className="block truncate text-xs text-tp-faint">
                            {user.nama_sekolah || 'Sekolah belum diisi'} · {user.mata_pelajaran || '-'}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.is_active ? 'bg-tp-mint-soft text-tp-green' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {user.is_active ? 'Aktif' : 'Diblokir'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
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
          )}
        </main>
      </div>
    </div>
  )
}
