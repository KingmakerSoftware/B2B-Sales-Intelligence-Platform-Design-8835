import { supabase } from '../lib/supabase'

class ContactService {
  // Get a single contact by ID with enhanced details
  async getContactById(contactId) {
    try {
      console.log('🔍 Fetching contact by ID:', contactId)
      
      const { data, error } = await supabase
        .from('company_contacts_analyzer2024')
        .select(`
          *,
          companies_analyzer2024 (
            id,
            company_name,
            domain,
            website_url
          )
        `)
        .eq('id', contactId)
        .single()

      if (error) {
        console.error('Database error fetching contact:', error)
        throw new Error(`Failed to fetch contact: ${error.message}`)
      }

      if (!data) {
        throw new Error('Contact not found')
      }

      // Enhance the contact data
      const enhancedContact = {
        ...data,
        display_name: data.full_name || (data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : null),
        company_name: data.companies_analyzer2024?.company_name || null,
        company_domain: data.companies_analyzer2024?.domain || null,
        company_website: data.companies_analyzer2024?.website_url || null,
        status: data.status || 'not_contacted', // Default status
        notes: data.notes || '' // Ensure notes field exists
      }

      console.log('✅ Contact loaded successfully:', {
        id: enhancedContact.id,
        name: enhancedContact.display_name,
        email: enhancedContact.email,
        status: enhancedContact.status,
        hasNotes: !!enhancedContact.notes
      })

      return enhancedContact
    } catch (error) {
      console.error('Error fetching contact:', error)
      throw error
    }
  }

  // Update contact information
  async updateContact(contactId, updateData) {
    try {
      console.log('💾 Updating contact:', { contactId, updateData })

      // Prepare the update data - only include fields that exist in the table
      const allowedFields = [
        'first_name', 'last_name', 'full_name', 'job_title', 
        'email', 'phone', 'linkedin_handle', 'status', 'notes'
      ]

      const filteredData = {}
      allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          filteredData[field] = updateData[field]
        }
      })

      // The updated_at column will be automatically updated by the trigger
      console.log('📝 Filtered update data:', filteredData)

      const { data, error } = await supabase
        .from('company_contacts_analyzer2024')
        .update(filteredData)
        .eq('id', contactId)
        .select()
        .single()

      if (error) {
        console.error('Database error updating contact:', error)
        throw new Error(`Failed to update contact: ${error.message}`)
      }

      console.log('✅ Contact updated successfully')
      
      // Return the updated contact with full details
      return await this.getContactById(contactId)
    } catch (error) {
      console.error('Error updating contact:', error)
      throw error
    }
  }

  // Create a new contact manually
  async createManualContact(contactData) {
    try {
      console.log('🆕 Creating manual contact:', contactData)

      // Validate required fields
      if (!contactData.company_id) {
        throw new Error('Company ID is required')
      }

      if (!contactData.full_name && !contactData.first_name && !contactData.last_name) {
        throw new Error('At least one name field is required')
      }

      // Prepare the contact data
      const insertData = {
        company_id: contactData.company_id,
        first_name: contactData.first_name || null,
        last_name: contactData.last_name || null,
        full_name: contactData.full_name || null,
        job_title: contactData.job_title || null,
        email: contactData.email || null,
        phone: contactData.phone || null,
        linkedin_handle: contactData.linkedin_handle || null,
        profile_url: contactData.profile_url || null,
        status: contactData.status || 'not_contacted',
        notes: contactData.notes || '',
        // Mark as manually added
        source: 'manual'
      }

      console.log('📝 Insert data prepared:', insertData)

      const { data, error } = await supabase
        .from('company_contacts_analyzer2024')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Database error creating contact:', error)
        throw new Error(`Failed to create contact: ${error.message}`)
      }

      console.log('✅ Manual contact created successfully:', data.id)
      
      // Return the created contact with full details
      return await this.getContactById(data.id)
    } catch (error) {
      console.error('Error creating manual contact:', error)
      throw error
    }
  }

  // Get contacts for a specific company
  async getContactsByCompany(companyId) {
    try {
      console.log('🔍 Fetching contacts for company:', companyId)

      const { data, error } = await supabase
        .from('company_contacts_analyzer2024')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error fetching company contacts:', error)
        throw new Error(`Failed to fetch contacts: ${error.message}`)
      }

      // Enhance contact data
      const enhancedContacts = (data || []).map(contact => ({
        ...contact,
        display_name: contact.full_name || (contact.first_name && contact.last_name ? `${contact.first_name} ${contact.last_name}` : null),
        status: contact.status || 'not_contacted',
        notes: contact.notes || ''
      }))

      console.log('✅ Company contacts loaded:', {
        count: enhancedContacts.length,
        withEmails: enhancedContacts.filter(c => c.email).length
      })

      return enhancedContacts
    } catch (error) {
      console.error('Error fetching company contacts:', error)
      throw error
    }
  }

  // Search contacts across all companies for a user
  async searchContacts(userId, searchTerm) {
    try {
      console.log('🔍 Searching contacts for user:', { userId, searchTerm })

      let query = supabase
        .from('company_contacts_analyzer2024')
        .select(`
          *,
          companies_analyzer2024!inner (
            id,
            company_name,
            domain,
            user_id
          )
        `)
        .eq('companies_analyzer2024.user_id', userId)

      if (searchTerm) {
        query = query.or(`
          full_name.ilike.%${searchTerm}%,
          first_name.ilike.%${searchTerm}%,
          last_name.ilike.%${searchTerm}%,
          email.ilike.%${searchTerm}%,
          job_title.ilike.%${searchTerm}%,
          companies_analyzer2024.company_name.ilike.%${searchTerm}%
        `)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Database error searching contacts:', error)
        throw new Error(`Failed to search contacts: ${error.message}`)
      }

      // Enhance contact data
      const enhancedContacts = (data || []).map(contact => ({
        ...contact,
        display_name: contact.full_name || (contact.first_name && contact.last_name ? `${contact.first_name} ${contact.last_name}` : null),
        company_name: contact.companies_analyzer2024?.company_name || null,
        status: contact.status || 'not_contacted',
        notes: contact.notes || ''
      }))

      console.log('✅ Contact search completed:', {
        searchTerm,
        resultsCount: enhancedContacts.length
      })

      return enhancedContacts
    } catch (error) {
      console.error('Error searching contacts:', error)
      throw error
    }
  }

  // Delete a contact
  async deleteContact(contactId, userId) {
    try {
      console.log('🗑️ Deleting contact:', { contactId, userId })

      // First verify the contact belongs to the user
      const { data: contact, error: fetchError } = await supabase
        .from('company_contacts_analyzer2024')
        .select(`
          id,
          companies_analyzer2024!inner (
            user_id
          )
        `)
        .eq('id', contactId)
        .eq('companies_analyzer2024.user_id', userId)
        .single()

      if (fetchError || !contact) {
        throw new Error('Contact not found or you do not have permission to delete it')
      }

      const { error } = await supabase
        .from('company_contacts_analyzer2024')
        .delete()
        .eq('id', contactId)

      if (error) {
        console.error('Database error deleting contact:', error)
        throw new Error(`Failed to delete contact: ${error.message}`)
      }

      console.log('✅ Contact deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('Error deleting contact:', error)
      throw error
    }
  }

  // Get contact statistics for a user
  async getContactStats(userId) {
    try {
      console.log('📊 Fetching contact statistics for user:', userId)

      const { data, error } = await supabase
        .from('company_contacts_analyzer2024')
        .select(`
          status,
          email,
          companies_analyzer2024!inner (
            user_id
          )
        `)
        .eq('companies_analyzer2024.user_id', userId)

      if (error) {
        console.error('Database error fetching contact stats:', error)
        throw new Error(`Failed to fetch contact statistics: ${error.message}`)
      }

      const stats = {
        total: data.length,
        withEmails: data.filter(c => c.email).length,
        byStatus: {
          not_contacted: 0,
          attempted_contact: 0,
          awaiting_response: 0,
          following_up: 0,
          won: 0,
          lost: 0
        }
      }

      // Count by status
      data.forEach(contact => {
        const status = contact.status || 'not_contacted'
        if (Object.prototype.hasOwnProperty.call(stats.byStatus, status)) {
          stats.byStatus[status]++
        }
      })

      console.log('✅ Contact statistics calculated:', stats)
      return stats
    } catch (error) {
      console.error('Error fetching contact statistics:', error)
      throw error
    }
  }

  // Update just the notes for a contact (optimized method)
  async updateContactNotes(contactId, notes) {
    try {
      console.log('📝 Updating contact notes:', { contactId, notesLength: notes?.length || 0 })

      const { data, error } = await supabase
        .from('company_contacts_analyzer2024')
        .update({
          notes: notes || '',
          // updated_at will be automatically updated by the trigger
        })
        .eq('id', contactId)
        .select()
        .single()

      if (error) {
        console.error('Database error updating contact notes:', error)
        throw new Error(`Failed to update notes: ${error.message}`)
      }

      console.log('✅ Contact notes updated successfully')
      return data
    } catch (error) {
      console.error('Error updating contact notes:', error)
      throw error
    }
  }

  // Update just the status for a contact (optimized method)
  async updateContactStatus(contactId, status) {
    try {
      console.log('📊 Updating contact status:', { contactId, status })

      // Validate status
      const validStatuses = ['not_contacted', 'attempted_contact', 'awaiting_response', 'following_up', 'won', 'lost']
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`)
      }

      const { data, error } = await supabase
        .from('company_contacts_analyzer2024')
        .update({
          status,
          // updated_at will be automatically updated by the trigger
        })
        .eq('id', contactId)
        .select()
        .single()

      if (error) {
        console.error('Database error updating contact status:', error)
        throw new Error(`Failed to update status: ${error.message}`)
      }

      console.log('✅ Contact status updated successfully')
      return data
    } catch (error) {
      console.error('Error updating contact status:', error)
      throw error
    }
  }
}

export default new ContactService()