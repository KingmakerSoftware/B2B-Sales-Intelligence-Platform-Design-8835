import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Navbar from './components/layout/Navbar'
import Dashboard from './pages/Dashboard'
import ProspectSearch from './pages/ProspectSearch'
import CompanyAnalysis from './pages/CompanyAnalysis'
import ProductManager from './pages/ProductManager'
import OnePager from './pages/OnePager'
import Profile from './pages/Profile'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import ForgotPasswordForm from './components/auth/ForgotPasswordForm'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="*" element={<LoginForm />} />
      </Routes>
    )
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
        <Navbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-16"
        >
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/prospect-search" element={
              <ProtectedRoute>
                <ProspectSearch />
              </ProtectedRoute>
            } />
            <Route path="/company-analysis/:companyId" element={
              <ProtectedRoute>
                <CompanyAnalysis />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <ProductManager />
              </ProtectedRoute>
            } />
            <Route path="/one-pager/:companyId" element={
              <ProtectedRoute>
                <OnePager />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </motion.main>
      </div>
    </AppProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App