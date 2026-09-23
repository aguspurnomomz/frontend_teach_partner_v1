import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Copy, X } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import ExamStepper from './components/ExamStepper'
import ExamInfoForm from './components/ExamInfoForm'
import ExamQuestionBuilder from './components/ExamQuestionBuilder'
import ExamPreview from './components/ExamPreview'

const DEFAULT_DATA = {
  title: '',
  description: '',
  subject: '',
  exam_type: 'regular',
  grade_level: '',
  phase: '',
  academic_year_id: '',
  duration_minutes: 60,
  passing_score: 70,
  scoring_config: { multiple_choice: 1, essay: 5, essay_rubric: 'manual' },
  questions: [],
  targets: [],
}

export default function CreateExamPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const API_URL = import.meta.env.VITE_API_URL

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(DEFAULT_DATA)

  // Flag untuk notice "kamu sedang menduplikat ujian"
  const [duplicateSource, setDuplicateSource] = useState<string | null>(null)

  // Guard supaya duplicate hanya dijalankan sekali
  const duplicateHandledRef = useRef(false)

  // ==========================================
  // Handle duplicate mode (?duplicate=1)
  // ==========================================
  useEffect(() => {
    if (duplicateHandledRef.current) return

    const isDuplicate = searchParams.get('duplicate') === '1'
    if (!isDuplicate) return

    const src = sessionStorage.getItem('exam_duplicate_source')
    if (!src) {
      // Kalau gak ada source, bersihkan query param saja
      searchParams.delete('duplicate')
      setSearchParams(searchParams, { replace: true })
      return
    }

    try {
      const exam = JSON.parse(src)

      setData({
        title: `${exam.title || 'Ujian'} (Copy)`,
        description: exam.description || '',
        subject: exam.subject || '',
        exam_type: exam.exam_type || 'regular',
        grade_level: exam.grade_level || '',
        phase: exam.phase || '',
        academic_year_id: exam.academic_year_id || '',
        duration_minutes: exam.duration_minutes || 60,
        passing_score: exam.passing_score ?? 70,
        scoring_config: exam.scoring_config || {
          multiple_choice: 1,
          essay: 5,
          essay_rubric: 'manual',
        },
        questions: (exam.questions || []).map((q: any, i: number) => ({
          ...q,
          // Generate ID baru biar gak bentrok dengan ujian asal
          id: crypto.randomUUID?.() || `q-${Date.now()}-${i}`,
          order: q.order ?? i + 1,
        })),
        targets: (exam.targets || []).map((t: any) => ({
          class_group_id: t.class_group_id || '',
          class_sub_group_id: t.class_sub_group_id || '',
        })),
      })

      setDuplicateSource(exam.title || 'Ujian')
    } catch (e) {
      console.error('Gagal parsing exam_duplicate_source:', e)
      setError('Gagal memuat data duplikat. Silakan buat ujian baru dari awal.')
    } finally {
      // Selalu bersihkan sessionStorage & URL param
      sessionStorage.removeItem('exam_duplicate_source')
      searchParams.delete('duplicate')
      setSearchParams(searchParams, { replace: true })
      duplicateHandledRef.current = true
    }
  }, [searchParams, setSearchParams])

  // ==========================================
  // Handle save (draft / publish)
  // ==========================================
  const handleSave = async (publish: boolean) => {
    setSubmitting(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      // Sanitize: pastikan tiap question punya id & order
      const payload = {
        ...data,
        questions: (data.questions || []).map((q: any, i: number) => ({
          ...q,
          id: q.id || crypto.randomUUID?.() || `q-${Date.now()}-${i}`,
          order: q.order ?? i + 1,
        })),
      }

      const res = await axios.post(`${API_URL}/api/school-admin/exams`, payload, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })

      const examID = res.data.id

      if (publish) {
        await axios.patch(
          `${API_URL}/api/school-admin/exams/${examID}/publish`,
          {},
          { headers: { Authorization: `Bearer ${session?.access_token}` } }
        )
      }

      navigate('/school-admin/dashboard/exams')
    } catch (e: any) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ==========================================
  // Discard duplicate banner
  // ==========================================
  const dismissDuplicateBanner = () => {
    setDuplicateSource(null)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/school-admin/dashboard/exams')}
          className="grid h-9 w-9 place-items-center rounded-xl border border-tp-border bg-white text-tp-muted hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-tp-text">
            {duplicateSource ? 'Duplikat Ujian' : 'Buat Ujian Baru'}
          </h1>
          <p className="truncate text-xs text-tp-muted">
            {duplicateSource
              ? `Menyalin dari: ${duplicateSource}`
              : 'Susun soal PG dan Essay dalam satu ujian'}
          </p>
        </div>
      </div>

      {/* Banner duplicate info */}
      {duplicateSource && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
          <Copy size={16} className="mt-0.5 shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-blue-900">
              Mode Duplikat
            </p>
            <p className="text-[11px] text-blue-700">
              Semua data soal dari <b>"{duplicateSource}"</b> sudah disalin ke form ini.
              Silakan edit dan simpan sebagai ujian baru.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissDuplicateBanner}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-blue-600 hover:bg-blue-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stepper */}
      <ExamStepper current={step} />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Step content */}
      {step === 1 && (
        <ExamInfoForm data={data} onChange={setData} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <ExamQuestionBuilder
          data={data}
          onChange={setData}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <ExamPreview
          data={data}
          onBack={() => setStep(2)}
          onSaveDraft={() => handleSave(false)}
          onPublish={() => handleSave(true)}
          submitting={submitting}
        />
      )}
    </div>
  )
}