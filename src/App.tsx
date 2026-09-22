import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import SchoolInactivePage from './pages/adminschool/SchoolInactivePage'  // ← TAMBAH

import AttendanceDashboard from './pages/adminschool/attendance/AttendanceDashboard'
import ShiftManagementPage from './pages/adminschool/attendance/ShiftManagementPage'
import CalendarManagementPage from './pages/adminschool/attendance/CalendarManagementPage'
import ShiftAssignmentPage from './pages/adminschool/attendance/ShiftAssignmentPage'
import QrCodeManagementPage from './pages/adminschool/attendance/QrCodeManagementPage'
import AttendanceSessionPage from './pages/adminschool/attendance/AttendanceSessionPage'
import AttendanceScannerPage from './pages/adminschool/attendance/AttendanceScannerPage'
import AttendanceReportPage from './pages/adminschool/attendance/AttendanceReportPage'

let lastProfileTokenFetched: string | null = null

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(false) 
  const [tokenBalance, setTokenBalance] = useState(0)
  const [loading, setLoading] = useState(true)


  const [schoolInactive, setSchoolInactive] = useState(false)
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('superadmin_token'))
  const [adminName, setAdminName] = useState<string>(localStorage.getItem('superadmin_name') || '')

  const [teacherType, setTeacherType] = useState<'b2c' | 'b2b' | 'hybrid'>('b2c')
  const [schoolMemberships, setSchoolMemberships] = useState<any[]>([])

  const [authError, setAuthError] = useState<string | null>(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    let cancelled = false

    const checkRoleAndFetchData = async (token: string) => {
      if (!token) return
      setCheckingRole(true)
      setAuthError(null)
      try {
        const roleRes = await axios.get(`${API_URL}/api/auth/check-role`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const role = roleRes.data.role
        const isSchoolInactive = roleRes.data.school_inactive === true  

        if (!cancelled) {
          setUserRole(role)
          setSchoolInactive(isSchoolInactive)  
        }

        if (role === 'teacher') {
          if (!cancelled) {
            setTeacherType(roleRes.data.teacher_type || 'b2c')
            setSchoolMemberships(roleRes.data.memberships || [])
          }

          if (token !== lastProfileTokenFetched) {
            lastProfileTokenFetched = token
            const res = await axios.get(`${API_URL}/api/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (!cancelled) setTokenBalance(res.data.token_balance)
          }
        }
      } catch (e: any) {
        console.error('Gagal memuat data sesi:', e)
        if (!cancelled) setAuthError(e.response?.data?.error || e.message)
        lastProfileTokenFetched = null
      } finally {
        if (!cancelled) setCheckingRole(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setSession(session)
      if (session) {
        checkRoleAndFetchData(session.access_token).finally(() => {
          if (!cancelled) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setSession(session)
      if (session) {
        checkRoleAndFetchData(session.access_token)
      } else {
        lastProfileTokenFetched = null
        setUserRole(null)
        setTokenBalance(0)
        setSchoolInactive(false)  
      }
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
    <BrowserRouter>
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
              <SuperAdminDashboard 
                adminName={adminName} 
                onLogout={handleAdminLogout} 
              />
            ) : (
              <Navigate to="/superadmin/login" replace />
            )
          } 
        />
        <Route 
          path="/superadmin/ebooks" 
          element={
            adminToken ? (
              <SuperAdminEbooks />
            ) : (
              <Navigate to="/superadmin/login" replace />
            )
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
          <Route path="attendance/scanner/:sessionId" element={<AttendanceScannerPage />} />
          <Route path="attendance/reports" element={<AttendanceReportPage />} />
        </Route>

        {/* --- Route Register & Publik --- */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/exam/take" element={<TakeExamPage />} />

        {/* --- Route User Guru (Diproteksi: Admin Sekolah otomatis diredirect ke dasbor mereka) --- */}
        <Route 
          path="/" 
          element={
            !session ? (
              <LoginPage />
            ) : authError ? (
              <div className="grid min-h-screen place-items-center text-center p-6">
                <div>
                  <h2 className="text-lg font-bold text-tp-text mb-2">Gagal memuat akun</h2>
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
          <Route path="question-bank" element={<QuestionBankPage onBack={() => window.location.href = '/'} />} />
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
                <p className="text-sm text-tp-muted mb-4">Halaman yang Anda cari tidak ditemukan.</p>
                <a href="/" className="inline-block rounded-xl bg-tp-green px-4 py-2 text-xs font-semibold text-white transition hover:bg-tp-green-hover">
                  Ok
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}