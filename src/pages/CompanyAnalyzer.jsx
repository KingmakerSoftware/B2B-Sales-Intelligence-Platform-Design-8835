import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../components/common/SafeIcon'
import { useAuth } from '../context/AuthContext'
import companyAnalyzerService from '../services/companyAnalyzer'
import contactService from '../services/contactService'
import AnalysisProgress from '../components/analyzer/AnalysisProgress'
import CompanyContactsList from '../components/analyzer/CompanyContactsList'
import DeleteCompanyButton from '../components/analyzer/DeleteCompanyButton'

const { FiArrowLeft, FiGlobe, FiRefreshCw, FiPlay, FiClock, FiAlertTriangle } = FiIcons

function CompanyAnalyzer() {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [company, setCompany] = useState(null)
  const [contacts, setContacts] = useState([])
  const [progress, setProgress] = useState({ step: 'loading', message: 'Loading company data...' })
  const [loading, setLoading] = useState(true)
  const [analysisStarted, setAnalysisStarted] = useState(false)
  const [showResumeButton, setShowResumeButton] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [criticalError, setCriticalError] = useState(null)

  // Use ref to prevent duplicate API calls
  const analysisInProgress = useRef(false)
  const hasLoadedOnce = useRef(false)
  const autoAnalysisTriggered = useRef(false)

  useEffect(() => {
    if (!user || !companyId || hasLoadedOnce.current) return
    
    console.log('🔄 CompanyAnalyzer: Initial load for company', companyId)
    hasLoadedOnce.current = true
    loadCompanyData()
  }, [user, companyId])

  const loadCompanyData = async () => {
    try {
      console.log('📊 Starting to load company data for ID:', companyId)
      
      // Reset states
      setCriticalError(null)
      setDebugInfo(null)
      
      const companyData = await companyAnalyzerService.getCompanyById(companyId)
      
      console.log('📥 Company data received:', {
        hasData: !!companyData,
        id: companyData?.id,
        name: companyData?.company_name,
        userId: companyData?.user_id,
        status: companyData?.status
      })

      // Verify this company belongs to the current user
      if (companyData.user_id !== user.id) {
        console.error('❌ Company does not belong to current user:', {
          companyUserId: companyData.user_id,
          currentUserId: user.id
        })
        setCriticalError({
          type: 'unauthorized',
          message: 'You do not have permission to view this company.',
          companyData
        })
        return
      }

      setCompany(companyData)
      console.log('✅ Company set successfully')
      
      // Handle different company statuses and auto-start analysis if needed
      await handleCompanyStatus(companyData)
    } catch (error) {
      console.error('❌ Error loading company data:', {
        error: error.message,
        stack: error.stack,
        companyId,
        userId: user?.id
      })
      
      // Set detailed error information
      setCriticalError({
        type: 'load_error',
        message: error.message,
        details: {
          companyId,
          userId: user?.id,
          error: error.message,
          stack: error.stack
        }
      })
      
      setProgress({
        step: 'error',
        message: `Failed to load company: ${error.message}`,
        error
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyStatus = async (companyData) => {
    try {
      console.log('🔄 Handling company status:', companyData.status)
      
      if (companyData.status === 'completed') {
        console.log('✅ Company analysis already completed, loading contacts')
        const contactsData = await contactService.getContactsByCompany(companyData.id)
        console.log('📥 Loaded contacts:', {
          count: contactsData?.length || 0,
          hasContacts: !!contactsData && contactsData.length > 0,
          firstContact: contactsData?.[0]
        })
        setContacts(contactsData || [])
        setProgress({
          step: 'completed',
          message: `Analysis completed! Found ${contactsData?.length || 0} contacts`,
          contactsFound: contactsData?.length || 0,
          emailsFound: contactsData?.filter(c => c.email).length || 0
        })
      } else if (companyData.status === 'failed') {
        console.log('❌ Previous analysis failed')
        setProgress({
          step: 'error',
          message: 'Previous analysis failed. You can restart the analysis.',
          error: { message: 'Analysis failed' }
        })
      } else if (companyData.status === 'analyzing') {
        console.log('⏸️ Analysis was in progress, checking age...')
        
        // Check if analysis was started recently (within last 10 minutes)
        const analysisAge = Date.now() - new Date(companyData.updated_at).getTime()
        const tenMinutes = 10 * 60 * 1000
        
        if (analysisAge < tenMinutes) {
          console.log('⏰ Analysis is recent, showing as paused')
          setProgress({
            step: 'paused',
            message: 'Analysis was in progress. You can resume it or start fresh.',
            contactsFound: companyData.total_contacts_found || 0
          })
          setShowResumeButton(true)
        } else {
          console.log('⏰ Analysis is stale, showing as failed')
          setProgress({
            step: 'error',
            message: 'Analysis appears to have stalled. You can restart it.',
            error: { message: 'Analysis stalled' }
          })
        }
      } else if (companyData.status === 'pending') {
        console.log('🚀 Company is pending - AUTO-STARTING ANALYSIS!')
        
        // AUTO-START ANALYSIS for new companies
        if (!autoAnalysisTriggered.current) {
          autoAnalysisTriggered.current = true
          console.log('🚀 Triggering automatic analysis for new company')
          
          // Small delay to ensure UI is ready
          setTimeout(() => {
            startAnalysis(companyData)
          }, 500)
        } else {
          // Manual mode if auto-analysis was already attempted
          setProgress({
            step: 'pending',
            message: 'Company analysis is ready to start.'
          })
          setShowResumeButton(true)
        }
      } else {
        console.log('❓ Unknown company status:', companyData.status)
        setProgress({
          step: 'error',
          message: `Unknown company status: ${companyData.status}`,
          error: { message: 'Unknown status' }
        })
      }
    } catch (error) {
      console.error('❌ Error handling company status:', error)
      setProgress({
        step: 'error',
        message: `Error processing company status: ${error.message}`,
        error
      })
    }
  }

  const startAnalysis = async (companyData) => {
    // Prevent duplicate analysis calls
    if (analysisInProgress.current || analysisStarted) {
      console.log('⚠️ Analysis already in progress, skipping duplicate call')
      return
    }

    console.log('🚀 Starting analysis for company:', companyData.domain)
    analysisInProgress.current = true
    setAnalysisStarted(true)
    setShowResumeButton(false)

    try {
      await companyAnalyzerService.analyzeCompany(
        companyData.domain,
        companyData.website_url,
        user.id,
        (progressUpdate) => {
          console.log('📈 Progress update:', progressUpdate)
          setProgress(progressUpdate)
          
          if (progressUpdate.step === 'completed') {
            console.log('✅ Analysis completed, setting contacts:', {
              hasContacts: !!progressUpdate.contacts,
              contactsLength: progressUpdate.contacts?.length || 0,
              contacts: progressUpdate.contacts
            })
            setContacts(progressUpdate.contacts || [])
            analysisInProgress.current = false
          }
        }
      )
    } catch (error) {
      console.error('❌ Analysis error:', error)
      setProgress({
        step: 'error',
        message: `Analysis failed: ${error.message}`,
        error
      })
      analysisInProgress.current = false
      setShowResumeButton(true) // Show resume button on error
    }
  }

  const handleResumeAnalysis = async () => {
    if (!company || analysisInProgress.current) {
      console.log('⚠️ Cannot resume: no company or analysis in progress')
      return
    }

    console.log('▶️ Resuming/starting analysis for:', company.domain)
    
    // Reset states
    setProgress({
      step: 'creating',
      message: company.status === 'pending' ? 'Starting analysis...' : 'Resuming analysis...'
    })
    setContacts([])
    setAnalysisStarted(false)
    analysisInProgress.current = false

    try {
      // Update company status to analyzing
      await companyAnalyzerService.updateCompanyStatus(company.id, 'analyzing')
      
      // Start new analysis
      await startAnalysis(company)
    } catch (error) {
      console.error('❌ Error resuming analysis:', error)
      setProgress({
        step: 'error',
        message: `Failed to resume analysis: ${error.message}`,
        error
      })
      analysisInProgress.current = false
      setShowResumeButton(true)
    }
  }

  const handleRestart = async () => {
    if (!company || analysisInProgress.current) {
      console.log('⚠️ Cannot restart: no company or analysis in progress')
      return
    }

    console.log('🔄 Manually restarting analysis for:', company.domain)
    
    // Reset states
    setProgress({
      step: 'creating',
      message: 'Restarting analysis...'
    })
    setContacts([])
    setAnalysisStarted(false)
    analysisInProgress.current = false
    setShowResumeButton(false)

    try {
      // Update company status to analyzing
      await companyAnalyzerService.updateCompanyStatus(company.id, 'analyzing')
      
      // Start new analysis
      await startAnalysis(company)
    } catch (error) {
      console.error('❌ Error restarting analysis:', error)
      setProgress({
        step: 'error',
        message: `Failed to restart analysis: ${error.message}`,
        error
      })
      analysisInProgress.current = false
    }
  }

  const handleDeleteCompany = async (companyId, useForce = false) => {
    try {
      console.log('🗑️ Deleting company:', { companyId, useForce })
      
      if (useForce) {
        // Use force delete for problematic records
        await companyAnalyzerService.forceDeleteCorruptedRecord(companyId, user.id)
      } else {
        // Normal delete
        await companyAnalyzerService.deleteCompany(companyId, user.id)
      }
      
      // Navigate back to company analyzer home
      navigate('/company-analyzer', {
        state: {
          message: `${company?.company_name || 'Company'} has been deleted successfully.`,
          type: 'success'
        }
      })
    } catch (error) {
      console.error('❌ Error deleting company:', error)
      throw error // Re-throw to be handled by DeleteCompanyButton
    }
  }

  const handleForceDelete = async () => {
    try {
      console.log('🗑️ Force deleting corrupted company:', companyId)
      
      // Try to delete even if company data is corrupted
      await companyAnalyzerService.forceDeleteCorruptedRecord(companyId, user.id)
      
      navigate('/company-analyzer', {
        state: {
          message: 'Corrupted company record has been deleted successfully.',
          type: 'success'
        }
      })
    } catch (error) {
      console.error('❌ Error force deleting company:', error)
      alert(`Failed to delete company: ${error.message}`)
    }
  }

  // Handle contacts update from manual addition
  const handleContactsUpdate = (updatedContacts) => {
    console.log('📝 Updating contacts list:', updatedContacts.length)
    setContacts(updatedContacts)
  }

  // Add error boundary logging
  console.log('🔍 CompanyAnalyzer render state:', {
    loading,
    hasCompany: !!company,
    hasContacts: !!contacts,
    contactsLength: contacts?.length || 0,
    progressStep: progress?.step,
    criticalError: !!criticalError,
    showResumeButton,
    analysisInProgress: analysisInProgress.current
  })

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Critical error state (corrupted data, unauthorized access, etc.)
  if (criticalError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiAlertTriangle} className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {criticalError.type === 'unauthorized' ? 'Access Denied' : 'Data Error'}
            </h2>
            <p className="text-gray-600 mb-6">{criticalError.message}</p>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => navigate('/company-analyzer')}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="h-5 w-5" />
              <span>Back to Company Analyzer</span>
            </button>
            
            {/* Force delete button for corrupted records */}
            {criticalError.type === 'load_error' && (
              <button
                onClick={handleForceDelete}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <SafeIcon icon={FiAlertTriangle} className="h-5 w-5" />
                <span>Delete Corrupted Record</span>
              </button>
            )}
          </div>

          {/* Debug information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Debug Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Company ID:</strong> {companyId}</div>
              <div><strong>User ID:</strong> {user?.id}</div>
              <div><strong>Error Type:</strong> {criticalError.type}</div>
              <div><strong>URL:</strong> {window.location.href}</div>
              {debugInfo && (
                <>
                  <div><strong>Missing Fields:</strong> {debugInfo.missingFields?.join(', ') || 'None'}</div>
                  <div><strong>Available Fields:</strong> {debugInfo.allFields?.join(', ') || 'None'}</div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Company not found (but no critical error)
  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <p className="text-gray-600 mb-4">
            The company with ID {companyId} could not be found or you don't have permission to view it.
          </p>
          <button
            onClick={() => navigate('/company-analyzer')}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
            <span>Back to Analyzer</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/company-analyzer')}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <SafeIcon icon={FiGlobe} className="h-8 w-8 text-primary-600" />
                <span>{company.company_name || '[Unnamed Company]'}</span>
              </h1>
              <p className="text-gray-600">
                {progress.step === 'loading' || progress.step === 'creating' || progress.step === 'searching' || progress.step === 'saving' || progress.step === 'emails'
                  ? 'Analyzing...'
                  : `Analyzing ${company.domain || '[No Domain]'}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Resume/Start Analysis Button - Only show for paused/pending states */}
            {showResumeButton && (
              <button
                onClick={handleResumeAnalysis}
                disabled={analysisInProgress.current}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  analysisInProgress.current 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <SafeIcon icon={FiPlay} className="h-5 w-5" />
                <span>
                  {company.status === 'pending' ? 'Start Contact Analysis' : 'Resume Contact Analysis'}
                </span>
              </button>
            )}
            
            {/* Restart Button */}
            {(progress.step === 'error' || progress.step === 'completed') && (
              <button
                onClick={handleRestart}
                disabled={analysisInProgress.current}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  analysisInProgress.current 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <SafeIcon icon={FiRefreshCw} className="h-5 w-5" />
                <span>{analysisInProgress.current ? 'Starting...' : 'Restart Analysis'}</span>
              </button>
            )}
            
            {/* Delete Button - Only show if analysis is completed, failed, or paused */}
            {(progress.step === 'completed' || progress.step === 'error' || progress.step === 'paused' || progress.step === 'pending') && (
              <DeleteCompanyButton
                company={company}
                onDelete={handleDeleteCompany}
                disabled={analysisInProgress.current}
              />
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Progress Section - Show for active analysis */}
          {['loading', 'creating', 'connecting', 'searching', 'saving', 'emails'].includes(progress.step) && (
            <AnalysisProgress progress={progress} />
          )}

          {/* Paused/Pending State - Only show if manual intervention is needed */}
          {(progress.step === 'paused' || (progress.step === 'pending' && showResumeButton)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  progress.step === 'pending' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  <SafeIcon icon={progress.step === 'pending' ? FiPlay : FiClock} className={`h-8 w-8 ${
                    progress.step === 'pending' ? 'text-blue-600' : 'text-yellow-600'
                  }`} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {progress.step === 'pending' ? 'Ready to Analyze' : 'Analysis Paused'}
                </h2>
                <p className="text-gray-600">{progress.message}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Company Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Domain:</span>
                    <span className="ml-2 text-gray-600">{company.domain || '[No Domain]'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Website:</span>
                    {company.website_url ? (
                      <a
                        href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary-600 hover:text-primary-700"
                      >
                        {company.website_url}
                      </a>
                    ) : (
                      <span className="ml-2 text-gray-600">[No Website]</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-gray-600 capitalize">{company.status || 'unknown'}</span>
                  </div>
                  {progress.contactsFound > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Previous Progress:</span>
                      <span className="ml-2 text-gray-600">{progress.contactsFound} contacts found</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {company.created_at ? new Date(company.created_at).toLocaleDateString() : '[Unknown]'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {company.updated_at ? new Date(company.updated_at).toLocaleString() : '[Unknown]'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🚀 What happens next:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Search LinkedIn for company employees</li>
                  <li>• Find contact information and job titles</li>
                  <li>• Discover email addresses for outreach</li>
                  <li>• Organize contacts for sales engagement</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Results Section */}
          {progress.step === 'completed' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
              <CompanyContactsList 
                company={company} 
                contacts={contacts} 
                onContactsUpdate={handleContactsUpdate}
              />
            </div>
          )}

          {/* Error State with Company Info */}
          {progress.step === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiGlobe} className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
                <p className="text-gray-600">{progress.message}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Company Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Domain:</span>
                    <span className="ml-2 text-gray-600">{company.domain || '[No Domain]'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Website:</span>
                    {company.website_url ? (
                      <a
                        href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary-600 hover:text-primary-700"
                      >
                        {company.website_url}
                      </a>
                    ) : (
                      <span className="ml-2 text-gray-600">[No Website]</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-gray-600">{company.status || 'unknown'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {company.created_at ? new Date(company.created_at).toLocaleDateString() : '[Unknown]'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {company.updated_at ? new Date(company.updated_at).toLocaleString() : '[Unknown]'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Analysis State Debug */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Debug Information:</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <div>Analysis Started: {analysisStarted ? 'Yes' : 'No'}</div>
                  <div>Analysis In Progress: {analysisInProgress.current ? 'Yes' : 'No'}</div>
                  <div>Auto Analysis Triggered: {autoAnalysisTriggered.current ? 'Yes' : 'No'}</div>
                  <div>Has Loaded Once: {hasLoadedOnce.current ? 'Yes' : 'No'}</div>
                  <div>Current Step: {progress.step}</div>
                  <div>User ID: {user.id}</div>
                  <div>Company User ID: {company.user_id}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default CompanyAnalyzer