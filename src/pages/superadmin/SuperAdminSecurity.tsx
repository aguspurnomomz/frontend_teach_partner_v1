import React, { useState } from 'react'
import axios from 'axios'
import * as Sentry from '@sentry/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KeyRound, Eye, EyeOff, Laptop, Server, Activity, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

interface LogItem {
  id: number
  email: string
  action: string
  ip_address: string
  user_agent: string
  details: string
  created_at: string
}

interface SuperAdminSecurityProps {
  logs: LogItem[]
  onRefreshLogs: () => void
}

export default function SuperAdminSecurity({ logs, onRefreshLogs }: SuperAdminSecurityProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  // State untuk Pagination (5 item per halaman)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  const handleTestSentryFrontend = () => {
    try {
      throw new Error('Test Error dari Frontend React Superadmin!')
    } catch (err) {
      Sentry.captureException(err)
      alert('Berhasil! Error tes Frontend telah dikirim ke Sentry.')
    }
  }

  const handleTestSentryBackend = async () => {
    try {
      await axios.get(`${API_URL}/debug-sentry`)
    } catch (err: any) {
      alert('Berhasil! Endpoint tes Backend berhasil dipicu (Status 500). Cek dashboard Sentry Anda.')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok!')
      return
    }

    const confirmSave = window.confirm('Apakah Anda yakin ingin menyimpan kata sandi baru ini?')
    if (!confirmSave) return

    setChangingPass(true)
    try {
      const token = localStorage.getItem('superadmin_token')
      await axios.post(
        `${API_URL}/api/superadmin/change-password`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Kata sandi berhasil diubah!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onRefreshLogs()
    } catch (err: any) {
      alert('Gagal mengubah kata sandi: ' + (err.response?.data?.error || err.message))
    } finally {
      setChangingPass(false)
    }
  }

  // Kalkulasi data untuk pagination
  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage)

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-tp-text sm:text-[28px]">Keamanan & Log Aktivitas</h1>
        <p className="text-sm text-tp-muted">Perbarui kata sandi, uji monitoring error, dan pantau riwayat jejak keamanan administrator sistem.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Form Ganti Sandi */}
        <Card className="rounded-2xl border-tp-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-tp-text flex items-center gap-2">
              <KeyRound size={18} className="text-tp-green" /> Ubah Kata Sandi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label className="text-xs">Kata Sandi Lama</Label>
                <div className="relative flex items-center">
                  <Input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowOldPass(!showOldPass)}
                    tabIndex={-1}
                  >
                    {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs">Kata Sandi Baru (Min. 6 Karakter)</Label>
                <div className="relative flex items-center">
                  <Input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowNewPass(!showNewPass)}
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs">Konfirmasi Kata Sandi Baru</Label>
                <div className="relative flex items-center">
                  <Input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    tabIndex={-1}
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={changingPass}
                  className="rounded-xl bg-tp-green hover:bg-tp-green-hover text-white text-sm font-semibold"
                >
                  {changingPass ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 2. CARD PENGUJIAN SENTRY */}
        <Card className="rounded-2xl border-tp-border bg-white shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-tp-text flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              Pengujian Sentry Monitoring
            </CardTitle>
            <CardDescription className="text-xs">
              Pastikan integrasi pemantau kesalahan (Sentry) berjalan baik pada lingkungan Client maupun Server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestSentryFrontend}
              className="w-full flex items-center justify-between rounded-xl border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 h-12 px-4"
            >
              <span className="flex items-center gap-2"><Laptop size={16} /> Trigger Error Frontend (React)</span>
              <span className="rounded-md bg-indigo-200/60 px-2 py-0.5 text-[10px] font-bold">Client</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleTestSentryBackend}
              className="w-full flex items-center justify-between rounded-xl border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 h-12 px-4"
            >
              <span className="flex items-center gap-2"><Server size={16} /> Trigger Panic Backend (Golang)</span>
              <span className="rounded-md bg-rose-200/60 px-2 py-0.5 text-[10px] font-bold">Server</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Riwayat Log Aktivitas dengan Pagination */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-tp-text flex items-center gap-2">
            <Activity size={18} className="text-tp-green" /> Riwayat Log Keamanan (Audit Trail)
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={onRefreshLogs}
            className="rounded-xl border-tp-border bg-white gap-1.5 text-xs h-8"
          >
            <RefreshCw size={14} /> Muat Ulang Log
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-tp-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-tp-border bg-gray-50 text-xs font-semibold uppercase tracking-wider text-tp-muted">
                <tr>
                  <th className="px-5 py-3.5">Waktu</th>
                  <th className="px-5 py-3.5">Aksi / Aktivitas</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5">Detail / Perangkat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tp-border">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-tp-muted text-xs">
                      Belum ada catatan log aktivitas keamanan.
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="transition hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 text-xs text-tp-muted whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          log.action === 'LOGIN_SUCCESS' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : log.action === 'CHANGE_PASSWORD'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-tp-muted">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-tp-text max-w-xs truncate" title={log.user_agent}>
                        {log.details || log.user_agent || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Kontrol Navigasi Pagination */}
          {logs.length > 0 && (
            <div className="flex items-center justify-between border-t border-tp-border bg-gray-50/50 px-5 py-3 text-xs text-tp-muted">
              <div>
                Menampilkan <span className="font-semibold text-tp-text">{startIndex + 1}</span> -{' '}
                <span className="font-semibold text-tp-text">{Math.min(startIndex + itemsPerPage, logs.length)}</span> dari{' '}
                <span className="font-semibold text-tp-text">{logs.length}</span> log
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-8 rounded-lg gap-1 bg-white text-xs"
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </Button>
                <span className="font-medium text-tp-text px-1">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 rounded-lg gap-1 bg-white text-xs"
                >
                  Selanjutnya <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}