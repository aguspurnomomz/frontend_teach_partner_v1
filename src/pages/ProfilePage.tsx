import React, { useEffect, useState } from 'react'
import axios from 'axios'

const fieldClass =
  'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-tp-text outline-none transition focus:border-tp-green focus:shadow-[0_0_0_3px_rgba(15,76,54,0.12)]'

const labelClass = 'mb-1.5 block text-[13px] font-semibold text-gray-700'

const sectionTitleClass =
  'mb-3 border-b border-slate-200 pb-1.5 text-base font-semibold text-slate-900'

const gridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'

export default function ProfilePage({ session }: { session: any }) {
  const [profile, setProfile] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    axios
      .get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      .then((res) => {
        setProfile(res.data.profile)
        setLoading(false)
      })
      .catch((err) => console.error(err))
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.put(`${API_URL}/api/profile`, profile, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      alert('Identitas perangkat berhasil diperbarui!')
    } catch (err) {
      alert('Gagal menyimpan profil.')
    }
  }

  if (loading) return <p className="text-tp-muted">Memuat data identitas...</p>

  return (
    <div className="rounded-tp border border-tp-border bg-white p-6 shadow-tp sm:p-[30px]">
      <div className="mb-6">
        <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-tp-text">
          Identitas Perangkat & Sekolah
        </h1>
        <p className="text-sm text-tp-muted">
          Lengkapi seluruh data administrasi ini agar otomatis tersemat pada dokumen asesmen dan jurnal Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <h3 className={sectionTitleClass}>1. Data Guru & Akademik</h3>
          <div className={gridClass}>
            <div>
              <label className={labelClass}>Nama Guru</label>
              <input className={fieldClass} name="nama_guru" value={profile.nama_guru || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>NIP Guru</label>
              <input className={fieldClass} name="nip_guru" value={profile.nip_guru || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Mata Pelajaran</label>
              <input className={fieldClass} name="mata_pelajaran" value={profile.mata_pelajaran || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Fase</label>
              <input className={fieldClass} name="fase" value={profile.fase || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Kelas</label>
              <input className={fieldClass} name="kelas" value={profile.kelas || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Semester</label>
              <input className={fieldClass} name="semester" value={profile.semester || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Tahun Pelajaran</label>
              <input className={fieldClass} name="tahun_pelajaran" value={profile.tahun_pelajaran || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div>
          <h3 className={sectionTitleClass}>2. Data Satuan Pendidikan & Wilayah</h3>
          <div className={gridClass}>
            <div>
              <label className={labelClass}>Nama Sekolah</label>
              <input className={fieldClass} name="nama_sekolah" value={profile.nama_sekolah || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>NPSN</label>
              <input className={fieldClass} name="npsn" value={profile.npsn || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Alamat Sekolah</label>
              <input className={fieldClass} name="alamat_sekolah" value={profile.alamat_sekolah || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Kecamatan / Kabupaten</label>
              <input className={fieldClass} name="kecamatan_kabupaten" value={profile.kecamatan_kabupaten || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Kota / Kabupaten</label>
              <input className={fieldClass} name="kota_kabupaten" value={profile.kota_kabupaten || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Kode Pos</label>
              <input className={fieldClass} name="kode_pos" value={profile.kode_pos || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Telepon Sekolah</label>
              <input className={fieldClass} name="telepon_sekolah" value={profile.telepon_sekolah || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Email Sekolah</label>
              <input className={fieldClass} name="email_sekolah" value={profile.email_sekolah || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Website Sekolah</label>
              <input className={fieldClass} name="website_sekolah" value={profile.website_sekolah || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div>
          <h3 className={sectionTitleClass}>3. Data Kepala Sekolah & Validasi</h3>
          <div className={gridClass}>
            <div>
              <label className={labelClass}>Nama Kepala Sekolah</label>
              <input className={fieldClass} name="nama_kepala_sekolah" value={profile.nama_kepala_sekolah || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>NIP Kepala Sekolah</label>
              <input className={fieldClass} name="nip_kepala_sekolah" value={profile.nip_kepala_sekolah || ''} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass}>Tanggal Penandatanganan</label>
              <input className={fieldClass} name="tanggal_penandatanganan" value={profile.tanggal_penandatanganan || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-tp-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-tp-green-hover"
          >
            Simpan Seluruh Perubahan Profil
          </button>
        </div>
      </form>
    </div>
  )
}
