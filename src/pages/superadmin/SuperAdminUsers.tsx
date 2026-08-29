import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

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

interface SuperAdminUsersProps {
  users: UserItem[]
  loading: boolean
  onRefresh: () => void
}

export default function SuperAdminUsers({ users, loading, onRefresh }: SuperAdminUsersProps) {
  const [search, setSearch] = useState('')
  
  // State untuk Pagination (10 item per halaman)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

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
      onRefresh()
    } catch (err: any) {
      alert('Gagal mengubah status pengguna.')
      console.error(err)
    }
  }

  const filteredUsers = users.filter((u) =>
    [u.nama_guru, u.nip_guru, u.nama_sekolah, u.mata_pelajaran]
      .join(' ')
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  )

  // Kalkulasi data untuk pagination (10 data per halaman)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  // Reset ke halaman 1 saat pencarian berubah
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-tp-text sm:text-[28px]">User Guru</h1>
          <p className="text-sm text-tp-muted">
            {loading ? 'Memuat...' : `${users.length} guru terdaftar di sistem.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari nama, NIP, atau sekolah..."
            className="w-full rounded-xl bg-white sm:w-64"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            className="rounded-xl border-tp-border bg-white gap-2 text-xs"
          >
            <RefreshCw size={14} /> Muat Ulang
          </Button>
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
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-tp-muted">
                    {search ? 'Tidak ada guru yang cocok dengan pencarian.' : 'Belum ada pengguna terdaftar.'}
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
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
                      <Button
                        size="sm"
                        variant={user.is_active ? 'destructive' : 'outline'}
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`rounded-xl h-8 px-3 text-xs ${
                          !user.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : ''
                        }`}
                      >
                        {user.is_active ? 'Blokir' : 'Aktifkan'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Navigasi Pagination (10 data per halaman) */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between border-t border-tp-border bg-gray-50/50 px-6 py-3.5 text-xs text-tp-muted">
            <div>
              Menampilkan <span className="font-semibold text-tp-text">{startIndex + 1}</span> -{' '}
              <span className="font-semibold text-tp-text">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> dari{' '}
              <span className="font-semibold text-tp-text">{filteredUsers.length}</span> guru
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="h-8 rounded-lg gap-1 bg-white text-xs"
              >
                <ChevronLeft size={14} /> Sebelumnya
              </Button>
              <span className="font-medium text-tp-text px-1">
                {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 rounded-lg gap-1 bg-white text-xs"
              >
                Selanjutnya <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}