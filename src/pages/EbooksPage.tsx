import { useEffect, useMemo, useState, useCallback } from 'react'
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

interface EbookPublicItem {
  id: string
  judul: string
  jenjang: string
  mata_pelajaran: string
  kategori: string
  cover_url: string
  file_url: string
}

const PAGE_SIZE = 9

const JENJANG_OPTIONS = ['SD/MI', 'SMP/MTs', 'SMA/MA', 'SMA/MA/SMK/MAK']
const KATEGORI_OPTIONS = ['Kurikulum Merdeka', 'Kurikulum 2013', 'Nonteks']

// Single-flight cache untuk mencegah request duplikat
let fetchPromise: Promise<any> | null = null

function CoverImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  const hasSrc = Boolean(src?.trim()) && !failed

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg ring-1 ring-black/5">
      {hasSrc ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
          <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          <span className="text-xs font-medium text-slate-500">Cover tidak tersedia</span>
        </div>
      )}
    </div>
  )
}

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<EbookPublicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJenjang, setSelectedJenjang] = useState<string[]>([])
  const [selectedKategori, setSelectedKategori] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    let isMounted = true

    const fetchEbooks = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        // Single-flight: hanya buat 1 promise untuk semua panggilan
        if (!fetchPromise) {
          fetchPromise = axios.get(`${API_URL}/api/ebooks-list`, {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          })
        }

        const res = await fetchPromise
        
        if (isMounted) {
          setEbooks(res.data.ebooks || [])
        }
      } catch (err) {
        console.error('Gagal memuat e-book:', err)
        // 👇 Reset cache saat error agar bisa dicoba lagi
        fetchPromise = null
        if (isMounted) setEbooks([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchEbooks()

    return () => {
      isMounted = false
      // Reset cache saat unmount (opsional, untuk mencegah memory leak)
      // fetchPromise = null
    }
  }, [API_URL])

  const handleAccessBook = useCallback(async (_ebookId: string, _actionType: 'view' | 'download', fileUrl: string) => {
    if (!fileUrl) return
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }, [])

  const handleJenjangChange = (jenjang: string) => {
    setSelectedJenjang((prev) =>
      prev.includes(jenjang) ? prev.filter((j) => j !== jenjang) : [...prev, jenjang]
    )
  }

  const handleKategoriChange = (kategori: string) => {
    setSelectedKategori((prev) =>
      prev.includes(kategori) ? prev.filter((k) => k !== kategori) : [...prev, kategori]
    )
  }

  const filteredEbooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return ebooks.filter((book) => {
      const matchesSearch =
        !q ||
        book.judul?.toLowerCase().includes(q) ||
        book.mata_pelajaran?.toLowerCase().includes(q)

      const matchesJenjang =
        selectedJenjang.length === 0 || selectedJenjang.includes(book.jenjang)

      const matchesKategori =
        selectedKategori.length === 0 || selectedKategori.includes(book.kategori)

      return matchesSearch && matchesJenjang && matchesKategori
    })
  }, [ebooks, searchQuery, selectedJenjang, selectedKategori])

  // Reset ke halaman 1 saat filter/pencarian berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedJenjang, selectedKategori])

  const totalPages = Math.max(1, Math.ceil(filteredEbooks.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedEbooks = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredEbooks.slice(start, start + PAGE_SIZE)
  }, [filteredEbooks, safePage])

  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxButtons = 5
    let start = Math.max(1, safePage - Math.floor(maxButtons / 2))
    let end = Math.min(totalPages, start + maxButtons - 1)
    start = Math.max(1, end - maxButtons + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [safePage, totalPages])

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-tp-text">Katalog E-Book & Referensi Mengajar</h1>
        <p className="text-sm text-tp-muted">
          Akses buku teks kurikulum dan referensi literasi untuk mendukung kegiatan belajar mengajar.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-72">
          <div className="rounded-2xl border border-tp-border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-tp-text">Jenjang</h3>
            <div className="flex flex-col gap-2.5 text-sm text-tp-muted">
              {JENJANG_OPTIONS.map((jenjang) => (
                <label key={jenjang} className="flex cursor-pointer select-none items-center gap-2.5 hover:text-tp-text">
                  <input
                    type="checkbox"
                    checked={selectedJenjang.includes(jenjang)}
                    onChange={() => handleJenjangChange(jenjang)}
                    className="h-4 w-4 rounded border-gray-300 text-tp-green focus:ring-tp-green"
                  />
                  {jenjang}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-tp-border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-tp-text">Kategori Buku</h3>
            <div className="flex flex-col gap-2.5 text-sm text-tp-muted">
              {KATEGORI_OPTIONS.map((kat) => (
                <label key={kat} className="flex cursor-pointer select-none items-center gap-2.5 hover:text-tp-text">
                  <input
                    type="checkbox"
                    checked={selectedKategori.includes(kat)}
                    onChange={() => handleKategoriChange(kat)}
                    className="h-4 w-4 rounded border-gray-300 text-tp-green focus:ring-tp-green"
                  />
                  {kat}
                </label>
              ))}
            </div>
          </div>

          {/* KARTU INFORMASI SUMBER / COPYRIGHT */}
          <div className="rounded-2xl border border-tp-border bg-gray-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-4 w-4 text-tp-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-xs font-bold uppercase tracking-wider text-tp-text">Sumber & Hak Cipta</h4>
            </div>
            <p className="text-xs leading-relaxed text-tp-muted">
              Materi buku referensi dikurasi dari <span className="font-semibold text-tp-text">Sistem Informasi Perbukuan Indonesia (SIBI)</span> Kementerian Pendidikan Dasar dan Menengah Republik Indonesia. Hak cipta dokumen dilindungi undang-undang dan disediakan untuk mendukung pembelajaran guru secara gratis.
            </p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-tp-border bg-white px-4 py-3 shadow-sm">
            <svg className="h-5 w-5 shrink-0 text-tp-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Cari judul buku atau mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-tp-text outline-none"
            />
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-tp-muted">
            <span>
              Menampilkan {paginatedEbooks.length} dari {filteredEbooks.length} buku
              {filteredEbooks.length > 0 ? ` · Halaman ${safePage}/${totalPages}` : ''}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-tp-border bg-white p-12 text-center text-sm text-tp-muted shadow-sm">
              Memuat katalog e-book...
            </div>
          ) : filteredEbooks.length === 0 ? (
            <div className="rounded-2xl border border-tp-border bg-white p-12 text-center text-sm text-tp-muted shadow-sm">
              Tidak ada e-book yang cocok dengan filter atau pencarian Anda.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedEbooks.map((book) => (
                  <article key={book.id} className="group flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleAccessBook(book.id, 'view', book.file_url)}
                      className="text-left transition group-hover:-translate-y-0.5"
                      aria-label={`Buka ${book.judul}`}
                    >
                      <CoverImage src={book.cover_url} alt={`Cover ${book.judul}`} />
                    </button>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                        PDF
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-600 px-2.5 py-0.5 text-[11px] font-medium text-white">
                        {book.jenjang || 'Umum'}
                      </span>
                    </div>

                    <h3 className="mt-2 line-clamp-3 text-sm font-semibold leading-snug text-gray-900 md:text-[15px]">
                      {book.judul}
                    </h3>
                    {book.mata_pelajaran ? (
                      <p className="mt-1 text-xs text-tp-muted">{book.mata_pelajaran}</p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleAccessBook(book.id, 'view', book.file_url)}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-tp-green py-2 text-xs font-semibold text-white transition hover:bg-tp-green-hover"
                    >
                      Baca / Lihat PDF
                    </button>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  className="mt-2 flex flex-wrap items-center justify-center gap-2"
                  aria-label="Pagination e-book"
                >
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-tp-border bg-white px-3 py-2 text-xs font-semibold text-tp-text transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-9 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        page === safePage
                          ? 'bg-tp-green text-white'
                          : 'border border-tp-border bg-white text-tp-text hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl border border-tp-border bg-white px-3 py-2 text-xs font-semibold text-tp-text transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}