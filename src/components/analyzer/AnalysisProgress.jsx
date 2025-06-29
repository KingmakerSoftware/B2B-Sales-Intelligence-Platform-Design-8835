import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiLoader, FiUsers, FiMail, FiCheck, FiAlertCircle, FiWifi, FiCode } = FiIcons

function AnalysisProgress({ progress }) {
  const getStepIcon = (step) => {
    switch (step) {
      case 'creating': return FiLoader
      case 'searching': return FiUsers
      case 'saving': return FiCheck
      case 'emails': return FiMail
      case 'completed': return FiCheck
      case 'error': return FiAlertCircle
      case 'connecting': return FiWifi
      default: return FiLoader
    }
  }

  const getStepColor = (step) => {
    switch (step) {
      case 'completed': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-primary-600'
    }
  }

  const getProgressPercentage = () => {
    switch (progress.step) {
      case 'creating': return 10
      case 'connecting': return 15
      case 'searching': return 25
      case 'saving': return 40
      case 'emails':
        if (progress.contactsFound && progress.emailsProcessed) {
          return 40 + (progress.emailsProcessed / progress.contactsFound) * 50
        }
        return 50
      case 'completed': return 100
      case 'error': return 0
      default: return 0
    }
  }

  const getProgressMessage = () => {
    if (progress.step === 'error' && progress.message.includes('Network error')) {
      return (
        <div>
          <p className="text-red-700 mb-2">{progress.message}</p>
          <p className="text-sm text-red-600">
            This usually means the Sales.rocks API is not accessible from your browser. This could be due to CORS restrictions or network issues.
          </p>
        </div>
      )
    }
    return progress.message
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: progress.step === 'completed' ? 0 : 360 }}
          transition={{
            duration: progress.step === 'completed' ? 0 : 2,
            repeat: progress.step === 'completed' ? 0 : Infinity,
            ease: "linear"
          }}
          className={`w-16 h-16 mx-auto mb-4 ${getStepColor(progress.step)}`}
        >
          <SafeIcon icon={getStepIcon(progress.step)} className="w-full h-full" />
        </motion.div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {progress.step === 'completed' ? 'Analysis Complete!' : 'Analyzing Company...'}
        </h2>

        <div className="text-gray-600 mb-4">
          {getProgressMessage()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(getProgressPercentage())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
            className={`h-2 rounded-full ${
              progress.step === 'error' 
                ? 'bg-red-500' 
                : progress.step === 'completed' 
                  ? 'bg-green-500' 
                  : 'bg-primary-500'
            }`}
          />
        </div>
      </div>

      {/* Statistics */}
      {(progress.contactsFound || progress.emailsFound !== undefined) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {progress.contactsFound && (
            <div className="text-center p-3 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {progress.contactsFound}
              </div>
              <div className="text-sm text-gray-600">Contacts Found</div>
            </div>
          )}
          {progress.emailsProcessed !== undefined && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {progress.emailsProcessed}
              </div>
              <div className="text-sm text-gray-600">Emails Processed</div>
            </div>
          )}
          {progress.emailsFound !== undefined && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {progress.emailsFound}
              </div>
              <div className="text-sm text-gray-600">Emails Found</div>
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {[
          { key: 'creating', label: 'Creating company record' },
          { key: 'connecting', label: 'Connecting to Sales.rocks API' },
          { key: 'searching', label: 'Searching LinkedIn contacts' },
          { key: 'saving', label: 'Saving contact information' },
          { key: 'emails', label: 'Finding email addresses' },
          { key: 'completed', label: 'Analysis complete' }
        ].map((step, index) => {
          const isActive = progress.step === step.key
          const isCompleted = ['creating', 'connecting', 'searching', 'saving'].includes(step.key) && 
                            ['emails', 'completed'].includes(progress.step)

          return (
            <div key={step.key} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-100' 
                  : isActive 
                    ? 'bg-primary-100' 
                    : 'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-600" />
                ) : isActive ? (
                  <SafeIcon icon={FiLoader} className="w-4 h-4 text-primary-600 animate-spin" />
                ) : (
                  <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`text-sm ${
                isCompleted || isActive 
                  ? 'text-gray-900 font-medium' 
                  : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Debug Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <SafeIcon icon={FiCode} className="h-4 w-4 text-gray-600" />
          <h4 className="font-medium text-gray-900 text-sm">Debug Information</h4>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Current Step: {progress.step}</div>
          <div>Contacts Found: {progress.contactsFound || 0}</div>
          <div>Emails Processed: {progress.emailsProcessed || 0}</div>
          <div>Emails Found: {progress.emailsFound || 0}</div>
          <div>Timestamp: {new Date().toLocaleTimeString()}</div>
          {progress._debug && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <div className="font-mono">
                Debug Data: {JSON.stringify(progress._debug, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {progress.step === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try with a different company domain</li>
            <li>• Use the "Test Connection" button on the main analyzer page</li>
            <li>• Check the browser console for detailed logs</li>
            <li>• Contact support if the issue persists</li>
          </ul>
        </div>
      )}
    </motion.div>
  )
}

export default AnalysisProgress