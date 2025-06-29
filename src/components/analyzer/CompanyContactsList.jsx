import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import ManualContactForm from '../contacts/ManualContactForm'
import contactService from '../../services/contactService'

const { FiUser, FiMail, FiLinkedin, FiExternalLink, FiUsers, FiCheckCircle, FiAlertCircle, FiClock, FiMessageCircle, FiCheck, FiX, FiPlus } = FiIcons

function CompanyContactsList({ company, contacts, onContactsUpdate }) {
  const [showManualForm, setShowManualForm] = useState(false)
  const [addingContact, setAddingContact] = useState(false)

  console.log('🔍 CompanyContactsList render:', {
    hasCompany: !!company,
    companyName: company?.company_name,
    contactsLength: contacts?.length || 0,
    contacts: contacts
  })

  // Helper function to extract first and last name from LinkedIn handle
  const extractNameFromLinkedInHandle = (linkedinHandle) => {
    if (!linkedinHandle) return { firstName: '', lastName: '', displayName: 'Unknown' }

    try {
      // Remove any prefixes and clean the handle
      const cleanHandle = linkedinHandle.replace(/^@?/, '').toLowerCase()

      // Split by hyphens and filter out numbers/random IDs
      const parts = cleanHandle.split('-').filter(part => {
        // Keep parts that are likely names (not numbers, not single characters, not random IDs)
        return part.length > 1 && 
               !/^\d+$/.test(part) && // Not just numbers
               !/^[a-z]{1}$/.test(part) && // Not single letters
               !/^\d{4,}/.test(part) && // Not starting with 4+ digits
               part.length < 15 // Not too long (likely random IDs)
      })

      if (parts.length >= 2) {
        const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
        return { firstName, lastName, displayName: `${firstName} ${lastName}` }
      } else if (parts.length === 1) {
        const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        return { firstName, lastName: '', displayName: firstName }
      }

      // Fallback to original handle if parsing fails
      return { firstName: cleanHandle, lastName: '', displayName: cleanHandle }
    } catch (error) {
      console.log('Error parsing LinkedIn handle:', linkedinHandle, error)
      return { firstName: linkedinHandle, lastName: '', displayName: linkedinHandle }
    }
  }

  // Get status info for contact
  const getStatusInfo = (status) => {
    const statusMap = {
      'not_contacted': { label: 'Not Contacted', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiClock },
      'attempted_contact': { label: 'Attempted', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FiMessageCircle },
      'awaiting_response': { label: 'Awaiting Response', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FiClock },
      'following_up': { label: 'Following Up', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: FiMessageCircle },
      'won': { label: 'Won', color: 'text-green-600', bgColor: 'bg-green-100', icon: FiCheck },
      'lost': { label: 'Lost', color: 'text-red-600', bgColor: 'bg-red-100', icon: FiX }
    }
    return statusMap[status] || statusMap['not_contacted']
  }

  // Handle manual contact addition
  const handleAddManualContact = async (contactData) => {
    try {
      setAddingContact(true)
      console.log('🆕 Adding manual contact:', contactData)

      const newContact = await contactService.createManualContact(contactData)
      
      console.log('✅ Manual contact added successfully:', newContact)
      
      // Update the contacts list if callback is provided
      if (onContactsUpdate) {
        const updatedContacts = await contactService.getContactsByCompany(company.id)
        onContactsUpdate(updatedContacts)
      }
      
      setShowManualForm(false)
    } catch (error) {
      console.error('❌ Error adding manual contact:', error)
      throw error // Let the form handle the error display
    } finally {
      setAddingContact(false)
    }
  }

  // Add safety check for contacts
  if (!contacts) {
    console.log('⚠️ No contacts provided to CompanyContactsList')
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-8 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiUsers} className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Contacts...</h3>
        <p className="text-gray-600">
          Please wait while we load the contact information.
        </p>
      </motion.div>
    )
  }

  // Enhance contacts with extracted names
  const enhancedContacts = contacts.map(contact => {
    const nameData = extractNameFromLinkedInHandle(contact.linkedin_handle)
    return {
      ...contact,
      extracted_first_name: nameData.firstName,
      extracted_last_name: nameData.lastName,
      display_name: contact.full_name || nameData.displayName
    }
  })

  // Deduplicate contacts based on linkedin_handle (primary key)
  const uniqueContacts = enhancedContacts.reduce((acc, contact) => {
    const existingIndex = acc.findIndex(c => c.linkedin_handle === contact.linkedin_handle)
    if (existingIndex >= 0) {
      // If duplicate found, keep the one with more complete data (email preferred)
      if (contact.email && !acc[existingIndex].email) {
        acc[existingIndex] = contact
      }
    } else {
      acc.push(contact)
    }
    return acc
  }, [])

  // Separate contacts based on email availability
  const contactsWithEmails = uniqueContacts.filter(contact => 
    contact.email && contact.email.trim() !== ''
  )
  const contactsWithoutEmails = uniqueContacts.filter(contact => 
    !contact.email || contact.email.trim() === ''
  )

  console.log('📊 Contact list debug:', {
    totalContacts: contacts.length,
    uniqueContacts: uniqueContacts.length,
    withEmails: contactsWithEmails.length,
    withoutEmails: contactsWithoutEmails.length,
    duplicatesRemoved: contacts.length - uniqueContacts.length,
    sampleEnhanced: uniqueContacts.slice(0, 2).map(c => ({
      handle: c.linkedin_handle,
      extractedName: c.display_name,
      firstName: c.extracted_first_name,
      lastName: c.extracted_last_name
    }))
  })

  if (!uniqueContacts.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-8 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiUsers} className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Contacts Found</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any LinkedIn contacts for {company?.company_name || 'this company'}. 
          This might be because the domain is new, private, or has limited public presence.
        </p>
        
        {/* Add Manual Contact Button */}
        <button
          onClick={() => setShowManualForm(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="h-5 w-5" />
          <span>Add Contact Manually</span>
        </button>
      </motion.div>
    )
  }

  // Contact Card Component - Enhanced for better clickability
  const ContactCard = ({ contact, index, hasEmail = false }) => {
    const statusInfo = getStatusInfo(contact.status)
    const StatusIcon = statusInfo.icon

    // Ensure contact has an ID for navigation
    const contactId = contact.id || contact.linkedin_handle

    return (
      <motion.div
        key={contactId}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`border rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${
          hasEmail 
            ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
        }`}
      >
        {/* Make the entire card clickable */}
        <Link
          to={`/contact/${contactId}`}
          className="block p-4 w-full h-full group"
          onClick={(e) => {
            console.log('🖱️ Contact card clicked:', {
              contactId,
              contact: contact.display_name,
              hasId: !!contact.id,
              linkedinHandle: contact.linkedin_handle
            })
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                hasEmail ? 'bg-green-100 group-hover:bg-green-200' : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <SafeIcon icon={FiUser} className={`h-6 w-6 ${hasEmail ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-lg group-hover:text-primary-600 transition-colors truncate">
                  {contact.display_name}
                </h4>
                
                {/* Show extracted names if different from display name */}
                {contact.extracted_first_name && contact.extracted_last_name && (
                  <div className="text-sm text-gray-500 mb-1">
                    {contact.extracted_first_name} {contact.extracted_last_name}
                    {contact.display_name !== `${contact.extracted_first_name} ${contact.extracted_last_name}` && (
                      <span className="ml-2 text-xs text-blue-600">(from LinkedIn)</span>
                    )}
                  </div>
                )}
                
                {contact.job_title && (
                  <p className="text-sm text-gray-600 mb-2 truncate">{contact.job_title}</p>
                )}
                
                <div className="space-y-2">
                  {hasEmail ? (
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiMail} className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-green-600 font-medium truncate">
                        {contact.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiMail} className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500 italic">No email found</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiLinkedin} className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-blue-600 truncate">@{contact.linkedin_handle}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Badge and Action Indicators */}
            <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
              {/* Status Badge */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                <SafeIcon icon={StatusIcon} className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </span>
              
              {/* Email Status Badge */}
              {hasEmail ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <SafeIcon icon={FiCheckCircle} className="h-3 w-3 mr-1" />
                  Email Available
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <SafeIcon icon={FiAlertCircle} className="h-3 w-3 mr-1" />
                  LinkedIn Only
                </span>
              )}
              
              {/* Click indicator */}
              <div className="text-xs text-gray-400 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Details</span>
                <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
              </div>
            </div>
          </div>
          
          {/* Additional metadata */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <div className="truncate">
              LinkedIn: @{contact.linkedin_handle}
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              {contact.email_found_at && (
                <div>
                  Email found: {new Date(contact.email_found_at).toLocaleDateString()}
                </div>
              )}
              <div>
                Added: {new Date(contact.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Contact Summary</h2>
          
          {/* Add Manual Contact Button */}
          <button
            onClick={() => setShowManualForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-5 w-5" />
            <span>Add Contact</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">{uniqueContacts.length}</div>
            <div className="text-sm text-gray-600">Total Contacts</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{contactsWithEmails.length}</div>
            <div className="text-sm text-gray-600">With Email Addresses</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {uniqueContacts.length > 0 ? Math.round((contactsWithEmails.length / uniqueContacts.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Email Success Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Contacts with Emails */}
      {contactsWithEmails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Contacts with Email Addresses ({contactsWithEmails.length})
            </h3>
          </div>
          <div className="mb-3 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            💡 <strong>Tip:</strong> Click on any contact card to view detailed information, edit contact details, add notes, and track communication status.
          </div>
          <div className="space-y-4">
            {contactsWithEmails.map((contact, index) => (
              <ContactCard
                key={contact.id || contact.linkedin_handle}
                contact={contact}
                index={index}
                hasEmail={true}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Contacts without Emails */}
      {contactsWithoutEmails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              LinkedIn Contacts Only ({contactsWithoutEmails.length})
            </h3>
          </div>
          <div className="mb-3 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
            💡 <strong>Tip:</strong> These contacts don't have email addresses yet, but you can still view their details and reach out via LinkedIn.
          </div>
          <div className="space-y-4">
            {contactsWithoutEmails.map((contact, index) => (
              <ContactCard
                key={contact.id || contact.linkedin_handle}
                contact={contact}
                index={index}
                hasEmail={false}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Export/Action Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-1">Contact Breakdown:</div>
            <div>• {contactsWithEmails.length} contacts ready for email outreach</div>
            <div>• {contactsWithoutEmails.length} contacts for LinkedIn engagement</div>
            <div>• <strong>All contacts are clickable</strong> for detailed management</div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <SafeIcon icon={FiUsers} className="h-4 w-4 mr-2" />
              Export All Contacts
            </button>
            {contactsWithEmails.length > 0 && (
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                <SafeIcon icon={FiMail} className="h-4 w-4 mr-2" />
                Export Email List
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manual Contact Form Modal */}
      <AnimatePresence>
        {showManualForm && (
          <ManualContactForm
            company={company}
            onSave={handleAddManualContact}
            onClose={() => setShowManualForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default CompanyContactsList