import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface Ebook {
  id: string
  judul: string
  jenjang: string
  mata_pelajaran: string
  kategori: string // <-- Ditambahkan
  cover_url: string
  file_url: string
  created_at: string
}

export default function SuperAdminEbooks() {
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // State Form Tambah E-book
  const [judul, setJudul] = useState('')
  const [jenjang, setJenjang] = useState('SMA/MA')
  const [mataPelajaran, setMataPelajaran] = useState('')
  const [kategori, setKategori] = useState('Kurikulum Merdeka') 
  const [coverUrl, setCoverUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL
  const adminToken = localStorage.getItem('superadmin_token')

  const fetchEbooks = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/superadmin/ebooks`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      setEbooks(res.data.ebooks || [])
    } catch (err) {
      console.error('Gagal memuat e-book:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEbooks()
  }, [])

  const handleCreateEbook = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(
        `${API_URL}/api/superadmin/ebooks`,
        {
          judul,
          jenjang,
          mata_pelajaran: mataPelajaran,
          kategori, 
          cover_url: coverUrl,
          file_url: fileUrl,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      )
      alert('E-book berhasil ditambahkan!')
      setShowModal(false)
      // Reset form
      setJudul('')
      setMataPelajaran('')
      setKategori('Kurikulum Merdeka')
      setCoverUrl('')
      setFileUrl('')
      fetchEbooks()
    } catch (err: any) {
      alert('Gagal menambah e-book: ' + (err.response?.data?.error || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEbook = async (id: string, judulBuku: string) => {
    if (!confirm(`Yakin ingin menghapus e-book "${judulBuku}"?`)) return

    try {
      await axios.delete(`${API_URL}/api/superadmin/ebooks/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      alert('E-book berhasil dihapus.')
      fetchEbooks()
    } catch (err: any) {
      alert('Gagal menghapus e-book: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-tp-text">Kelola E-Book Referensi</h1>
          <p className="text-sm text-tp-muted">Tambah dan kelola daftar buku pegangan kurikulum untuk guru.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-tp-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-tp-green-hover"
        >
          + Tambah E-Book
        </button>
      </div>

      {/* Tabel E-Books */}
      <div className="rounded-2xl border border-tp-border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-tp-muted">Memuat data e-book...</div>
        ) : ebooks.length === 0 ? (
          <div className="p-8 text-center text-sm text-tp-muted">Belum ada data e-book yang tersimpan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-tp-border bg-gray-50/70 text-xs font-semibold text-tp-muted uppercase">
                  <th className="p-4">Judul Buku</th>
                  <th className="p-4">Jenjang</th>
                  <th className="p-4">Mata Pelajaran</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tp-border">
                {ebooks.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-semibold text-tp-text">{b.judul}</td>
                    <td className="p-4 text-tp-muted">{b.jenjang}</td>
                    <td className="p-4 text-tp-muted">{b.mata_pelajaran}</td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-tp-green border border-emerald-200">
                        {b.kategori || 'Kurikulum Merdeka'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={b.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
                        >
                          Lihat PDF
                        </a>
                        <button
                          onClick={() => handleDeleteEbook(b.id, b.judul)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah E-Book */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-tp-text">Tambah E-Book Baru</h2>
            <form onSubmit={handleCreateEbook} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Judul Buku</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika Kelas X SMA"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Jenjang</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                  >
                    <option value="SD/MI">SD/MI</option>
                    <option value="SMP/MTs">SMP/MTs</option>
                    <option value="SMA/MA">SMA/MA</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Matematika"
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                    value={mataPelajaran}
                    onChange={(e) => setMataPelajaran(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">Kategori Buku</label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green bg-white"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Kurikulum 2013">Kurikulum 2013</option>
                  <option value="Nonteks">Nonteks (Buku Pengayaan/Literasi)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">URL File PDF (Link Resmi / Cloudflare R2)</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">URL Cover Buku (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-tp-green"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-tp-green px-4 py-2 text-sm font-semibold text-white hover:bg-tp-green-hover disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan E-Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}