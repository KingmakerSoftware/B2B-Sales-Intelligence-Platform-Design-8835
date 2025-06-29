import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiTrash2, FiAlertTriangle, FiLoader, FiX, FiZap } = FiIcons

function DeleteCompanyButton({ company, onDelete, disabled = false }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [forceMode, setForceMode] = useState(false)

  const handleDeleteClick = () => {
    setShowConfirmDialog(true)
    setError('')
    setForceMode(false)
  }

  const handleConfirmDelete = async (useForce = false) => {
    setDeleting(true)
    setError('')

    try {
      if (useForce) {
        // Use force delete for problematic records
        console.log('🔧 Using force delete mode')
        await onDelete(company.id, true) // Pass force flag
      } else {
        await onDelete(company.id)
      }
      setShowConfirmDialog(false)
    } catch (error) {
      console.error('Error deleting company:', error)
      setError(error.message || 'Failed to delete company')
      
      // If normal delete failed with UUID error, offer force delete
      if (error.message?.includes('invalid input syntax for type uuid') || 
          error.message?.includes('UUID')) {
        setForceMode(true)
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    if (!deleting) {
      setShowConfirmDialog(false)
      setError('')
      setForceMode(false)
    }
  }

  const isCorrupted = !company?.company_name || !company?.domain

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={disabled || deleting}
        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : isCorrupted
            ? 'bg-orange-600 text-white hover:bg-orange-700'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
        title={isCorrupted ? "Delete corrupted company record" : "Delete company and all associated contacts"}
      >
        <SafeIcon icon={FiTrash2} className="h-5 w-5" />
        <span>{isCorrupted ? 'Delete Corrupted' : 'Delete Company'}</span>
      </button>

      <AnimatePresence>
        {showConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  forceMode ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <SafeIcon 
                    icon={forceMode ? FiZap : FiAlertTriangle} 
                    className={`h-6 w-6 ${forceMode ? 'text-orange-600' : 'text-red-600'}`} 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {forceMode ? 'Force Delete Record' : 'Delete Company'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {forceMode ? 'Using advanced deletion method' : 'This action cannot be undone'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Are you sure you want to delete{' '}
                  <strong>{company?.company_name || '[Corrupted Record]'}</strong>?
                </p>
                
                {forceMode && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-orange-800">
                      <strong>Force Delete Mode:</strong> This will attempt to remove the corrupted record 
                      using advanced methods to bypass data validation issues.
                    </p>
                  </div>
                )}

                <div className={`border rounded-lg p-3 ${
                  forceMode ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
                }`}>
                  <p className="text-sm font-medium mb-1">
                    <strong>This will permanently delete:</strong>
                  </p>
                  <ul className={`text-sm mt-1 space-y-1 ${
                    forceMode ? 'text-orange-700' : 'text-red-700'
                  }`}>
                    <li>• Company record and analysis data</li>
                    <li>• All associated contacts ({company?.total_contacts_found || 0} contacts)</li>
                    <li>• Contact emails and LinkedIn profiles</li>
                  </ul>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                >
                  <p className="text-sm font-medium mb-1">Deletion Failed:</p>
                  <p className="text-sm">{error}</p>
                  
                  {forceMode && (
                    <p className="text-xs mt-2 text-red-600">
                      If force delete also fails, please contact support.
                    </p>
                  )}
                </motion.div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>

                {forceMode ? (
                  <button
                    onClick={() => handleConfirmDelete(true)}
                    disabled={deleting}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? (
                      <>
                        <SafeIcon icon={FiLoader} className="h-4 w-4 animate-spin" />
                        <span>Force Deleting...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiZap} className="h-4 w-4" />
                        <span>Force Delete</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConfirmDelete(false)}
                    disabled={deleting}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? (
                      <>
                        <SafeIcon icon={FiLoader} className="h-4 w-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        <span>Delete Permanently</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DeleteCompanyButton