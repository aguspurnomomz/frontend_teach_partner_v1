import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Plus, Trash2, CheckCircle, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import axios from 'axios'

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [academicYears, setAcademicYears] = useState<any[]>([])
  const [schoolJenjang, setSchoolJenjang] = useState('SMP') // Default SMP
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [isCustomName, setIsCustomName] = useState(false)
  const [level, setLevel] = useState('7')
  
  const [classType, setClassType] = useState('Umum')
  const [isCustomType, setIsCustomType] = useState(false)
  
  const [mapping, setMapping] = useState('')
  const [quota, setQuota] = useState(36)
  const [academicYearId, setAcademicYearId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = await getAuthToken()
      
      const [classRes, yearRes, profileRes] = await Promise.all([
        axios.get(`${API_URL}/api/school-admin/classes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/school-admin/academic-years`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/school-admin/profile`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      setClasses(classRes.data.classes || [])
      setAcademicYears(yearRes.data.academic_years || [])
      
      const jenjangDB = profileRes.data.school?.jenjang || 'SMP'
      setSchoolJenjang(jenjangDB)

      // Set default nilai kelas pertama sesuai jenjang
      if (jenjangDB === 'SD') { setName('KELAS 1'); setLevel('1'); setMapping('1') }
      else if (jenjangDB === 'SMP') { setName('KELAS 7'); setLevel('7'); setMapping('7') }
      else { setName('KELAS 10'); setLevel('10'); setMapping('10') }

    } catch (error) {
      console.error('Gagal memuat data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [API_URL])

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const token = await getAuthToken()
      await axios.post(`${API_URL}/api/school-admin/classes`, {
        name,
        level,
        class_type: classType,
        mapping,
        quota: Number(quota),
        academic_year_id: academicYearId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccessMessage('Data kelas berhasil ditambahkan!')
      setIsModalOpen(false)
      fetchData()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (error: any) {
      alert('Gagal menambah kelas: ' + (error.response?.data?.error || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return
    try {
      const token = await getAuthToken()
      await axios.delete(`${API_URL}/api/school-admin/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccessMessage('Kelas berhasil dihapus!')
      fetchData()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (error: any) {
      alert('Gagal menghapus kelas: ' + (error.response?.data?.error || error.message))
    }
  }

  // Render opsi kelas berdasarkan jenjang sekolah
  const renderClassOptions = () => {
    if (schoolJenjang === 'SD') {
      return (
        <>
          <option value="KELAS 1">KELAS 1</option>
          <option value="KELAS 2">KELAS 2</option>
          <option value="KELAS 3">KELAS 3</option>
          <option value="KELAS 4">KELAS 4</option>
          <option value="KELAS 5">KELAS 5</option>
          <option value="KELAS 6">KELAS 6</option>
        </>
      )
    } else if (schoolJenjang === 'SMP') {
      return (
        <>
          <option value="KELAS 7">KELAS 7</option>
          <option value="KELAS 8">KELAS 8</option>
          <option value="KELAS 9">KELAS 9</option>
        </>
      )
    } else {
      // SMA / SMK
      return (
        <>
          <option value="KELAS 10">KELAS 10</option>
          <option value="KELAS 11">KELAS 11</option>
          <option value="KELAS 12">KELAS 12</option>
        </>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-tp-text">Kelola Kelas ({schoolJenjang})</h1>
        <p className="text-xs text-tp-muted">Manajemen master tingkat kelas dan struktur rombongan belajar institusi.</p>
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 flex items-center gap-3">
          <CheckCircle size={20} className="text-tp-green shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="rounded-2xl border border-tp-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-tp-border">
          <div className="flex gap-2">
            <button className="rounded-xl bg-tp-green px-4 py-2 text-xs font-semibold text-white">Daftar Kelas</button>
            <button className="rounded-xl border border-tp-border px-4 py-2 text-xs font-semibold text-tp-muted hover:bg-gray-50">Daftar Sub Kelas</button>
            <button className="rounded-xl border border-tp-border px-4 py-2 text-xs font-semibold text-tp-muted hover:bg-gray-50">Daftar Murid</button>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-tp-green px-4 py-2.5 text-xs font-semibold text-white hover:bg-tp-green-hover"
          >
            <Plus size={16} />
            Tambah Kelas
          </Button>
        </div>

        {/* Tabel Data Kelas */}
        {loading ? (
          <p className="text-center text-xs text-tp-muted py-8">Memuat daftar kelas...</p>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-tp-muted text-xs">
            Belum ada data kelas yang terdaftar. Silakan buat master kelas baru.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-tp-border bg-gray-50 text-xs text-tp-muted uppercase tracking-wider">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Nama Sekolah</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Tipe Kelas</th>
                  <th className="py-3 px-4">Pemetaan Kelas</th>
                  <th className="py-3 px-4">Kuota</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tp-border">
                {classes.map((cls, index) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-tp-muted">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-tp-text">{cls.school_name}</td>
                    <td className="py-3 px-4 font-semibold text-tp-text">{cls.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        {cls.class_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{cls.mapping || '-'}</td>
                    <td className="py-3 px-4">{cls.quota}</td>
                    <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Kelas"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-tp-border pb-3">
              <h3 className="text-sm font-bold text-tp-text">Tambah Data Kelas ({schoolJenjang})</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-tp-muted hover:text-tp-text">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-tp-muted">Pilih atau Ketik Kelas *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomName(!isCustomName)
                      if (!isCustomName) setName('')
                      else setName(schoolJenjang === 'SD' ? 'KELAS 1' : schoolJenjang === 'SMP' ? 'KELAS 7' : 'KELAS 10')
                    }}
                    className="text-[10px] text-tp-green font-medium hover:underline"
                  >
                    {isCustomName ? 'Gunakan Pilihan Default' : '+ Ketik Manual'}
                  </button>
                </div>

                {isCustomName ? (
                  <input
                    type="text"
                    value={name}
                    placeholder="Contoh: KELAS KHUSUS"
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                    required
                  />
                ) : (
                  <select
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value
                      setName(val)
                      const match = val.match(/\d+/)
                      if (match) {
                        setLevel(match[0])
                        setMapping(match[0])
                      }
                    }}
                    className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                    required
                  >
                    {renderClassOptions()}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-tp-muted mb-1">Tingkatan Level *</label>
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="Contoh: 7"
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-tp-muted">Tipe Kelas *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomType(!isCustomType)
                      if (!isCustomType) setClassType('')
                      else setClassType('Umum')
                    }}
                    className="text-[10px] text-tp-green font-medium hover:underline"
                  >
                    {isCustomType ? 'Gunakan Pilihan Default' : '+ Ketik Manual'}
                  </button>
                </div>

                {isCustomType ? (
                  <input
                    type="text"
                    value={classType}
                    placeholder="Contoh: Kelas Internasional"
                    onChange={(e) => setClassType(e.target.value)}
                    className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                    required
                  />
                ) : (
                  <select
                    value={classType}
                    onChange={(e) => setClassType(e.target.value)}
                    className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                    required
                  >
                    <option value="Umum">Umum</option>
                    <option value="Peruntukan PPDB">Peruntukan PPDB</option>
                    <option value="Unggulan">Unggulan</option>
                    <option value="Inklusi">Inklusi</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-tp-muted mb-1">Pemetaan Kelas *</label>
                <input
                  type="text"
                  value={mapping}
                  onChange={(e) => setMapping(e.target.value)}
                  placeholder="Contoh: 7"
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tp-muted mb-1">Kuota Kapasitas Siswa</label>
                <input
                  type="number"
                  value={quota}
                  onChange={(e) => setQuota(Number(e.target.value))}
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-tp-muted mb-1">Tahun Akademik *</label>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                  required
                >
                  <option value="">Pilih Tahun Akademik</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} - Semester {ay.semester} {ay.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-tp-border bg-white px-4 py-2.5 text-xs font-semibold text-tp-muted hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-tp-green px-4 py-2.5 text-xs font-semibold text-white hover:bg-tp-green-hover disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}