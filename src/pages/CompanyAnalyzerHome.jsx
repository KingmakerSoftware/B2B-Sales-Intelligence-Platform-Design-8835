import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../components/common/SafeIcon'
import { useAuth } from '../context/AuthContext'
import CompanyAnalyzerForm from '../components/analyzer/CompanyAnalyzerForm'
import companyAnalyzerService from '../services/companyAnalyzer'

const { FiClock, FiCheck, FiX, FiGlobe, FiUsers, FiMail, FiTrash2, FiAlertTriangle } = FiIcons

function CompanyAnalyzerHome() {
  const { user } = useAuth()
  const location = useLocation()
  const [userCompanies, setUserCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [cleaningUp, setCleaningUp] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserCompanies()
    }

    // Check for notification from navigation state (e.g., after deletion)
    if (location.state?.message) {
      setNotification({
        message: location.state.message,
        type: location.state.type || 'info'
      })

      // Clear the notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)

      // Clear the location state
      window.history.replaceState({}, document.title)

      return () => clearTimeout(timer)
    }
  }, [user, location.state])

  const loadUserCompanies = async () => {
    try {
      const companies = await companyAnalyzerService.getUserCompanies(user.id)
      setUserCompanies(companies)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupCorrupted = async () => {
    if (!confirm('This will delete all corrupted company records. Are you sure?')) {
      return
    }

    setCleaningUp(true)
    try {
      const result = await companyAnalyzerService.cleanupCorruptedRecords(user.id)
      
      setNotification({
        message: `Cleanup complete! Deleted ${result.deletedCount} corrupted records.`,
        type: 'success'
      })

      // Reload the companies list
      await loadUserCompanies()
    } catch (error) {
      console.error('Error during cleanup:', error)
      setNotification({
        message: `Cleanup failed: ${error.message}`,
        type: 'error'
      })
    } finally {
      setCleaningUp(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return FiCheck
      case 'failed': return FiX
      default: return FiClock
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'failed': return 'Failed'
      case 'analyzing': return 'In Progress'
      default: return 'Unknown'
    }
  }

  // Check if there are any potentially corrupted records
  const hasCorruptedRecords = userCompanies.some(company => 
    !company.company_name || !company.domain || !company.status
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`mb-6 p-4 rounded-lg border ${
                notification.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{notification.message}</p>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
                >
                  <SafeIcon icon={FiX} className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Analyzer</h1>
          <p className="text-gray-600">
            Discover contact information for any company by entering their domain or website URL.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analyzer Form */}
          <div>
            <CompanyAnalyzerForm />
          </div>

          {/* Recent Analyses */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Analyses ({userCompanies.length})
                </h2>
                
                {/* Cleanup button for corrupted records */}
                {hasCorruptedRecords && (
                  <button
                    onClick={handleCleanupCorrupted}
                    disabled={cleaningUp}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    title="Clean up corrupted records"
                  >
                    <SafeIcon icon={cleaningUp ? FiClock : FiTrash2} className={`h-4 w-4 ${cleaningUp ? 'animate-spin' : ''}`} />
                    <span>{cleaningUp ? 'Cleaning...' : 'Cleanup'}</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : userCompanies.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userCompanies.map((company, index) => {
                    // Check if this company looks corrupted
                    const isCorrupted = !company.company_name || !company.domain || !company.status
                    
                    return (
                      <motion.div
                        key={company.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={`/company-analyzer/${company.id}`}
                          className={`block p-4 border rounded-lg hover:shadow-md transition-all ${
                            isCorrupted 
                              ? 'border-red-300 bg-red-50 hover:border-red-400' 
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCorrupted ? 'bg-red-100' : 'bg-primary-100'
                              }`}>
                                <SafeIcon 
                                  icon={isCorrupted ? FiAlertTriangle : FiGlobe} 
                                  className={`h-5 w-5 ${isCorrupted ? 'text-red-600' : 'text-primary-600'}`} 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {company.company_name || `[Corrupted - ID: ${company.id}]`}
                                </h3>
                                <p className="text-sm text-gray-600 truncate">
                                  {company.domain || '[No domain]'}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <SafeIcon icon={FiUsers} className="h-3 w-3" />
                                    <span>{company.total_contacts_found || 0}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'Unknown date'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isCorrupted ? (
                                <span className="text-xs font-medium text-red-600">
                                  Corrupted
                                </span>
                              ) : (
                                <>
                                  <SafeIcon 
                                    icon={getStatusIcon(company.status)} 
                                    className={`h-4 w-4 ${getStatusColor(company.status)}`} 
                                  />
                                  <span className={`text-xs font-medium ${getStatusColor(company.status)}`}>
                                    {getStatusLabel(company.status)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SafeIcon icon={FiGlobe} className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
                  <p className="text-gray-600">
                    Start by entering a company domain in the form on the left.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Feature Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How Company Analyzer Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiGlobe} className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enter Domain</h3>
              <p className="text-gray-600 text-sm">
                Simply enter any company's domain or website URL to start the analysis process.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiUsers} className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find Contacts</h3>
              <p className="text-gray-600 text-sm">
                Our system searches LinkedIn to find employees and key contacts at the company.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiMail} className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Emails</h3>
              <p className="text-gray-600 text-sm">
                We attempt to find email addresses for each contact to enable direct outreach.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default CompanyAnalyzerHome