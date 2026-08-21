import React, { useState } from 'react'
import { createQuestionBank } from '../services/questionService'
import { supabase } from '../lib/supabaseClient'
import axios from 'axios'

export default function QuestionBankPage({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [phase, setPhase] = useState('Fase D')
  const [priceInTokens, setPriceInTokens] = useState(0)
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

 
  const [aiTopic, setAiTopic] = useState('')
  const [aiCount, setAiCount] = useState(3)
  const [aiType, setAiType] = useState('multiple_choice')
  const [aiCognitive, setAiCognitive] = useState('C4')
  const [generating, setGenerating] = useState(false)

 
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      question_type: 'multiple_choice',
      options: { a: '', b: '', c: '', d: '' },
      correct_answer: 'a',
      explanation: '',
      cognitive_level: 'C2'
    }
  ])

  
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: { a: '', b: '', c: '', d: '' },
        correct_answer: 'a',
        explanation: '',
        cognitive_level: 'C2'
      }
    ])
  }


  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    setQuestions(updated)
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated: any = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

 
  const handleAIGenerate = async () => {
    if (!aiTopic) {
      alert('Mohon masukkan topik materi terlebih dahulu untuk AI.')
      return
    }

    setGenerating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi login berakhir.')

      const response = await axios.post(
        'http://localhost:8080/api/ai/generate-questions',
        {
          topic: aiTopic,
          question_type: aiType,
          number_of_q: Number(aiCount),
          cognitive_level: aiCognitive
        },
        {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }
      )

    
      if (Array.isArray(response.data) && response.data.length > 0) {
        setQuestions(response.data)
        alert('Berhasil men-generate soal dengan AI!')
      } else {
        alert('Format respons AI tidak valid.')
      }
    } catch (err: any) {
      alert('Gagal generate AI: ' + (err.response?.data?.error || err.message))
    } finally {
      setGenerating(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createQuestionBank({
        title,
        description,
        subject,
        phase,
        price_in_tokens: Number(priceInTokens),
        is_public: isPublic,
        questions
      })
      alert('Bank soal berhasil dibuat dan disimpan!')
      onBack()
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: '30px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
      {/* TODO button kembali ke dashboard */}
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0f172a', margin: 0 }}>Buat Bank Soal & Asesmen</h2>
        <button onClick={onBack} style={{ padding: '8px 14px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Kembali ke Dashboard</button>
      </div> */}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Informasi Umum Paket Soal */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#334155' }}>Informasi Paket Soal</h3>
          
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Judul Paket Ujian / Modul</label>
            <input type="text" placeholder="Contoh: Penilaian Harian Sistem Pencernaan Manusia" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Mata Pelajaran</label>
              <input type="text" placeholder="IPA / Matematika" value={subject} onChange={(e) => setSubject(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Fase / Kelas</label>
              <input type="text" placeholder="Fase D / Kelas 8" value={phase} onChange={(e) => setPhase(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Deskripsi Singkat</label>
            <textarea placeholder="Keterangan tambahan untuk ujian ini..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          {/* Pengaturan Marketplace & Monetisasi Token */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '5px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              Bagikan ke Marketplace Bank Soal (Jual ke Guru Lain)
            </label>

            {isPublic && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Harga Token:</span>
                <input type="number" value={priceInTokens} onChange={(e) => setPriceInTokens(Number(e.target.value))} min={0} style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
            )}
          </div>
        </div>

        {/* Panel Generator AI */}
        <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#065f46' }}>✨ Asisten Generator Soal (AI)</h3>
          
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#047857' }}>Topik / Materi Pembelajaran</label>
            <input type="text" placeholder="Contoh: Enzim pencernaan lambung dan fungsinya" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #6ee7b7', background: 'white' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#047857' }}>Jumlah Soal</label>
              <input type="number" min={1} max={10} value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #6ee7b7', background: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#047857' }}>Tipe Soal</label>
              <select value={aiType} onChange={(e) => setAiType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #6ee7b7', background: 'white', fontSize: '13px' }}>
                <option value="multiple_choice">Pilihan Ganda</option>
                <option value="essay">Essay / Uraian</option>
                <option value="short_answer">Isian Singkat</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#047857' }}>Level Kognitif</label>
              <select value={aiCognitive} onChange={(e) => setAiCognitive(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #6ee7b7', background: 'white', fontSize: '13px' }}>
                <option value="C2">C2 - Memahami</option>
                <option value="C3">C3 - Penerapan</option>
                <option value="C4">C4 - Analisis (HOTS)</option>
              </select>
            </div>
          </div>

          <button type="button" onClick={handleAIGenerate} disabled={generating} style={{ padding: '10px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '5px' }}>
            {generating ? 'AI sedang meracik soal...' : '✨ Buat Soal Otomatis dengan AI'}
          </button>
        </div>

        {/* Daftar Butir Soal */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>Daftar Butir Soal ({questions.length})</h3>
            <button type="button" onClick={addQuestion} style={{ padding: '6px 12px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>+ Tambah Soal</button>
          </div>

          {questions.map((q, idx) => (
            <div key={idx} style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, color: '#475569' }}>Soal No. {idx + 1}</span>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(idx)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Hapus</button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tipe Soal</label>
                  <select value={q.question_type} onChange={(e) => handleQuestionChange(idx, 'question_type', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="multiple_choice">Pilihan Ganda (PG)</option>
                    <option value="complex_multiple_choice">Pilihan Ganda Kompleks</option>
                    <option value="matching">Menjodohkan</option>
                    <option value="true_false">Benar / Salah</option>
                    <option value="short_answer">Isian Singkat</option>
                    <option value="essay">Uraian / Essay</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Level Kognitif</label>
                  <select value={q.cognitive_level} onChange={(e) => handleQuestionChange(idx, 'cognitive_level', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                    <option value="C1">C1 - Mengingat</option>
                    <option value="C2">C2 - Memahami</option>
                    <option value="C3">C3 - Penerapan</option>
                    <option value="C4">C4 - Analisis (HOTS)</option>
                    <option value="C5">C5 - Evaluasi (HOTS)</option>
                    <option value="C6">C6 - Kreasi (HOTS)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pertanyaan / Wacana / Stimulus</label>
                <textarea placeholder="Tuliskan teks soal di sini..." value={q.question_text} onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)} rows={3} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Kunci Jawaban</label>
                  <input type="text" placeholder="Contoh: A atau [A, C]" value={q.correct_answer} onChange={(e) => handleQuestionChange(idx, 'correct_answer', e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pembahasan Soal</label>
                  <input type="text" placeholder="Penjelasan mengapa jawaban tersebut benar..." value={q.explanation} onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} style={{ padding: '14px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
          {loading ? 'Menyimpan...' : 'Simpan Bank Soal Permanen'}
        </button>

      </form>
    </div>
  )
}