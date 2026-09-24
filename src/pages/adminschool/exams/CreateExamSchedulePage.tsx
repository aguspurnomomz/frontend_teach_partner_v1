import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Clock, MapPin,  Users, Lock,
  RefreshCw, AlertCircle, Sparkles, FileText, 
} from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'


type ExamOption = {
  id: string
  title: string
  subject: string
  exam_type: string
  duration_minutes: number
  total_questions: number
  targets: Array<{
    class_group_id: string | null
    class_sub_group_id: string | null
    class_group_name: string
    class_sub_group_name: string
  }>
}

type SubClassTarget = {
  class_group_id: string
  class_group_name: string
  class_sub_group_id: string
  class_sub_group_name: string
  student_count: number
}

type ScheduleFormData = {
  exam_id: string
  schedule_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  selected_targets: string[]        
  room: string
  supervisor_name: string
  session_notes: string
  access_code: string
  require_login: boolean
}


const SUPERVISOR_SUGGESTIONS = [
  'Guru A', 'Guru Pengawas A', 'Guru Pengawas B', 'Guru Pengawas C', 'Guru Pengawas D',
]


export default function CreateExamSchedulePage() {
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mode, setMode] = useState<'pick' | 'custom'>('pick')
  const [exams, setExams] = useState<ExamOption[]>([])
  const [selectedExam, setSelectedExam] = useState<ExamOption | null>(null)
  const [availableTargets, setAvailableTargets] = useState<SubClassTarget[]>([])

  const [form, setForm] = useState<ScheduleFormData>({
    exam_id: '',
    schedule_date: new Date().toISOString().slice(0, 10),
    start_time: '07:00',
    end_time: '08:30',
    duration_minutes: 90,
    selected_targets: [],
    room: '',
    supervisor_name: '',
    session_notes: '',
    access_code: generateAccessCode(),
    require_login: false,
  })

  const setField = <K extends keyof ScheduleFormData>(key: K, value: ScheduleFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await axios.get<{ exams: ExamOption[] }>(
          `${API_URL}/api/school-admin/exams`,
          {
            params: { status: 'published' },
            headers: { Authorization: `Bearer ${session?.access_token}` },
          }
        )
        setExams(res.data.exams || [])
      } catch (e: unknown) {
        setError(getErrorMessage(e))
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [API_URL])


  useEffect(() => {
    if (!selectedExam) {
      setAvailableTargets([])
      return
    }
    // Ambil semua sub kelas target, fetch student_count
    const fetchTargets = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const subGroupIds = selectedExam.targets
          .map((t) => t.class_sub_group_id)
          .filter((id): id is string => !!id)

        if (subGroupIds.length === 0) {
          setAvailableTargets([])
          return
        }

        const res = await axios.get<{ targets: SubClassTarget[] }>(
          `${API_URL}/api/school-admin/exam-schedules/available-targets`,
          {
            params: { exam_id: selectedExam.id },
            headers: { Authorization: `Bearer ${session?.access_token}` },
          }
        )
        setAvailableTargets(res.data.targets || [])
      } catch (e: unknown) {
        setError(getErrorMessage(e))
      }
    }
    fetchTargets()

    // Sync duration
    setField('duration_minutes', selectedExam.duration_minutes)
    const start = form.start_time
    setField('end_time', addMinutes(start, selectedExam.duration_minutes))
  }, [selectedExam])

  // Auto sync end_time saat start_time atau duration berubah
  useEffect(() => {
    if (form.start_time && form.duration_minutes > 0) {
      const end = addMinutes(form.start_time, form.duration_minutes)
      if (end !== form.end_time) setField('end_time', end)
    }
  }, [form.start_time, form.duration_minutes])

  const toggleTarget = (subGroupId: string) => {
    setForm((prev) => {
      const exists = prev.selected_targets.includes(subGroupId)
      return {
        ...prev,
        selected_targets: exists
          ? prev.selected_targets.filter((id) => id !== subGroupId)
          : [...prev.selected_targets, subGroupId],
      }
    })
  }

  const totalStudents = availableTargets
    .filter((t) => form.selected_targets.includes(t.class_sub_group_id))
    .reduce((sum, t) => sum + t.student_count, 0)

  const canSubmit =
    (mode === 'pick' ? !!form.exam_id : true) &&
    form.schedule_date &&
    form.start_time &&
    form.end_time &&
    form.selected_targets.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const payload = {
        exam_id: form.exam_id,
        schedule_date: form.schedule_date,
        start_time: form.start_time,
        end_time: form.end_time,
        duration_minutes: form.duration_minutes,
        target_sub_group_ids: form.selected_targets,
        room: form.room,
        supervisor_name: form.supervisor_name,
        session_notes: form.session_notes,
        access_code: form.access_code,
        require_login: form.require_login,
      }
      await axios.post(`${API_URL}/api/school-admin/exam-schedules`, payload, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      navigate('/school-admin/dashboard/exam-schedules')
    } catch (e: unknown) {
      setError(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/school-admin/dashboard/exam-schedules')}
            className="grid h-9 w-9 place-items-center rounded-xl border border-tp-border bg-white text-tp-muted hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-bold text-tp-text">Memuat...</h1>
        </div>
        <div className="h-96 animate-pulse rounded-2xl border border-tp-border bg-white" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/school-admin/dashboard/exam-schedules')}
          className="grid h-9 w-9 place-items-center rounded-xl border border-tp-border bg-white text-tp-muted hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-tp-text">Buat Jadwal Ujian</h1>
          <p className="text-xs text-tp-muted">
            Tentukan waktu, peserta, dan akses ujian
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Mode picker */}
      <div className="rounded-2xl border border-tp-border bg-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-tp-muted">
          Sumber Soal
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ModeCard
            active={mode === 'pick'}
            onClick={() => setMode('pick')}
            icon={<FileText size={18} />}
            title="Ambil dari Bank Soal"
            desc="Pilih ujian yang sudah dipublish"
          />
          <ModeCard
            active={mode === 'custom'}
            onClick={() => setMode('custom')}
            icon={<Sparkles size={18} />}
            title="Buat Baru"
            desc="Buat soal baru + jadwal sekaligus"
          />
        </div>
      </div>

      {/* STEP 1: Pilih exam */}
      {mode === 'pick' && (
        <div className="rounded-2xl border border-tp-border bg-white p-6">
          <label className="mb-2 block text-sm font-bold text-tp-text">
            Pilih Ujian <span className="text-rose-500">*</span>
          </label>

          {exams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-tp-border bg-slate-50/50 p-6 text-center">
              <p className="mb-1 text-sm font-semibold text-tp-text">
                Belum ada ujian published
              </p>
              <p className="text-xs text-tp-muted">
                Buat ujian dulu di menu "Kelola Ujian" atau pakai mode "Buat Baru".
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {exams.map((e) => {
                const isSelected = form.exam_id === e.id
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      setField('exam_id', e.id)
                      setSelectedExam(e)
                      setField('selected_targets', [])
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-tp-green bg-tp-green/5 ring-2 ring-tp-green/20'
                        : 'border-tp-border hover:border-tp-green/40'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-bold text-tp-text">
                          {e.title}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-tp-muted">
                          {e.subject}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-tp-muted">
                        <span>{e.total_questions} soal</span>
                        <span>•</span>
                        <span>{e.duration_minutes} menit</span>
                        <span>•</span>
                        <span>
                          {e.targets.length} sub kelas target
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tp-green text-white text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Waktu */}
      {selectedExam && (
        <>
          <div className="rounded-2xl border border-tp-border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-tp-green" />
              <h3 className="text-sm font-bold text-tp-text">Waktu Pelaksanaan</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-tp-text">
                  Tanggal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.schedule_date}
                  onChange={(e) => setField('schedule_date', e.target.value)}
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm focus:border-tp-green focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-tp-text">
                  Jam Mulai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setField('start_time', e.target.value)}
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm focus:border-tp-green focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-tp-text">
                  Jam Selesai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setField('end_time', e.target.value)}
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm focus:border-tp-green focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-tp-text">
                  Durasi (menit)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.duration_minutes}
                  onChange={(e) => setField('duration_minutes', parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm focus:border-tp-green focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-tp-faint">
                  Auto-adjust dari soal. Ubah jika perlu.
                </p>
              </div>
              <div className="flex items-end">
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  <Clock size={12} className="mr-1 inline" />
                  Siswa punya waktu <b>{form.duration_minutes} menit</b>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Peserta */}
          <div className="rounded-2xl border border-tp-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-tp-green" />
                <h3 className="text-sm font-bold text-tp-text">Peserta Ujian</h3>
              </div>
              <span className="text-[11px] text-tp-muted">
                {form.selected_targets.length} sub kelas dipilih
              </span>
            </div>

            {availableTargets.length === 0 ? (
              <p className="text-xs text-tp-muted">Memuat daftar kelas...</p>
            ) : (
              <div className="space-y-2">
                {availableTargets.map((t) => {
                  const checked = form.selected_targets.includes(t.class_sub_group_id)
                  return (
                    <label
                      key={t.class_sub_group_id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                        checked
                          ? 'border-tp-green bg-tp-green/5'
                          : 'border-tp-border hover:border-tp-green/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleTarget(t.class_sub_group_id)}
                      />
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 ${
                          checked
                            ? 'border-tp-green bg-tp-green text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {checked && '✓'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-tp-text">
                          {t.class_sub_group_name}
                        </div>
                        <div className="text-[11px] text-tp-muted">
                          {t.class_group_name} • {t.student_count} siswa
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            <div className="mt-4 rounded-xl bg-tp-green/5 p-3 text-center">
              <p className="text-xs text-tp-muted">
                Total peserta:{' '}
                <b className="text-tp-green">{totalStudents} siswa</b>
              </p>
            </div>
          </div>

          {/* STEP 4: Detail Pelaksanaan */}
          <div className="rounded-2xl border border-tp-border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-tp-green" />
              <h3 className="text-sm font-bold text-tp-text">Detail Pelaksanaan</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-tp-text">
                  Ruang
                </label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) => setField('room', e.target.value)}
                  placeholder="Contoh: Lab Komputer 1"
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm focus:border-tp-green focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-tp-text">
                  Pengawas
                </label>
                <input
                  type="text"
                  list="supervisors"
                  value={form.supervisor_name}
                  onChange={(e) => setField('supervisor_name', e.target.value)}
                  placeholder="Nama pengawas"
                  className="w-full rounded-xl border border-tp-border px-3.5 py-2.5 text-sm focus:border-tp-green focus:outline-none"
                />
                <datalist id="supervisors">
                  {SUPERVISOR_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-tp-text">
                Catatan
              </label>
              <textarea
                rows={2}
                value={form.session_notes}
                onChange={(e) => setField('session_notes', e.target.value)}
                placeholder="Catatan untuk siswa (opsional)"
                className="w-full resize-none rounded-xl border border-tp-border px-3.5 py-2.5 text-sm focus:border-tp-green focus:outline-none"
              />
            </div>
          </div>

          {/* STEP 5: Akses Siswa */}
          <div className="rounded-2xl border border-tp-border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Lock size={16} className="text-tp-green" />
              <h3 className="text-sm font-bold text-tp-text">Akses Siswa</h3>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-tp-text">
                Kode Akses
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.access_code}
                  onChange={(e) => setField('access_code', e.target.value.toUpperCase())}
                  maxLength={10}
                  className="flex-1 rounded-xl border border-tp-border px-3.5 py-2.5 font-mono text-sm font-bold tracking-wider focus:border-tp-green focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setField('access_code', generateAccessCode())}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-tp-border bg-white px-4 py-2.5 text-xs font-semibold text-tp-muted hover:bg-slate-50"
                >
                  <RefreshCw size={12} /> Generate
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-tp-faint">
                Bagikan kode ini ke siswa untuk masuk ujian
              </p>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-tp-border p-3.5">
              <input
                type="checkbox"
                checked={form.require_login}
                onChange={(e) => setField('require_login', e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-tp-green"
              />
              <div>
                <span className="text-sm font-semibold text-tp-text">
                  Wajib login siswa
                </span>
                <p className="text-[11px] text-tp-muted">
                  Jika dicentang, siswa harus login pakai akun sekolah.
                  Jika tidak, siswa cukup input NISN + kode akses.
                </p>
              </div>
            </label>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/school-admin/dashboard/exam-schedules')}
          disabled={submitting}
          className="rounded-xl border border-tp-border bg-white px-5 py-2.5 text-sm font-semibold text-tp-muted hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-tp-green px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-tp-green-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Menyimpan...' : 'Buat Jadwal'}
        </button>
      </div>
    </div>
  )
}


function ModeCard({
  active, onClick, icon, title, desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
        active
          ? 'border-tp-green bg-tp-green/5 ring-2 ring-tp-green/20'
          : 'border-tp-border hover:border-tp-green/40'
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
          active ? 'bg-tp-green text-white' : 'bg-slate-100 text-tp-muted'
        }`}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-tp-text">{title}</p>
        <p className="text-[11px] text-tp-muted">{desc}</p>
      </div>
    </button>
  )
}


function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    return (e.response?.data as { error?: string } | undefined)?.error || e.message
  }
  if (e instanceof Error) return e.message
  return String(e)
}