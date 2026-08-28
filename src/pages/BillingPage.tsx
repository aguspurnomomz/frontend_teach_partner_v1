import { useState, useEffect } from 'react'
import axios from 'axios'
import { supabase } from '../lib/supabaseClient' 

declare global {
  interface Window {
    snap: any;
  }
}

interface PackageItem {
  name: string
  tokens: number
  price: number
  description: string
  popular?: boolean
}

//feat : Masih hardcode kalo bisa dibuat design bisa atur token balance dan price serta desc-nya dari superadmin
const TOKEN_PACKAGES: PackageItem[] = [
  {
    name: 'Starter',
    tokens: 50,
    price: 25000,
    description: 'Cocok mencoba semua modul (~50x generate, 1 mapel 1 semester).'
  },
  {
    name: 'Profesional',
    tokens: 150,
    price: 55000,
    description: 'Paling laris! Untuk 2-3 semester penuh + Bank Soal & LKPD.',
    popular: true
  },
  {
    name: 'Premium',
    tokens: 500,
    price: 125000,
    description: 'Satu tahun penuh untuk 1-2 mapel, termasuk semua modul kokurikuler.'
  }
]

export default function BillingPage() {
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPkg, setSelectedPkg] = useState<PackageItem>(TOKEN_PACKAGES[1]) // Default Profesional
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [agreed, setAgreed] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'


  useEffect(() => {
    fetchProfile()
  }, [])

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      return session.access_token
    }
    return localStorage.getItem('token') || ''
  }

  const fetchProfile = async () => {
    try {
      const token = await getAuthToken()
      if (!token) {
        console.warn('Token sesi tidak ditemukan')
        setLoading(false)
        return
      }

      const res = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTokenBalance(res.data.token_balance || 0)
    } catch (err) {
      console.error('Gagal memuat profil pengguna', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!agreed) {
      alert('Mohon setujui Syarat & Ketentuan terlebih dahulu.')
      return
    }

    setSubmitting(true)
    try {
      const token = await getAuthToken()
      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login ulang.')
        window.location.href = '/'
        return
      }

      const res = await axios.post(
        `${API_URL}/api/payment/create-snap`,
        {
          package_name: selectedPkg.name,
          token_amount: selectedPkg.tokens,
          amount: selectedPkg.price
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        }
      )

      const { snap_token } = res.data

      setIsModalOpen(false)

      // Panggil Midtrans Snap Pop-up
      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: function (result: any) {
            alert('Pembayaran berhasil! Token akan otomatis ditambahkan ke akun Anda.')
            console.log(result)
            fetchProfile() // Refresh saldo token
          },
          onPending: function (result: any) {
            alert('Menunggu pembayaran Anda. Selesaikan pembayaran sesuai instruksi.')
            console.log(result)
          },
          onError: function (result: any) {
            alert('Pembayaran gagal. Silakan coba kembali.')
            console.log(result)
          },
          onClose: function () {
            console.log('Popup pembayaran ditutup.')
          }
        })
      } else {
        alert('Script Midtrans Snap belum dimuat dengan benar di index.html.')
      }
    } catch (err: any) {
      alert('Gagal membuat transaksi: ' + (err.response?.data?.error || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-tp-bg p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        
        {/* Tombol Kembali & Header */}
        <div className="mb-8">
          <a href="/" className="text-sm font-semibold text-tp-green hover:underline">
            ← Kembali ke aplikasi
          </a>
        </div>

        {/* Kotak Saldo Token */}
        <div className="mb-10 flex flex-col justify-between gap-6 rounded-3xl border border-tp-border bg-white p-6 shadow-tp-md sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-tp-green">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-tp-muted">Saldo Token</p>
              <h1 className="text-3xl font-extrabold text-tp-text">
                {loading ? '...' : `${tokenBalance} token`}
              </h1>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-tp-green px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-tp-green-hover active:scale-[0.98]"
          >
            ⚡ Beli Token Sekarang
          </button>
        </div>

        {/* Informasi Pembayaran Aman */}
        <div className="mb-10 rounded-2xl border border-tp-border bg-emerald-50/50 p-4 text-xs text-tp-text sm:text-sm">
          <span className="font-bold text-tp-green">Pembayaran aman — token aktif otomatis:</span>
          <span className="text-tp-muted"> 1) Pilih paket → 2) Bayar pakai QRIS / GoPay / Transfer Bank → 3) Token masuk otomatis dalam &lt; 1 menit.</span>
        </div>

        {/* Pilihan Paket Token */}
        <h2 className="mb-4 text-xl font-bold tracking-tight text-tp-text">Paket Token</h2>
        <p className="mb-6 text-sm text-tp-muted">Klik paket untuk memilih dan melanjutkan pembayaran.</p>

        <div className="grid gap-6 md:grid-cols-3">
          {TOKEN_PACKAGES.map((pkg) => {
            const isSelected = selectedPkg.name === pkg.name
            return (
              <div
                key={pkg.name}
                onClick={() => setSelectedPkg(pkg)}
                className={`relative flex cursor-pointer flex-col justify-between rounded-3xl border p-6 transition-all bg-white ${
                  isSelected ? 'border-tp-green ring-2 ring-tp-green/20 shadow-lg' : 'border-tp-border hover:border-gray-400'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-3 py-0.5 text-[11px] font-bold text-white shadow">
                    POPULER
                  </span>
                )}

                <div>
                  <h3 className="text-sm font-bold text-tp-muted">{pkg.name}</h3>
                  <div className="my-2 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-tp-text">{pkg.tokens}</span>
                    <span className="text-sm font-semibold text-tp-muted">token</span>
                  </div>
                  <p className="text-lg font-bold text-tp-green">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </p>
                  <p className="mt-4 text-xs leading-relaxed text-tp-muted">{pkg.description}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPkg(pkg)
                    setIsModalOpen(true)
                  }}
                  className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-tp-green text-white hover:bg-tp-green-hover'
                      : 'bg-gray-100 text-tp-text hover:bg-gray-200'
                  }`}
                >
                  Pilih {pkg.name}
                </button>
              </div>
            )
          })}
        </div>

      </div>

      {/* MODAL KONFIRMASI PEMBELIAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h3 className="text-xl font-bold text-tp-text">Konfirmasi Pembelian</h3>
            <p className="mt-1 text-xs text-tp-muted">Pilih paket, lalu bayar dengan metode favorit Anda.</p>

            {/* Ringkasan Paket Terpilih */}
            <div className="my-6 rounded-2xl border border-tp-border bg-gray-50 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-tp-text">Paket {selectedPkg.name}</span>
                <span className="font-extrabold text-tp-green">{selectedPkg.tokens} Token</span>
              </div>
              <p className="text-2xl font-black text-tp-text">Rp {selectedPkg.price.toLocaleString('id-ID')}</p>
              <p className="mt-2 text-[11px] text-tp-muted">{selectedPkg.description}</p>
            </div>

            {/* Checkbox Persetujuan */}
            <div className="mb-6 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-tp-green focus:ring-tp-green"
              />
              <label htmlFor="agree" className="text-xs text-tp-muted leading-relaxed">
                Saya menyetujui <span className="font-semibold text-tp-text underline">Syarat & Ketentuan</span> dan <span className="font-semibold text-tp-text underline">Kebijakan Refund</span> untuk transaksi ini.
              </label>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-tp-border bg-white py-3 text-xs font-semibold text-tp-text transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCheckout}
                className="flex-1 rounded-xl bg-tp-green py-3 text-xs font-semibold text-white transition hover:bg-tp-green-hover disabled:opacity-50"
              >
                {loading || submitting ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}