import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import StrategiesPage from './pages/StrategiesPage'
import StrategyDetailPage from './pages/StrategyDetailPage'
import BacktestResultPage from './pages/BacktestResultPage'
import ComparePage from './pages/ComparePage'
import SettingsPage from './pages/SettingsPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import GuidelinesPage from './pages/GuidelinesPage'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  return (
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
      </Route>
    </Routes>
  )
}

export default App
