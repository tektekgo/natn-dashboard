import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoadingSpinner from './components/common/LoadingSpinner'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const StrategiesPage = lazy(() => import('./pages/StrategiesPage'))
const StrategyDetailPage = lazy(() => import('./pages/StrategyDetailPage'))
const BacktestResultPage = lazy(() => import('./pages/BacktestResultPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const GuidelinesPage = lazy(() => import('./pages/GuidelinesPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />

        {/* Protected dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/strategies/new" element={<StrategyDetailPage />} />
          <Route path="/strategies/:id" element={<StrategyDetailPage />} />
          <Route path="/backtest/:id" element={<BacktestResultPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
