import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import SkillMatch from './pages/SkillMatch'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import { PageStateProvider } from './context/PageStateContext'
import { ThemeProvider } from './context/ThemeContext'
import Pricing from './pages/Pricing'
import PublicProfile from './pages/PublicProfile'

// Pages
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Register   from './pages/Register'
import Chat       from './pages/Chat'
import Jobs       from './pages/Jobs'
import PremiumJobs from './pages/PremiumJobs'
import JobDetail  from './pages/JobDetail'
import Resume     from './pages/Resume'
import CareerPath from './pages/CareerPath'
import Interview  from './pages/Interview'
import SavedJobs  from './pages/SavedJobs'
import Profile    from './pages/Profile'
import News       from './pages/News'
import NotFound   from './pages/NotFound'
import SalaryInsights   from './pages/SalaryInsights'
import CompanyResearch  from './pages/CompanyResearch'
import RoadmapGraph from './pages/RoadmapGraph'
import Support from './pages/Support'
import UserAdmin from './pages/UserAdmin'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public route — redirect to chat if already logged in
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Navigate to="/chat" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/news"     element={<News />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/pricing"  element={<Pricing />} />
      <Route path="/support"  element={<Support />} />
      <Route path="/u/:username" element={<PublicProfile />} />
      <Route path="/useradmin" element={<UserAdmin />} />
      <Route path="/teamadmin" element={<UserAdmin />} />

      {/* Protected */}
      <Route path="/chat"        element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/jobs"        element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/jobs/:id"    element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
      <Route path="/premium-jobs" element={<ProtectedRoute><PremiumJobs /></ProtectedRoute>} />
      <Route path="/resume"      element={<ProtectedRoute><Resume /></ProtectedRoute>} />
      <Route path="/career"      element={<ProtectedRoute><CareerPath /></ProtectedRoute>} />
      <Route path="/interview"   element={<ProtectedRoute><Interview /></ProtectedRoute>} />
      <Route path="/saved"       element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/skills"      element={<ProtectedRoute><SkillMatch /></ProtectedRoute>} />
      <Route path="/salary"      element={<SalaryInsights />} />
      <Route path="/company"     element={<CompanyResearch />} />
      <Route path="/roadmap-graph" element={<RoadmapGraph />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <PageStateProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#21262D',
                  color: '#E6EDF3',
                  border: '1px solid #30363D',
                },
                success: { iconTheme: { primary: '#0A7C3E', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#CF222E', secondary: '#fff' } },
              }}
            />
          </PageStateProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
