import { useNavigate } from 'react-router-dom'

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconArrowUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

function IconVideo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 10l4.5-2.5v9L15 14" />
      <rect x="3" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  )
}

function IconStop() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

const weekBars = [
  { day: 'S', height: 42, muted: true },
  { day: 'M', height: 68, muted: false },
  { day: 'T', height: 88, muted: false, active: true, tip: '74%' },
  { day: 'W', height: 55, muted: false },
  { day: 'T', height: 72, muted: true },
  { day: 'F', height: 48, muted: false },
  { day: 'S', height: 35, muted: true },
]

const projects = [
  { name: 'Bank Soal Matematika', due: 'Deadline: Jumat', color: '#dbeafe', emoji: '📐' },
  { name: 'Asesmen Bahasa Indonesia', due: 'Deadline: Senin', color: '#fce7f3', emoji: '📝' },
  { name: 'Modul IPA Fase D', due: 'Deadline: Rabu', color: '#d1fae5', emoji: '🔬' },
  { name: 'RPP Kelas 8', due: 'Deadline: Kamis', color: '#fef3c7', emoji: '📋' },
]

const team = [
  { name: 'Anda', task: 'Menyusun bank soal AI', status: 'In Progress', badge: 'warning', color: '#0f4c36' },
  { name: 'Identitas Sekolah', task: 'Lengkapi profil perangkat', status: 'Pending', badge: 'danger', color: '#0284c7' },
  { name: 'Token AI', task: 'Saldo siap digunakan', status: 'Completed', badge: 'success', color: '#7c3aed' },
]

const badgeClass: Record<string, string> = {
  success: 'bg-tp-mint-soft text-tp-green',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-sky-50 text-sky-600',
}

export default function DashboardOverview({ tokenBalance }: { tokenBalance: number }) {
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-tp-text sm:text-[28px]">Dashboard</h1>
          <p className="text-sm text-tp-muted">
            Rencanakan, prioritaskan, dan selesaikan administrasi mengajar dengan mudah.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2.5 sm:w-auto">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-tp-green px-[18px] py-[11px] text-sm font-semibold text-white transition hover:bg-tp-green-hover active:scale-[0.98] sm:flex-none"
            onClick={() => navigate('/question-bank')}
          >
            <IconPlus /> Buat Bank Soal
          </button>
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-[1.5px] border-tp-green bg-white px-[18px] py-[11px] text-sm font-semibold text-tp-green transition hover:bg-tp-mint-soft active:scale-[0.98] sm:flex-none"
            onClick={() => navigate('/profile')}
          >
            Atur Identitas
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-green bg-tp-green p-[22px] text-white shadow-tp sm:min-h-[140px]">
          <div className="flex items-start justify-between">
            <span className="text-[13px] font-medium text-white/80">Saldo Token AI</span>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-white/12 text-white">
              <IconArrowUp />
            </span>
          </div>
          <div className="text-[32px] font-bold leading-none tracking-tight text-white">{tokenBalance}</div>
          <div className="mt-auto text-xs text-white/70">Siap digunakan untuk generate soal</div>
        </div>

        <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-border bg-white p-[22px] shadow-tp sm:min-h-[140px]">
          <div className="flex items-start justify-between">
            <span className="text-[13px] font-medium text-tp-muted">Status Akun</span>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-tp-border bg-white text-tp-muted">
              <IconArrowUp />
            </span>
          </div>
          <div className="text-[22px] font-bold leading-none tracking-tight text-tp-text">Aktif</div>
          <div className="mt-auto text-xs text-tp-faint">Terverifikasi & siap pakai</div>
        </div>

        <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-border bg-white p-[22px] shadow-tp sm:min-h-[140px]">
          <div className="flex items-start justify-between">
            <span className="text-[13px] font-medium text-tp-muted">Perangkat Ajar</span>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-tp-border bg-white text-tp-muted">
              <IconArrowUp />
            </span>
          </div>
          <div className="text-[32px] font-bold leading-none tracking-tight text-tp-text">12</div>
          <div className="mt-auto text-xs text-tp-faint">Dalam penyusunan bulan ini</div>
        </div>

        <div className="flex min-h-[120px] flex-col gap-2 rounded-tp border border-tp-border bg-white p-[22px] shadow-tp sm:min-h-[140px]">
          <div className="flex items-start justify-between">
            <span className="text-[13px] font-medium text-tp-muted">Bank Soal</span>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-tp-border bg-white text-tp-muted">
              <IconArrowUp />
            </span>
          </div>
          <div className="text-[32px] font-bold leading-none tracking-tight text-tp-text">48</div>
          <div className="mt-auto text-xs text-tp-faint">Item soal tersimpan</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr]">
        <div className="min-h-0 rounded-tp border border-tp-border bg-white p-[18px] shadow-tp sm:p-[22px] md:col-span-2 xl:col-span-1">
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-tp-text">Aktivitas Mingguan</h3>
            <button type="button" className="border-0 bg-transparent p-0 text-[13px] font-semibold text-tp-green">
              Lihat detail
            </button>
          </div>
          <div className="flex h-[140px] items-end justify-between gap-2.5 pt-2 sm:h-40">
            {weekBars.map((bar, i) => (
              <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={`${bar.day}-${i}`}>
                <div
                  className={`relative w-full max-w-9 rounded-t-[10px] rounded-b ${
                    bar.active
                      ? 'bg-[#3d9b6e]'
                      : bar.muted
                        ? 'bg-[repeating-linear-gradient(-45deg,#e5e7eb,#e5e7eb_4px,#f3f4f6_4px,#f3f4f6_8px)]'
                        : 'bg-tp-mint'
                  }`}
                  style={{ height: `${bar.height}%` }}
                >
                  {bar.tip ? (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-tp-text px-[7px] py-0.5 text-[11px] font-bold text-white">
                      {bar.tip}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs font-medium text-tp-faint">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-0 rounded-tp border border-tp-border bg-white p-[18px] shadow-tp sm:p-[22px]">
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-tp-text">Pengingat</h3>
          </div>
          <div className="mb-2 text-xs text-tp-faint">Hari ini · 10:00</div>
          <div className="mb-1.5 text-lg font-bold leading-snug tracking-tight text-tp-text">
            Selesaikan identitas perangkat ajar
          </div>
          <p className="mb-5 text-[13px] leading-relaxed text-tp-muted">
            Lengkapi data sekolah & mata pelajaran agar dokumen asesmen siap dicetak.
          </p>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-tp-green px-[18px] py-[11px] text-sm font-semibold text-white transition hover:bg-tp-green-hover"
            onClick={() => navigate('/profile')}
          >
            <IconVideo /> Buka Identitas
          </button>
        </div>

        <div className="min-h-0 rounded-tp border border-tp-border bg-white p-[18px] shadow-tp sm:p-[22px]">
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-tp-text">Proyek</h3>
            <button
              type="button"
              className="rounded-xl border-[1.5px] border-tp-green bg-white px-3 py-1.5 text-xs font-semibold text-tp-green"
              onClick={() => navigate('/question-bank')}
            >
              + Baru
            </button>
          </div>
          <div className="flex flex-col gap-3.5">
            {projects.map((p) => (
              <div className="flex items-center gap-3" key={p.name}>
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-sm"
                  style={{ background: p.color }}
                >
                  {p.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-[13px] font-semibold text-tp-text">{p.name}</strong>
                  <span className="text-xs text-tp-faint">{p.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr]">
        <div className="min-h-0 rounded-tp border border-tp-border bg-white p-[18px] shadow-tp sm:p-[22px] md:col-span-2 xl:col-span-1">
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-tp-text">Kolaborasi & Status</h3>
            <button
              type="button"
              className="rounded-xl border-[1.5px] border-tp-green bg-white px-3 py-1.5 text-xs font-semibold text-tp-green"
              onClick={() => navigate('/question-bank')}
            >
              + Tambah
            </button>
          </div>
          <div className="flex flex-col gap-3.5">
            {team.map((member) => (
              <div className="flex items-center gap-3" key={member.name}>
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white"
                  style={{ background: member.color }}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-[13px] font-semibold text-tp-text">{member.name}</strong>
                  <span className="block truncate text-xs text-tp-faint">{member.task}</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass[member.badge] ?? badgeClass.info}`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col items-center rounded-tp border border-tp-border bg-white p-[18px] text-center shadow-tp sm:p-[22px]">
          <div className="mb-[18px] w-full">
            <h3 className="text-left text-base font-bold text-tp-text">Progress Perangkat</h3>
          </div>
          <div className="relative my-2 mb-4 h-[110px] w-[180px]">
            <svg viewBox="0 0 180 110" className="h-[110px] w-[180px] overflow-visible">
              <path d="M20 100 A70 70 0 0 1 160 100" fill="none" stroke="#e8eaed" strokeWidth="14" strokeLinecap="round" />
              <path d="M20 100 A70 70 0 0 1 120 38" fill="none" stroke="#0f4c36" strokeWidth="14" strokeLinecap="round" />
              <path d="M120 38 A70 70 0 0 1 148 70" fill="none" stroke="#7dd3a7" strokeWidth="14" strokeLinecap="round" />
            </svg>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
              <strong className="block text-[28px] font-bold leading-none tracking-tight text-tp-text">41%</strong>
              <span className="text-xs text-tp-faint">Selesai</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
            <div className="flex items-center gap-1.5 text-xs text-tp-muted">
              <span className="h-2 w-2 rounded-full bg-tp-green" /> Selesai
            </div>
            <div className="flex items-center gap-1.5 text-xs text-tp-muted">
              <span className="h-2 w-2 rounded-full bg-tp-mint" /> Proses
            </div>
            <div className="flex items-center gap-1.5 text-xs text-tp-muted">
              <span className="h-2 w-2 rounded-full bg-gray-300" /> Pending
            </div>
          </div>
        </div>

        <div className="relative min-h-0 overflow-hidden rounded-tp border-0 bg-gradient-to-br from-tp-green to-[#1a6b4a] p-[18px] text-white sm:p-[22px]">
          <div className="pointer-events-none absolute -top-[60px] -right-10 h-[200px] w-[200px] rounded-full bg-tp-mint/20" />
          <div className="relative mb-[18px]">
            <h3 className="text-base font-bold text-white">Time Tracker</h3>
          </div>
          <div className="relative my-5 mb-6 text-center text-4xl font-bold tracking-wider tabular-nums">01:24:08</div>
          <div className="relative flex justify-center gap-3">
            <button
              type="button"
              aria-label="Jeda"
              className="grid h-11 w-11 place-items-center rounded-full border-[1.5px] border-white/45 bg-white/10 text-white hover:bg-white/20"
            >
              <IconPause />
            </button>
            <button
              type="button"
              aria-label="Stop"
              className="grid h-11 w-11 place-items-center rounded-full border-[1.5px] border-white/45 bg-white/10 text-white hover:bg-white/20"
            >
              <IconStop />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
