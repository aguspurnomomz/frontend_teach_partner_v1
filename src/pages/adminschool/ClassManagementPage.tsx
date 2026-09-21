import { useState, useEffect, useCallback } from 'react'
import { Button } from '../../components/ui/button'
import { Plus, Trash2, CheckCircle, X, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import axios from 'axios'

interface ClassItem {
  id: string
  school_name: string
  name: string
  level: string
  class_type: string
  academic_year_id: string
  academic_year_name: string
  semester: string
  created_at: string
}

interface AcademicYear {
  id: string
  name: string
  semester: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

interface SchoolProfile {
  id: string
  school_name: string
  npsn: string
  jenjang?: string
  is_active: boolean
}

type Jenjang = 'SD' | 'SMP' | 'SMA' | 'SMK'


const CLASS_OPTIONS: Record<string, string[]> = {
  SD: ['KELAS 1', 'KELAS 2', 'KELAS 3', 'KELAS 4', 'KELAS 5', 'KELAS 6'],
  SMP: ['KELAS 7', 'KELAS 8', 'KELAS 9'],
  SMA: ['KELAS 10', 'KELAS 11', 'KELAS 12'],
  SMK: ['KELAS 10', 'KELAS 11', 'KELAS 12'],
}

const CLASS_TYPE_OPTIONS = ['Umum', 'Inklusi']

const getDefaultClassName = (jenjang: Jenjang): string => {
  switch (jenjang) {
    case 'SD': return 'KELAS 1'
    case 'SMP': return 'KELAS 7'
    default: return 'KELAS 10'
  }
}

const getDefaultLevel = (jenjang: Jenjang): string => {
  switch (jenjang) {
    case 'SD': return '1'
    case 'SMP': return '7'
    default: return '10'
  }
}

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [schoolJenjang, setSchoolJenjang] = useState<Jenjang>('SMP')

  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [name, setName] = useState('')
  const [isCustomName, setIsCustomName] = useState(false)
  const [level, setLevel] = useState('7')
  const [classType, setClassType] = useState('Umum')
  const [isCustomType, setIsCustomType] = useState(false)
  const [academicYearId, setAcademicYearId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL as string

  const getAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setErrorMessage('')
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setSuccessMessage('')
    setTimeout(() => setErrorMessage(''), 5000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const token = await getAuthToken()
      if (!token) {
        showError('Sesi login tidak ditemukan. Silakan login ulang.')
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

      const [classRes, yearRes, profileRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/school-admin/classes`, { headers }),
        axios.get(`${API_URL}/api/school-admin/academic-years`, { headers }),
        axios.get(`${API_URL}/api/school-admin/profile`, { headers }),
      ])

  
      if (classRes.status === 'fulfilled') {
        setClasses(classRes.value.data?.classes ?? [])
      } else {
        console.error('[Classes] Gagal fetch:', classRes.reason)
        setClasses([])
      }


      if (yearRes.status === 'fulfilled') {
        const raw = yearRes.value.data?.academic_years
        const parsed: AcademicYear[] = Array.isArray(raw) ? raw : []
        setAcademicYears(parsed)
        console.log('[Academic Years] Loaded:', parsed.length, parsed)
      } else {
        console.error('[Academic Years] Gagal fetch:', yearRes.reason)
        setAcademicYears([])
        showError('Gagal memuat data tahun akademik.')
      }

      let jenjang: Jenjang = 'SMP'
      if (profileRes.status === 'fulfilled') {
        const school: SchoolProfile | undefined = profileRes.value.data?.school
        jenjang = (school?.jenjang as Jenjang) || 'SMP'
      } else {
        console.error('[Profile] Gagal fetch:', profileRes.reason)
      }

      setSchoolJenjang(jenjang)

      setName(getDefaultClassName(jenjang))
      setLevel(getDefaultLevel(jenjang))

    } catch (error) {
      console.error('[fetchData] Unexpected error:', error)
      showError('Terjadi kesalahan saat memuat data.')
    } finally {
      setLoading(false)
    }
  }, [API_URL])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!academicYearId) {
      showError('Silakan pilih Tahun Akademik terlebih dahulu.')
      return
    }

      // Debug: cek ID yang dikirim
      // console.log('[CREATE CLASS] academicYearId:', academicYearId)
      // console.log('[CREATE CLASS] Available years:', academicYears.map(y => ({ id: y.id, name: y.name })))

    if (!name.trim()) {
      showError('Nama kelas tidak boleh kosong.')
      return
    }
    if (!level.trim()) {
      showError('Tingkatan level tidak boleh kosong.')
      return
    }

    setSubmitting(true)
    try {
      const token = await getAuthToken()
      if (!token) {
        showError('Sesi login tidak ditemukan.')
        return
      }

      await axios.post(
        `${API_URL}/api/school-admin/classes`,
        {
          name: name.trim(),
          level: level.trim(),
          class_type: classType,
          academic_year_id: academicYearId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      showSuccess('Data kelas berhasil ditambahkan!')
      setIsModalOpen(false)
      await fetchData()
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Terjadi kesalahan.'
      showError('Gagal menambah kelas: ' + msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return

    try {
      const token = await getAuthToken()
      if (!token) {
        showError('Sesi login tidak ditemukan.')
        return
      }

      await axios.delete(`${API_URL}/api/school-admin/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      showSuccess('Kelas berhasil dihapus!')
      await fetchData()
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Terjadi kesalahan.'
      showError('Gagal menghapus kelas: ' + msg)
    }
  }

  const handleOpenModal = () => {
    setAcademicYearId('')
    setName(getDefaultClassName(schoolJenjang))
    setLevel(getDefaultLevel(schoolJenjang))
    setClassType('Umum')
    setIsCustomName(false)
    setIsCustomType(false)
    setIsModalOpen(true)
  }


  const renderClassOptions = () => {
    const options = CLASS_OPTIONS[schoolJenjang] ?? CLASS_OPTIONS.SMP
    return options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-tp-text">
          Kelola Kelas ({schoolJenjang})
        </h1>
        <p className="text-xs text-tp-muted">
          Manajemen master tingkat kelas dan struktur rombongan belajar institusi.
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 flex items-center gap-3">
          <CheckCircle size={20} className="text-tp-green shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 flex items-center gap-3">
          <X size={20} className="text-red-500 shrink-0" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-2xl border border-tp-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-tp-border">
          <div className="flex gap-2">
            <button className="rounded-xl bg-tp-green px-4 py-2 text-xs font-semibold text-white">
              Daftar Kelas
            </button>
            <button className="rounded-xl border border-tp-border px-4 py-2 text-xs font-semibold text-tp-muted hover:bg-gray-50">
              Daftar Sub Kelas
            </button>
            <button className="rounded-xl border border-tp-border px-4 py-2 text-xs font-semibold text-tp-muted hover:bg-gray-50">
              Daftar Murid
            </button>
          </div>
          <Button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-xl bg-tp-green px-4 py-2.5 text-xs font-semibold text-white hover:bg-tp-green-hover"
          >
            <Plus size={16} />
            Tambah Kelas
          </Button>
        </div>

        {/* Table */}
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
                  <th className="py-3 px-4">Tahun Akademik</th>
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
                    <td className="py-3 px-4">
                      {cls.academic_year_name} - Semester {cls.semester}
                    </td>
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
              <h3 className="text-sm font-bold text-tp-text">
                Tambah Data Kelas ({schoolJenjang})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-tp-muted hover:text-tp-text"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              {/* --- Tahun Akademik (Field Pertama) --- */}
              <div>
                <label className="block text-xs font-semibold text-tp-muted mb-1">
                  Tahun Akademik *
                </label>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                  required
                  disabled={loading}
                >
                  <option value="">
                    {loading
                      ? 'Memuat tahun akademik...'
                      : academicYears.length === 0
                      ? '-- Belum ada tahun akademik --'
                      : 'Pilih Tahun Akademik'}
                  </option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} - Semester {ay.semester} {ay.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
                {academicYears.length === 0 && !loading && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    Belum ada tahun akademik. Silakan tambahkan terlebih dahulu di menu Tahun Akademik.
                  </p>
                )}
              </div>

              {/* --- Field Lainnya: hanya muncul jika Tahun Akademik dipilih --- */}
              {academicYearId && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-tp-muted">
                        Pilih atau Ketik Kelas *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isCustomName
                          setIsCustomName(next)
                          setName(next ? '' : getDefaultClassName(schoolJenjang))
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
                          if (match) setLevel(match[0])
                        }}
                        className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                        required
                      >
                        {renderClassOptions()}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tp-muted mb-1">
                      Tingkatan Level *
                    </label>
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
                      <label className="text-xs font-semibold text-tp-muted">
                        Tipe Kelas *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isCustomType
                          setIsCustomType(next)
                          setClassType(next ? '' : 'Umum')
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
                        {CLASS_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
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
                  disabled={submitting || !academicYearId}
                  className="inline-flex items-center gap-2 rounded-xl bg-tp-green px-4 py-2.5 text-xs font-semibold text-white hover:bg-tp-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
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