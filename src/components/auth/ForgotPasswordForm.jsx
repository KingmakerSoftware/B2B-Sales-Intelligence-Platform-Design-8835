import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { useAuth } from '../../context/AuthContext'

const { FiMail, FiArrowLeft, FiLoader, FiTarget } = FiIcons

function ForgotPasswordForm() {
  const { resetPassword, authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    const { error } = await resetPassword(email)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiMail} className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <SafeIcon icon={FiTarget} className="h-12 w-12 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">SalesIntel Pro</h1>
          </div>
          <h2 className="text-xl text-gray-600">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {authLoading ? (
              <>
                <SafeIcon icon={FiLoader} className="h-5 w-5 animate-spin" />
                <span>Sending reset link...</span>
              </>
            ) : (
              <span>Send reset link</span>
            )}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
              <span>Back to login</span>
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordForm