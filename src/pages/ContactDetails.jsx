import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../components/common/SafeIcon'
import { useAuth } from '../context/AuthContext'
import contactService from '../services/contactService'
import ContactEditForm from '../components/contacts/ContactEditForm'

const { FiUser, FiMail, FiPhone, FiLinkedin, FiBuilding, FiCalendar, FiEdit2, FiArrowLeft, FiExternalLink, FiClock, FiCheck, FiX, FiMessageCircle, FiSave, FiLoader } = FiIcons

const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Not Contacted', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { value: 'attempted_contact', label: 'Attempted to Contact', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'awaiting_response', label: 'Awaiting Response', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'following_up', label: 'Following Up', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'won', label: 'Won', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'lost', label: 'Lost', color: 'text-red-600', bgColor: 'bg-red-100' }
]

function ContactDetails() {
  const { contactId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    if (user && contactId) {
      loadContact()
    }
  }, [user, contactId])

  // Sync notes state when contact changes
  useEffect(() => {
    if (contact) {
      setNotes(contact.notes || '')
    }
  }, [contact])

  const loadContact = async () => {
    try {
      setLoading(true)
      const contactData = await contactService.getContactById(contactId)
      setContact(contactData)
      setNotes(contactData.notes || '') // Set initial notes
    } catch (error) {
      console.error('Error loading contact:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleContactUpdate = async (updatedData) => {
    try {
      const updatedContact = await contactService.updateContact(contactId, updatedData)
      setContact(updatedContact)
      setShowEditForm(false)
      
      // Sync the notes state with the updated contact
      setNotes(updatedContact.notes || '')
      
      console.log('✅ Contact updated and notes synced:', {
        contactNotes: updatedContact.notes,
        localNotes: updatedContact.notes || ''
      })
    } catch (error) {
      console.error('Error updating contact:', error)
      setError(error.message)
    }
  }

  const handleNotesUpdate = async () => {
    try {
      setSavingNotes(true)
      const updatedContact = await contactService.updateContact(contactId, { notes })
      setContact(updatedContact)
      setIsEditingNotes(false)
      
      console.log('✅ Notes updated successfully:', {
        newNotes: notes,
        contactNotes: updatedContact.notes
      })
    } catch (error) {
      console.error('Error updating notes:', error)
      setError(error.message)
    } finally {
      setSavingNotes(false)
    }
  }

  const handleNotesCancel = () => {
    setIsEditingNotes(false)
    // Reset notes to the contact's current notes
    setNotes(contact.notes || '')
  }

  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0]
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'not_contacted': return FiClock
      case 'attempted_contact': return FiMessageCircle
      case 'awaiting_response': return FiClock
      case 'following_up': return FiMessageCircle
      case 'won': return FiCheck
      case 'lost': return FiX
      default: return FiClock
    }
  }

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

  if (error || !contact) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The contact could not be found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(contact.status)
  const StatusIcon = getStatusIcon(contact.status)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <SafeIcon icon={FiUser} className="h-8 w-8 text-primary-600" />
                <span>{contact.display_name || contact.full_name || 'Unknown Contact'}</span>
              </h1>
              <p className="text-gray-600">
                {contact.job_title && contact.company_name 
                  ? `${contact.job_title} at ${contact.company_name}`
                  : contact.job_title || contact.company_name || 'Contact Details'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEditForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiEdit2} className="h-5 w-5" />
            <span>Edit Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900">{contact.display_name || contact.full_name || 'Not provided'}</p>
                    {contact.first_name && contact.last_name && (
                      <p className="text-sm text-gray-500">{contact.first_name} {contact.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Job Title */}
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiBuilding} className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <p className="text-gray-900">{contact.job_title || 'Not provided'}</p>
                  </div>
                </div>

                {/* Company */}
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiBuilding} className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <p className="text-gray-900">{contact.company_name || 'Not provided'}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                      >
                        <span>{contact.email}</span>
                        <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500 italic">Not provided</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiPhone} className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {contact.phone}
                      </a>
                    ) : (
                      <p className="text-gray-500 italic">Not provided</p>
                    )}
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiLinkedin} className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    {contact.profile_url ? (
                      <a
                        href={contact.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                      >
                        <span>View Profile</span>
                        <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
                      </a>
                    ) : contact.linkedin_handle ? (
                      <a
                        href={`https://linkedin.com/in/${contact.linkedin_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                      >
                        <span>@{contact.linkedin_handle}</span>
                        <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-gray-500 italic">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiCalendar} className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Added</label>
                      <p className="text-gray-900">
                        {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {contact.email_found_at && (
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Found</label>
                        <p className="text-gray-900">
                          {new Date(contact.email_found_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {notes ? 'Edit Notes' : 'Add Notes'}
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add notes about this contact, conversations, follow-ups, etc."
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleNotesUpdate}
                      disabled={savingNotes}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingNotes ? (
                        <>
                          <SafeIcon icon={FiLoader} className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <SafeIcon icon={FiSave} className="h-4 w-4" />
                          <span>Save Notes</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleNotesCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[120px]">
                  {notes ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <SafeIcon icon={FiMessageCircle} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notes added yet</p>
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Add your first note
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.bgColor}`}>
                  <SafeIcon icon={StatusIcon} className={`h-5 w-5 ${statusInfo.color}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{statusInfo.label}</p>
                  <p className="text-sm text-gray-500">Current status</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditForm(true)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Change Status
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <SafeIcon icon={FiMail} className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-900">Send Email</span>
                  </a>
                )}

                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <SafeIcon icon={FiPhone} className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-900">Call</span>
                  </a>
                )}

                {(contact.profile_url || contact.linkedin_handle) && (
                  <a
                    href={contact.profile_url || `https://linkedin.com/in/${contact.linkedin_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <SafeIcon icon={FiLinkedin} className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-900">View LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            {/* Contact Source */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Source</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Found via</label>
                  <p className="text-gray-900">Company Analyzer</p>
                </div>
                {contact.company_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <Link
                      to={`/company-analyzer/${contact.company_id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {contact.company_name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Modal */}
        {showEditForm && (
          <ContactEditForm
            contact={contact}
            onSave={handleContactUpdate}
            onClose={() => setShowEditForm(false)}
          />
        )}
      </motion.div>
    </div>
  )
}

export default ContactDetails