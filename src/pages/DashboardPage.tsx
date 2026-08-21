import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import axios from 'axios'
import QuestionBankPage from './QuestionBankPage' // Impor halaman Bank Soal yang baru

export default function Dashboard({ session }: { session: any }) {
  // State untuk mengontrol tampilan aktif ('dashboard' atau 'question-bank')
  const [currentView, setCurrentView] = useState<'dashboard' | 'question-bank'>('dashboard')

  const [profile, setProfile] = useState<any>({
    nama_guru: '',
    nip_guru: '',
    nama_sekolah: '',
    mata_pelajaran: '',
    fase: '',
    kelas: '',
    semester: '',
    tahun_pelajaran: '',
    nama_kepala_sekolah: '',
    nip_kepala_sekolah: '',
    kota_kabupaten: '',
    tanggal_penandatanganan: '',
    alamat_sekolah: '',
    kecamatan_kabupaten: '',
    kode_pos: '',
    telepon_sekolah: '',
    email_sekolah: '',
    npsn: '',
    website_sekolah: ''
  })
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  // Ambil data profil dari backend Go saat komponen dimuat[cite: 2]
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = session.access_token
      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(response.data.profile)
      setTokenBalance(response.data.token_balance)
    } catch (error) {
      console.error('Gagal mengambil profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = session.access_token
      await axios.put('http://localhost:8080/api/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Identitas perangkat berhasil diperbarui!')
    } catch (error) {
      console.error('Gagal memperbarui profil:', error)
      alert('Terjadi kesalahan saat menyimpan data.')
    }
  }

  if (loading) return <p>Memuat data...</p>

  // Jika user memilih menu Bank Soal, tampilkan komponen QuestionBankPage
  if (currentView === 'question-bank') {
    return <QuestionBankPage onBack={() => setCurrentView('dashboard')} />
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboard Identitas Perangkat</h2>
        {/* Tombol Navigasi ke Modul Bank Soal */}
        <button 
          onClick={() => setCurrentView('question-bank')} 
          style={{ padding: '8px 14px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          📚 Kelola Bank Soal
        </button>
      </div>

      <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0 }}><strong>Saldo Token Anda:</strong> {tokenBalance} Token</p>
        <button onClick={() => supabase.auth.signOut()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Logout</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
        <h3>Data Guru & Sekolah</h3>
        <input name="nama_guru" placeholder="Nama Guru" value={profile.nama_guru || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input name="nip_guru" placeholder="NIP Guru" value={profile.nip_guru || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input name="nama_sekolah" placeholder="Nama Sekolah" value={profile.nama_sekolah || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input name="mata_pelajaran" placeholder="Mata Pelajaran" value={profile.mata_pelajaran || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input name="kelas" placeholder="Kelas" value={profile.kelas || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input name="semester" placeholder="Semester" value={profile.semester || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input name="tahun_pelajaran" placeholder="Tahun Pelajaran" value={profile.tahun_pelajaran || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

        <h3>Data Kepala Sekolah & Wilayah</h3>
        <input name="nama_kepala_sekolah" placeholder="Nama Kepala Sekolah" value={profile.nama_kepala_sekolah || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input name="nip_kepala_sekolah" placeholder="NIP Kepala Sekolah" value={profile.nip_kepala_sekolah || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input name="kota_kabupaten" placeholder="Kota/Kabupaten" value={profile.kota_kabupaten || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />

        <button type="submit" style={{ padding: '12px', background: '#0f766e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontWeight: 600 }}>
          Simpan Perubahan
        </button>
      </form>
    </div>
  )
}