import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import axios from 'axios'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import DisclaimerPage from './pages/DisclaimerPage'

import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UpdatePasswordPage from './pages/UpdatePasswordPage'

import MainLayout from './components/MainLayout'
import DashboardOverview from './pages/userteacher/DashboardOverview'
import QuestionBankPage from './pages/userteacher/QuestionBankPage'
import ProfilePage from './pages/userteacher/ProfilePage'
import EbooksPage from './pages/userteacher/EbooksPage'
import BillingPage from './pages/userteacher/BillingPage'
import ExamSessionPage from './pages/userteacher/ExamSessionPage'

import TakeExamPage from './pages/studentexam/TakeExamPage'

import SuperAdminLoginPage from './pages/superadmin/SuperAdminLoginPage'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import SuperAdminEbooks from './pages/superadmin/SuperAdminEbooks'

import SchoolAdminDashboard from './pages/adminschool/SchoolAdminDashboard'
import SchoolDashboardOverview from './pages/adminschool/SchoolDashboardOverview'
import SchoolAcademicYearPage from './pages/adminschool/SchoolAcademicYearPage'
import SchoolProfilePage from './pages/adminschool/SchoolProfilePage'
import ClassManagementPage from './pages/adminschool/ClassManagementPage'
import StudentManagementPage from './pages/adminschool/StudentManagementPage'
import SchoolInactivePage from './pages/adminschool/SchoolInactivePage'

import AttendanceDashboard from './pages/adminschool/attendance/AttendanceDashboard'
import ShiftManagementPage from './pages/adminschool/attendance/ShiftManagementPage'
import CalendarManagementPage from './pages/adminschool/attendance/CalendarManagementPage'
import ShiftAssignmentPage from './pages/adminschool/attendance/ShiftAssignmentPage'
import QrCodeManagementPage from './pages/adminschool/attendance/QrCodeManagementPage'
import AttendanceSessionPage from './pages/adminschool/attendance/AttendanceSessionPage'
import AttendanceScannerPage from './pages/adminschool/attendance/AttendanceScannerPage'
import AttendanceReportPage from './pages/adminschool/attendance/AttendanceReportPage'

import ExamListPage from './pages/adminschool/exams/ExamListPage'
import CreateExamPage from './pages/adminschool/exams/CreateExamPage'
import EditExamPage from './pages/adminschool/exams/EditExamPage'
import ExamDetailPage from './pages/adminschool/exams/ExamDetailPage'

import ExamSchedulePage from './pages/adminschool/exams/ExamSchedulePage'
import CreateExamSchedulePage from './pages/adminschool/exams/CreateExamSchedulePage'
import ExamMonitorPage from './pages/adminschool/exams/ExamMonitorPage'

import ExamScheduleDetailPage from './pages/adminschool/exams/ExamScheduleDetailPage'





const ROLE_CACHE_KEY = 'tp_role_cache_v1'
const ROLE_CACHE_TTL_MS = 5 * 60 * 1000 

type CachedRole = {
  userId: string
  role: string
  teacher_type: 'b2c' | 'b2b' | 'hybrid'
  memberships: any[]
  school_inactive: boolean
  cachedAt: number
}

function readRoleCache(userId: string): CachedRole | null {
  try {
    const raw = sessionStorage.getItem(ROLE_CACHE_KEY)
    if (!raw) return null
    const cached: CachedRole = JSON.parse(raw)
    if (cached.userId !== userId) return null
    if (Date.now() - cached.cachedAt > ROLE_CACHE_TTL_MS) {
      sessionStorage.removeItem(ROLE_CACHE_KEY)
      return null
    }
    return cached
  } catch {
    return null
  }
}

function writeRoleCache(data: CachedRole) {
  try {
    sessionStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(data))
  } catch {
    // ignore quota error
  }
}

function clearRoleCache() {
  try {
    sessionStorage.removeItem(ROLE_CACHE_KEY)
  } catch {
    // ignore
  }
}


let lastProfileTokenFetched: string | null = null


export default function App() {
  console.log('[App] MOUNT / RENDER — waktu:', new Date().toISOString())
  const [session, setSession] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(false)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const [schoolInactive, setSchoolInactive] = useState(false)

  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem('superadmin_token')
  )
  const [adminName, setAdminName] = useState<string>(
    localStorage.getItem('superadmin_name') || ''
  )

  const [teacherType, setTeacherType] = useState<'b2c' | 'b2b' | 'hybrid'>('b2c')
  const [schoolMemberships, setSchoolMemberships] = useState<any[]>([])

  const [authError, setAuthError] = useState<string | null>(null)

  const API_URL = import.meta.env.VITE_API_URL

  // ← useRef: lacak user yang sudah di-fetch dalam sesi hidup
  const lastFetchedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const checkRoleAndFetchData = async (
      token: string,
      userId: string,
      force = false
    ) => {
      if (!token || !userId) return

    
      if (!force && lastFetchedUserIdRef.current === userId) {
        console.log('[check-role] SKIP — user sudah di-fetch di sesi ini')
        return
      }

     
      if (!force) {
        const cached = readRoleCache(userId)
        if (cached) {
          console.log('[check-role] SKIP — pakai cache sessionStorage')
          if (!cancelled) {
            setUserRole(cached.role)
            setSchoolInactive(cached.school_inactive)
            if (cached.role === 'teacher') {
              setTeacherType(cached.teacher_type)
              setSchoolMemberships(cached.memberships || [])
            }
          }
          lastFetchedUserIdRef.current = userId

       
          if (cached.role === 'teacher' && token !== lastProfileTokenFetched) {
            lastProfileTokenFetched = token
            try {
              const res = await axios.get(`${API_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              if (!cancelled) setTokenBalance(res.data.token_balance)
            } catch (e) {
              console.error('Gagal memuat profile (dari cache):', e)
            }
          }
          return
        }
      }

    
      console.log('[check-role] FETCH dari backend')
      setCheckingRole(true)
      setAuthError(null)

      try {
        const roleRes = await axios.get(`${API_URL}/api/auth/check-role`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const role = roleRes.data.role
        const isSchoolInactive = roleRes.data.school_inactive === true
        const tType = roleRes.data.teacher_type || 'b2c'
        const memberships = roleRes.data.memberships || []

        if (!cancelled) {
          setUserRole(role)
          setSchoolInactive(isSchoolInactive)
        }

        writeRoleCache({
          userId,
          role,
          teacher_type: tType,
          memberships,
          school_inactive: isSchoolInactive,
          cachedAt: Date.now(),
        })
        lastFetchedUserIdRef.current = userId

        if (role === 'teacher') {
          if (!cancelled) {
            setTeacherType(tType)
            setSchoolMemberships(memberships)
          }

          if (token !== lastProfileTokenFetched) {
            lastProfileTokenFetched = token
            const res = await axios.get(`${API_URL}/api/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (!cancelled) setTokenBalance(res.data.token_balance)
          }
        }
      } catch (e: any) {
        console.error('Gagal memuat data sesi:', e)
        if (!cancelled) setAuthError(e.response?.data?.error || e.message)
        lastProfileTokenFetched = null
        lastFetchedUserIdRef.current = null // biar bisa retry
        clearRoleCache()
      } finally {
        if (!cancelled) setCheckingRole(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setSession(session)
      if (session?.user) {
        checkRoleAndFetchData(session.access_token, session.user.id, false).finally(
          () => {
            if (!cancelled) setLoading(false)
          }
        )
      } else {
        setLoading(false)
      }
    })


    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return

      if (event === 'SIGNED_IN') {
        setSession(session)
        if (session?.user) {
          lastFetchedUserIdRef.current = null
          clearRoleCache()
          checkRoleAndFetchData(session.access_token, session.user.id, true)
        }
        return
      }

      if (event === 'SIGNED_OUT') {
        lastProfileTokenFetched = null
        lastFetchedUserIdRef.current = null
        clearRoleCache()
        setSession(null)
        setUserRole(null)
        setTokenBalance(0)
        setSchoolInactive(false)
        setTeacherType('b2c')
        setSchoolMemberships([])
        setAuthError(null)
        return
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('[auth] TOKEN_REFRESHED — skip check-role')
        setSession(session)
        return
      }

      if (event === 'USER_UPDATED') {
        setSession(session)
        return
      }

      if (event === 'INITIAL_SESSION') {
        return
      }

      setSession(session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [API_URL])

  const handleAdminLogout = () => {
    localStorage.removeItem('superadmin_token')
    localStorage.removeItem('superadmin_name')
    setAdminToken(null)
    setAdminName('')
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center font-sans text-tp-muted">
        Memuat aplikasi...
      </div>
    )
  }

  return (
      <Routes>
        {/* --- Route Superadmin --- */}
        <Route
          path="/superadmin/login"
          element={
            adminToken ? (
              <Navigate to="/superadmin/dashboard" replace />
            ) : (
              <SuperAdminLoginPage
                onLoginSuccess={(token, name) => {
                  setAdminToken(token)
                  setAdminName(name)
                }}
              />
            )
          }
        />
        <Route
          path="/superadmin/dashboard"
          element={
            adminToken ? (
              <SuperAdminDashboard adminName={adminName} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/superadmin/login" replace />
            )
          }
        />
        <Route
          path="/superadmin/ebooks"
          element={
            adminToken ? <SuperAdminEbooks /> : <Navigate to="/superadmin/login" replace />
          }
        />

        {/* --- Route Admin Sekolah (Nested) --- */}
        <Route
          path="/school-admin/dashboard"
          element={
            !session ? (
              <Navigate to="/" replace />
            ) : checkingRole || userRole === null ? (
              <div className="grid min-h-screen place-items-center font-sans text-tp-muted">
                Memverifikasi akun...
              </div>
            ) : userRole === 'school_admin' && schoolInactive ? (
              <SchoolInactivePage />
            ) : userRole !== 'school_admin' ? (
              <Navigate to="/" replace />
            ) : (
              <SchoolAdminDashboard session={session} />
            )
          }
        >
          <Route index element={<SchoolDashboardOverview />} />
          <Route path="school" element={<SchoolProfilePage />} />
          <Route path="academic-years" element={<SchoolAcademicYearPage />} />
          <Route path="classes" element={<ClassManagementPage />} />
          <Route path="students" element={<StudentManagementPage />} />

          {/* Attendance Routes */}
          <Route path="attendance" element={<AttendanceDashboard />} />
          <Route path="attendance/shifts" element={<ShiftManagementPage />} />
          <Route path="attendance/calendar" element={<CalendarManagementPage />} />
          <Route path="attendance/assignments" element={<ShiftAssignmentPage />} />
          <Route path="attendance/qr-codes" element={<QrCodeManagementPage />} />
          <Route path="attendance/sessions" element={<AttendanceSessionPage />} />
          <Route
            path="attendance/scanner/:sessionId"
            element={<AttendanceScannerPage />}
          />
          <Route path="attendance/reports" element={<AttendanceReportPage />} />

           {/* === EXAM ROUTES === */}
          <Route path="exams" element={<ExamListPage />} />
          <Route path="exams/create" element={<CreateExamPage />} />
          <Route path="exams/:examId" element={<ExamDetailPage />} />
          <Route path="exams/:examId/edit" element={<EditExamPage />} />
          
          <Route path="exam-schedules" element={<ExamSchedulePage />} />
          <Route path="exam-schedules/create" element={<CreateExamSchedulePage />} />
          {/* <Route path="exam-schedules/:scheduleId" element={<ExamScheduleDetailPage />} /> */}
          <Route path="exam-schedules/:scheduleId/edit" element={<CreateExamSchedulePage />} />
          <Route path="exam-schedules/:scheduleId" element={<ExamScheduleDetailPage />} />
          <Route path="exam-schedules/:scheduleId/monitor" element={<ExamMonitorPage />} />
          {/* ================== */}
        </Route>

        {/* --- Route Register & Publik --- */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/exam/take" element={<TakeExamPage />} />

        {/* --- Route User Guru --- */}
        <Route
          path="/"
          element={
            !session ? (
              <LoginPage />
            ) : authError ? (
              <div className="grid min-h-screen place-items-center text-center p-6">
                <div>
                  <h2 className="text-lg font-bold text-tp-text mb-2">
                    Gagal memuat akun
                  </h2>
                  <p className="text-sm text-tp-muted mb-4">{authError}</p>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="rounded-xl bg-tp-green px-4 py-2 text-xs font-semibold text-white"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            ) : checkingRole || userRole === null ? (
              <div className="grid min-h-screen place-items-center font-sans text-tp-muted">
                Memverifikasi akun...
              </div>
            ) : userRole === 'school_admin' ? (
              schoolInactive ? (
                <SchoolInactivePage />
              ) : (
                <Navigate to="/school-admin/dashboard" replace />
              )
            ) : (
              <MainLayout
                session={session}
                teacherType={teacherType}
                schoolMemberships={schoolMemberships}
              />
            )
          }
        >
          <Route index element={<DashboardOverview tokenBalance={tokenBalance} />} />
          <Route path="profile" element={<ProfilePage session={session} />} />
          <Route
            path="question-bank"
            element={<QuestionBankPage onBack={() => (window.location.href = '/')} />}
          />
          <Route path="ebooks" element={<EbooksPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="exam-session" element={<ExamSessionPage session={session} />} />
        </Route>

        {/* --- 404 --- */}
        <Route
          path="*"
          element={
            <div className="grid min-h-screen place-items-center bg-tp-bg text-center p-6">
              <div>
                <h1 className="text-4xl font-bold text-tp-text mb-2">404</h1>
                <p className="text-sm text-tp-muted mb-4">
                  Halaman yang Anda cari tidak ditemukan.
                </p>
                <a
                  href="/"
                  className="inline-block rounded-xl bg-tp-green px-4 py-2 text-xs font-semibold text-white transition hover:bg-tp-green-hover"
                >
                  Ok
                </a>
              </div>
            </div>
          }
        />
      </Routes>
  )
}