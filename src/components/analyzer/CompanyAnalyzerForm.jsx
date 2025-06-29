import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { useAuth } from '../../context/AuthContext'
import companyAnalyzerService from '../../services/companyAnalyzer'
import salesRocksService from '../../services/salesRocksApi'

const { FiGlobe, FiSearch, FiLoader, FiAlertTriangle } = FiIcons

function CompanyAnalyzerForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState(null)

  useEffect(() => {
    // Check Edge Function status on component mount
    checkEdgeFunctionStatus()
  }, [])

  const checkEdgeFunctionStatus = async () => {
    try {
      const isAvailable = await salesRocksService.checkEdgeFunctionStatus()
      setEdgeFunctionStatus(isAvailable)
      if (!isAvailable) {
        setError('Edge Function not deployed. Analysis may have limited functionality.')
      }
    } catch (error) {
      console.error('Error checking Edge Function status:', error)
      setEdgeFunctionStatus(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!domain.trim()) {
      setError('Please enter a domain or website URL')
      return
    }

    if (!user) {
      setError('You must be logged in to analyze companies')
      return
    }

    setLoading(true)

    try {
      console.log('🚀 Starting automatic company analysis for:', domain.trim())

      // Create company record and immediately start analysis
      const company = await companyAnalyzerService.createCompanyRecord(
        domain.trim(),
        domain.trim(),
        user.id
      )

      console.log('✅ Company record created:', company.id)

      // Navigate to analysis page where automatic analysis will begin
      navigate(`/company-analyzer/${company.id}`)
    } catch (error) {
      console.error('Error starting analysis:', error)
      setError(error.message || 'Failed to start company analysis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiGlobe} className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Analyzer</h2>
        <p className="text-gray-600">
          Enter a company domain or website URL to automatically discover contact information
        </p>
      </div>

      {/* Edge Function Status Warning */}
      {edgeFunctionStatus === false && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Edge Function Status</span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            The Supabase Edge Function is not deployed. The system will use fallback mode for testing.
            Some features may be limited.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            Company Domain or Website URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SafeIcon icon={FiGlobe} className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="e.g., salesforce.com or https://www.salesforce.com"
              disabled={loading}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter the company's domain name or full website URL
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <SafeIcon icon={FiLoader} className="h-5 w-5 animate-spin" />
              <span>Starting Analysis...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiSearch} className="h-5 w-5" />
              <span>Analyze Company</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">🚀 What we'll discover automatically:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• LinkedIn profiles of company employees</li>
          <li>• Email addresses for key contacts</li>
          <li>• Job titles and professional information</li>
          <li>• Contact data ready for sales outreach</li>
        </ul>
      </div>

      {edgeFunctionStatus === true && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">✅ System Ready</h3>
          <p className="text-sm text-green-800">
            All systems operational! Analysis will begin automatically when you submit a company domain.
          </p>
        </div>
      )}

      {/* Debug Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">🔧 System Status</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Edge Function Status: {edgeFunctionStatus === null ? 'Checking...' : edgeFunctionStatus ? 'Deployed' : 'Not Deployed'}</div>
          <div>Auto-Analysis: Enabled</div>
          <div>Supabase URL: {window.location.href.includes('dcrxudbewrxpfjcvoren') ? 'Connected' : 'Different Project'}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default CompanyAnalyzerForm