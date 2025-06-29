import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiX, FiSave, FiLoader, FiUser, FiMail, FiPhone, FiLinkedin, FiBriefcase, FiBuilding } = FiIcons

const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'attempted_contact', label: 'Attempted to Contact' },
  { value: 'awaiting_response', label: 'Awaiting Response' },
  { value: 'following_up', label: 'Following Up' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' }
]

function ManualContactForm({ company, onSave, onClose }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    full_name: '',
    job_title: '',
    email: '',
    phone: '',
    linkedin_handle: '',
    status: 'not_contacted',
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.full_name && !formData.first_name && !formData.last_name) {
        throw new Error('Please provide at least a full name or first/last name')
      }

      // Prepare contact data
      const contactData = {
        ...formData,
        company_id: company.id,
        company_name: company.company_name,
        // Set full_name if not provided but first/last names are
        full_name: formData.full_name || (formData.first_name && formData.last_name 
          ? `${formData.first_name} ${formData.last_name}` 
          : formData.first_name || formData.last_name || ''),
        // Clean LinkedIn handle
        linkedin_handle: formData.linkedin_handle.replace(/^@?/, '').replace(/^.*linkedin\.com\/in\//, ''),
        // Set profile URL if LinkedIn handle is provided
        profile_url: formData.linkedin_handle 
          ? `https://linkedin.com/in/${formData.linkedin_handle.replace(/^@?/, '').replace(/^.*linkedin\.com\/in\//, '')}`
          : null
      }

      await onSave(contactData)
    } catch (error) {
      console.error('Error saving manual contact:', error)
      setError(error.message || 'Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Contact</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add a contact manually to {company.company_name || 'this company'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Company Info Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiBuilding} className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Adding to Company</h3>
            </div>
            <p className="text-blue-800 font-medium">{company.company_name}</p>
            <p className="text-blue-600 text-sm">{company.domain}</p>
          </div>

          {/* Name Fields */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-600" />
              <span>Contact Name</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full/Display Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Provide either first/last name or full name (or both)
            </p>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <SafeIcon icon={FiBriefcase} className="h-5 w-5 text-gray-600" />
              <span>Professional Information</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Senior Software Engineer, VP of Sales, CEO"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-600" />
              <span>Contact Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="john.smith@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* LinkedIn Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <SafeIcon icon={FiLinkedin} className="h-5 w-5 text-gray-600" />
              <span>LinkedIn Profile</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Handle/URL
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  linkedin.com/in/
                </span>
                <input
                  type="text"
                  name="linkedin_handle"
                  value={formData.linkedin_handle}
                  onChange={handleChange}
                  className="w-full pl-32 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="johnsmith or full LinkedIn URL"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter just the username or paste the full LinkedIn URL
              </p>
            </div>
          </div>

          {/* Status and Notes */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add any notes about this contact, how you found them, or follow-up reminders..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <SafeIcon icon={FiLoader} className="h-4 w-4 animate-spin" />
                  <span>Adding Contact...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} className="h-4 w-4" />
                  <span>Add Contact</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default ManualContactForm