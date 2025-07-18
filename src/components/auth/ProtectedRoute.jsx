import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute - loading:', loading, 'user:', !!user)

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute