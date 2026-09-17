import { useEffect, useState } from 'react'
import { api } from '../../lib/axios'
import { Button } from '@/components/ui/button'
import { Building2, Plus, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react'

interface SchoolItem {
  id: string
  school_name: string
  npsn: string
  address: string
  is_active: boolean
  created_at: string
}

interface SchoolAdminItem {
  id: string
  full_name: string
  email: string
  nip: string
  is_active: boolean
  created_at: string
  school_name: string
  npsn: string
}

export default function SuperAdminSchools() {
  const [schools, setSchools] = useState<SchoolItem[]>([])
  const [admins, setAdmins] = useState<SchoolAdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // State Form Pendaftaran Sekolah
  const [schoolName, setSchoolName] = useState('')
  const [npsn, setNpsn] = useState('')
  const [address, setAddress] = useState('')

  // State Form Pendaftaran Admin Sekolah
  const [selectedSchoolID, setSelectedSchoolID] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminFullName, setAdminFullName] = useState('')
  const [adminNip, setAdminNip] = useState('')
  const [jenjang, setJenjang] = useState('SMP')

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('superadmin_token')
      const headers = { Authorization: `Bearer ${token}` }

      const [resSchools, resAdmins] = await Promise.all([
        api.get('/api/superadmin/schools', { headers }),
        api.get('/api/superadmin/school-admins', { headers })
      ])

      setSchools(resSchools.data.schools || [])
      setAdmins(resAdmins.data.admins || [])
      setErrorMsg('')
    } catch (err) {
      setErrorMsg('Gagal memuat data sekolah dan admin.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRegisterSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setErrorMsg('')
      setSuccessMsg('')
      const token = localStorage.getItem('superadmin_token')
      
      const res = await api.post('/api/superadmin/schools', {
        school_name: schoolName,
        npsn,
        address,
        jenjang // Kirim data jenjang ke backend
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccessMsg(`Sekolah "${res.data.school_name}" berhasil didaftarkan!`)
      setSchoolName('')
      setNpsn('')
      setAddress('')
      setJenjang('SMP')
      fetchData()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Gagal mendaftarkan sekolah.')
    }
  }

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setErrorMsg('')
      setSuccessMsg('')
      const token = localStorage.getItem('superadmin_token')

      await api.post('/api/superadmin/school-admins', {
        school_id: selectedSchoolID,
        email: adminEmail,
        password: adminPassword,
        full_name: adminFullName,
        nip: adminNip
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccessMsg('Akun Admin Sekolah berhasil dibuat!')
      setSelectedSchoolID('')
      setAdminEmail('')
      setAdminPassword('')
      setAdminFullName('')
      setAdminNip('')
      fetchData()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Gagal membuat akun admin sekolah.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-tp-text">Manajemen Sekolah B2B</h1>
        <p className="text-sm text-tp-muted">Daftarkan institusi sekolah dan kelola akun Admin Sekolah.</p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form Pendaftaran Sekolah */}
        <div className="rounded-2xl border border-tp-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-tp-text flex items-center gap-2">
            <Building2 size={20} className="text-tp-green" /> Tambah Sekolah Baru
          </h2>
          <form onSubmit={handleRegisterSchool} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">Jenjang Sekolah</label>
              <select
                required
                className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value)}
              >
                <option value="SD">SD (Sekolah Dasar)</option>
                <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                <option value="SMK">Sekolah Menengah Kejuruan (SMK)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">Nama Sekolah</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                placeholder="Contoh: SMAN 1 Bandung"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">NPSN</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                placeholder="Nomor Pokok Sekolah Nasional"
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">Alamat</label>
              <textarea
                className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                placeholder="Alamat lengkap sekolah"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full rounded-xl bg-tp-green text-white font-semibold py-2.5 hover:bg-tp-green-hover">
              Daftarkan Sekolah
            </Button>
          </form>
        </div>

        {/* Form Pendaftaran Admin Sekolah */}
        <div className="rounded-2xl border border-tp-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-tp-text flex items-center gap-2">
            <Plus size={20} className="text-tp-green" /> Buat Akun Admin Sekolah
          </h2>
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">Pilih Sekolah</label>
              <select
                required
                className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                value={selectedSchoolID}
                onChange={(e) => setSelectedSchoolID(e.target.value)}
              >
                <option value="">-- Pilih Institusi Sekolah --</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.school_name} (NPSN: {s.npsn})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">Nama Lengkap Admin</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  placeholder="Nama Admin"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">NIP / Identitas</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  placeholder="Opsional"
                  value={adminNip}
                  onChange={(e) => setAdminNip(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">Email Login</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  placeholder="admin@sekolah.sch.id"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-tp-muted mb-1">Kata Sandi</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  placeholder="Minimal 6 karakter"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl bg-tp-green text-white font-semibold py-2.5 hover:bg-tp-green-hover">
              Buat Akun Admin
            </Button>
          </form>
        </div>
      </div>

      {/* Tabel Daftar Sekolah */}
      <div className="rounded-2xl border border-tp-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-tp-text">Daftar Sekolah Terdaftar ({schools.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-tp-border bg-tp-bg text-xs uppercase text-tp-muted">
              <tr>
                <th className="px-4 py-3">Nama Sekolah</th>
                <th className="px-4 py-3">NPSN</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tp-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-tp-muted">Memuat data sekolah...</td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-tp-muted">Belum ada sekolah terdaftar.</td>
                </tr>
              ) : (
                schools.map((s) => (
                  <tr key={s.id} className="hover:bg-tp-bg/50">
                    <td className="px-4 py-3 font-semibold text-tp-text">{s.school_name}</td>
                    <td className="px-4 py-3 text-tp-muted">{s.npsn}</td>
                    <td className="px-4 py-3 text-tp-muted max-w-[250px] truncate">{s.address || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                        {s.is_active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-tp-muted text-xs">
                      {new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Daftar Admin Sekolah */}
      <div className="rounded-2xl border border-tp-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-tp-text flex items-center gap-2">
          <ShieldAlert size={18} className="text-tp-green" /> Daftar Akun Admin Sekolah ({admins.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-tp-border bg-tp-bg text-xs uppercase text-tp-muted">
              <tr>
                <th className="px-4 py-3">Nama Admin</th>
                <th className="px-4 py-3">Email Login</th>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Institusi Sekolah</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dibuat Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tp-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-tp-muted">Memuat data admin...</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-tp-muted">Belum ada akun admin sekolah yang dibuat.</td>
                </tr>
              ) : (
                admins.map((a) => (
                  <tr key={a.id} className="hover:bg-tp-bg/50">
                    <td className="px-4 py-3 font-semibold text-tp-text">{a.full_name}</td>
                    <td className="px-4 py-3 text-tp-muted">{a.email}</td>
                    <td className="px-4 py-3 text-tp-muted">{a.nip || '-'}</td>
                    <td className="px-4 py-3 text-tp-text font-medium">{a.school_name} <span className="text-xs text-tp-muted">({a.npsn})</span></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                        {a.is_active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-tp-muted text-xs">
                      {new Date(a.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}