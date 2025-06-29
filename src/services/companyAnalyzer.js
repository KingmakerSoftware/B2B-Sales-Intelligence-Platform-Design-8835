import { supabase } from '../lib/supabase'
import salesRocksService from './salesRocksApi'

class CompanyAnalyzerService {
  constructor() {
    // Track ongoing analyses to prevent duplicates
    this.ongoingAnalyses = new Set()
  }

  // Helper function to extract first and last name from LinkedIn handle
  extractNameFromLinkedInHandle(linkedinHandle) {
    if (!linkedinHandle) return { firstName: '', lastName: '' }

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
        return { firstName, lastName }
      } else if (parts.length === 1) {
        const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        return { firstName, lastName: '' }
      }

      return { firstName: '', lastName: '' }
    } catch (error) {
      console.log('Error parsing LinkedIn handle:', linkedinHandle, error)
      return { firstName: '', lastName: '' }
    }
  }

  async createCompanyRecord(domain, websiteUrl, userId) {
    try {
      const cleanDomain = salesRocksService.extractDomain(domain)
      const companyName = salesRocksService.getCompanyNameFromDomain(cleanDomain)

      // Check if company already exists for this user and domain
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies_analyzer2024')
        .select('*')
        .eq('user_id', userId)
        .eq('domain', cleanDomain)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing company:', checkError)
        throw checkError
      }

      if (existingCompany) {
        console.log('🔄 Found existing company record:', existingCompany.id)
        return existingCompany
      }

      console.log('🆕 Creating new company record for:', cleanDomain)

      const { data, error } = await supabase
        .from('companies_analyzer2024')
        .insert({
          user_id: userId,
          domain: cleanDomain,
          company_name: companyName,
          website_url: websiteUrl,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Database error creating company:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating company record:', error)
      throw error
    }
  }

  // Helper function to validate and format company ID - MADE MORE FLEXIBLE
  validateCompanyId(companyId) {
    if (!companyId) {
      throw new Error('Company ID is required')
    }

    // Convert to string for consistent handling
    const idString = String(companyId).trim()

    if (!idString) {
      throw new Error('Company ID cannot be empty')
    }

    // Check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isUuid = uuidRegex.test(idString)

    console.log('🔍 ID Validation:', {
      original: companyId,
      string: idString,
      isUuid,
      length: idString.length
    })

    // CHANGED: Return the ID even if it's not a perfect UUID for now
    // This allows the system to try the lookup and handle errors gracefully
    return {
      id: idString,
      isUuid: isUuid,
      needsFallback: !isUuid
    }
  }

  async deleteCompany(companyId, userId) {
    try {
      console.log('🗑️ Starting company deletion:', { companyId, userId, type: typeof companyId })

      // Enhanced validation
      if (!userId) {
        throw new Error('User ID is required for deletion')
      }

      // For this specific case, let's try to find the company by a more flexible search first
      let company = null
      let actualCompanyId = null

      try {
        // First, try to validate as UUID
        const validation = this.validateCompanyId(companyId)
        actualCompanyId = validation.id

        // Try to fetch with the validated ID
        const { data, error } = await supabase
          .from('companies_analyzer2024')
          .select('id, user_id, company_name, domain')
          .eq('id', validation.id)
          .eq('user_id', userId)
          .single()

        if (!error && data) {
          company = data
        }
      } catch (validationError) {
        console.log('🔍 UUID validation failed, trying alternative approaches:', validationError.message)

        // If UUID validation fails, try to find the company by other means
        // This handles edge cases where the ID might be corrupted
        console.log('🔍 Searching for company with flexible matching...')

        // Try to find any records for this user that might match
        const { data: allUserCompanies, error: fetchAllError } = await supabase
          .from('companies_analyzer2024')
          .select('id, user_id, company_name, domain')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (fetchAllError) {
          console.error('Error fetching user companies:', fetchAllError)
          throw new Error(`Cannot find company: ${validationError.message}`)
        }

        // Look for a company that might match the ID in some way
        const potentialMatch = allUserCompanies?.find(c =>
          c.id.includes(String(companyId)) ||
          String(companyId).includes(c.id) ||
          (!c.company_name || !c.domain) // corrupted record
        )

        if (potentialMatch) {
          console.log('🎯 Found potential match:', potentialMatch)
          company = potentialMatch
          actualCompanyId = potentialMatch.id
        } else {
          throw new Error(`Company not found. Original error: ${validationError.message}`)
        }
      }

      if (!company) {
        throw new Error('Company not found or you do not have permission to delete it')
      }

      console.log('✅ Company found for deletion:', {
        id: company.id,
        name: company.company_name || '[No name]',
        domain: company.domain || '[No domain]'
      })

      // Delete all associated contacts first
      console.log('🗑️ Deleting associated contacts...')
      const { error: contactsError } = await supabase
        .from('company_contacts_analyzer2024')
        .delete()
        .eq('company_id', actualCompanyId)

      if (contactsError) {
        console.error('Error deleting company contacts:', contactsError)
        console.log('⚠️ Contact deletion failed, but continuing with company deletion')
      } else {
        console.log('✅ Deleted company contacts')
      }

      // Delete the company record
      console.log('🗑️ Deleting company record...')
      const { error: companyError } = await supabase
        .from('companies_analyzer2024')
        .delete()
        .eq('id', actualCompanyId)
        .eq('user_id', userId) // Extra safety check

      if (companyError) {
        console.error('Error deleting company:', companyError)
        throw new Error(`Failed to delete company record: ${companyError.message}`)
      }

      console.log('✅ Company deleted successfully:', company.company_name || '[Unnamed]')
      return { success: true, deletedCompany: company }
    } catch (error) {
      console.error('Error deleting company:', error)
      throw error
    }
  }

  async updateCompanyStatus(companyId, status, totalContacts = null) {
    try {
      // Validate company ID
      const validation = this.validateCompanyId(companyId)

      // Validate status values
      const validStatuses = ['pending', 'analyzing', 'completed', 'failed', 'error']
      if (!validStatuses.includes(status)) {
        console.error('Invalid status value:', status)
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`)
      }

      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'completed') {
        updateData.analysis_completed_at = new Date().toISOString()
      }

      if (totalContacts !== null) {
        updateData.total_contacts_found = totalContacts
      }

      const { error } = await supabase
        .from('companies_analyzer2024')
        .update(updateData)
        .eq('id', validation.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating company status:', error)
      throw error
    }
  }

  async saveContactsToDatabase(companyId, linkedinHandles) {
    try {
      // Validate company ID
      const validation = this.validateCompanyId(companyId)

      // Limit to maximum 10 contacts
      const limitedHandles = linkedinHandles.slice(0, 10)

      const contactsToInsert = limitedHandles.map(handle => {
        // Extract names from LinkedIn handle
        const nameData = this.extractNameFromLinkedInHandle(handle)
        
        return {
          company_id: validation.id,
          linkedin_handle: handle,
          profile_url: `https://linkedin.com/in/${handle}`,
          first_name: nameData.firstName || null,
          last_name: nameData.lastName || null,
          // Set display name based on extracted data
          full_name: nameData.firstName && nameData.lastName ? 
            `${nameData.firstName} ${nameData.lastName}` : 
            nameData.firstName || handle
        }
      })

      console.log('💾 Saving contacts with extracted names:', {
        count: contactsToInsert.length,
        sample: contactsToInsert.slice(0, 2).map(c => ({
          handle: c.linkedin_handle,
          firstName: c.first_name,
          lastName: c.last_name,
          fullName: c.full_name
        }))
      })

      const { error } = await supabase
        .from('company_contacts_analyzer2024')
        .insert(contactsToInsert)

      if (error) throw error

      return contactsToInsert.length
    } catch (error) {
      console.error('Error saving contacts:', error)
      throw error
    }
  }

  async updateContactEmail(companyId, linkedinHandle, email, fullName = null, jobTitle = null) {
    try {
      // Validate company ID
      const validation = this.validateCompanyId(companyId)

      const updateData = {
        email,
        email_found_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (fullName) {
        updateData.full_name = fullName
      }

      if (jobTitle) {
        updateData.job_title = jobTitle
      }

      const { error } = await supabase
        .from('company_contacts_analyzer2024')
        .update(updateData)
        .eq('company_id', validation.id)
        .eq('linkedin_handle', linkedinHandle)

      if (error) throw error
    } catch (error) {
      console.error('Error updating contact email:', error)
      throw error
    }
  }

  // COMPLETELY REWRITTEN - More flexible and robust
  async getCompanyById(companyId) {
    try {
      console.log('🔍 Fetching company by ID:', { companyId, type: typeof companyId })

      // Basic validation first
      if (!companyId || companyId === 'undefined' || companyId === 'null') {
        throw new Error('Invalid company ID provided')
      }

      const idString = String(companyId).trim()
      if (!idString) {
        throw new Error('Company ID cannot be empty')
      }

      console.log('🔍 Using ID for query:', { original: companyId, processed: idString })

      // Try direct lookup first
      const { data, error } = await supabase
        .from('companies_analyzer2024')
        .select('*')
        .eq('id', idString)
        .single()

      console.log('📊 Database response:', {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message
      })

      if (error) {
        console.error('Database error fetching company:', error)
        if (error.code === 'PGRST116') {
          throw new Error(`Company with ID ${idString} not found`)
        }
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data) {
        throw new Error(`No company found with ID ${idString}`)
      }

      // Basic validation - only check for truly essential fields
      const criticalFields = ['id', 'user_id']
      const missingCritical = criticalFields.filter(field =>
        data[field] === null || data[field] === undefined
      )

      if (missingCritical.length > 0) {
        console.error('❌ Company data missing critical fields:', {
          companyId: idString,
          missingCritical,
          data
        })
        throw new Error(`Company data is corrupted. Missing critical fields: ${missingCritical.join(', ')}`)
      }

      // Soft validation for other fields - warn but don't fail
      const recommendedFields = ['domain', 'company_name', 'status']
      const missingRecommended = recommendedFields.filter(field =>
        !data[field] || data[field] === null || data[field] === undefined || data[field] === ''
      )

      if (missingRecommended.length > 0) {
        console.warn('⚠️ Company data missing recommended fields:', {
          companyId: idString,
          missingRecommended,
          willContinue: true
        })

        // Set default values for missing fields
        if (!data.company_name) data.company_name = '[Unnamed Company]'
        if (!data.domain) data.domain = '[No Domain]'
        if (!data.status) data.status = 'unknown'
      }

      console.log('✅ Company data loaded successfully:', {
        id: data.id,
        name: data.company_name,
        domain: data.domain,
        status: data.status,
        hasAllFields: missingRecommended.length === 0
      })

      return data
    } catch (error) {
      console.error('❌ Error fetching company:', {
        error: error.message,
        companyId,
        stack: error.stack
      })
      throw error
    }
  }

  async getCompanyContacts(companyId) {
    try {
      // Validate company ID
      const validation = this.validateCompanyId(companyId)

      const { data, error } = await supabase
        .from('company_contacts_analyzer2024')
        .select('*')
        .eq('company_id', validation.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('📥 Loaded company contacts:', {
        companyId: validation.id,
        count: data?.length || 0,
        hasFirstName: data?.filter(c => c.first_name).length || 0,
        hasLastName: data?.filter(c => c.last_name).length || 0,
        hasEmails: data?.filter(c => c.email).length || 0
      })

      return data || []
    } catch (error) {
      console.error('Error fetching company contacts:', error)
      throw error
    }
  }

  async getUserCompanies(userId) {
    try {
      const { data, error } = await supabase
        .from('companies_analyzer2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching user companies:', error)
      throw error
    }
  }

  async analyzeCompany(domain, websiteUrl, userId, onProgress) {
    const analysisKey = `${userId}-${domain}`

    // Check if analysis is already ongoing
    if (this.ongoingAnalyses.has(analysisKey)) {
      console.log('⚠️ Analysis already in progress for:', domain)
      throw new Error('Analysis already in progress for this company')
    }

    let companyId = null

    try {
      // Mark analysis as ongoing
      this.ongoingAnalyses.add(analysisKey)

      // Step 1: Create company record and start analysis
      onProgress?.({
        step: 'creating',
        message: 'Creating company record...'
      })

      const company = await this.createCompanyRecord(domain, websiteUrl, userId)
      companyId = company.id

      // Update status to analyzing
      await this.updateCompanyStatus(companyId, 'analyzing')

      // Step 2: Search for LinkedIn contacts using real API
      onProgress?.({
        step: 'searching',
        message: `Searching LinkedIn for contacts at ${company.domain}...`
      })

      console.log(`Starting LinkedIn search for domain: ${company.domain}`)

      // Call the real Sales.rocks API
      const apiResult = await salesRocksService.getLinkedInContactsByDomain(company.domain)

      // Ensure we have an array and limit to 10 contacts
      let linkedinHandles = []
      if (Array.isArray(apiResult)) {
        linkedinHandles = apiResult.slice(0, 10)
      } else if (apiResult && Array.isArray(apiResult.contact_linkedin_handles)) {
        linkedinHandles = apiResult.contact_linkedin_handles.slice(0, 10)
      } else if (typeof apiResult === 'object' && apiResult !== null) {
        // Handle case where result is an object with array properties
        const possibleArrays = Object.values(apiResult).filter(Array.isArray)
        if (possibleArrays.length > 0) {
          linkedinHandles = possibleArrays[0].slice(0, 10)
        }
      }

      console.log(`Found ${linkedinHandles.length} LinkedIn contacts (limited to 10):`, linkedinHandles)

      if (linkedinHandles.length === 0) {
        await this.updateCompanyStatus(companyId, 'completed', 0)
        onProgress?.({
          step: 'completed',
          message: `Analysis completed - no LinkedIn contacts found for ${company.domain}`,
          company,
          contacts: [],
          contactsFound: 0,
          emailsFound: 0
        })
        return { company, contacts: [] }
      }

      // Step 3: Save LinkedIn handles to database with extracted names
      onProgress?.({
        step: 'saving',
        message: `Found ${linkedinHandles.length} LinkedIn contacts. Saving to database...`,
        contactsFound: linkedinHandles.length
      })

      await this.saveContactsToDatabase(companyId, linkedinHandles)

      // Step 4: Find emails for each contact using real API
      onProgress?.({
        step: 'emails',
        message: 'Searching for contact emails...',
        contactsFound: linkedinHandles.length,
        emailsProcessed: 0,
        emailsFound: 0
      })

      let emailsFound = 0

      // Process contacts in batches to avoid rate limiting
      const batchSize = 3 // Reduced batch size for better rate limiting
      for (let i = 0; i < linkedinHandles.length; i += batchSize) {
        const batch = linkedinHandles.slice(i, i + batchSize)

        const batchPromises = batch.map(async (handle, batchIndex) => {
          const globalIndex = i + batchIndex

          try {
            console.log(`Searching email for LinkedIn handle: ${handle}`)

            // Call the real Sales.rocks API for email
            const contactData = await salesRocksService.getContactEmailByLinkedInHandle(handle)

            if (contactData && contactData.email) {
              console.log(`Found email for ${handle}: ${contactData.email}`)

              await this.updateContactEmail(
                companyId,
                handle,
                contactData.email,
                contactData.full_name,
                contactData.job_title
              )
              emailsFound++
            } else {
              console.log(`No email found for ${handle}`)
            }

            // Update progress
            onProgress?.({
              step: 'emails',
              message: `Processing emails... ${globalIndex + 1}/${linkedinHandles.length}`,
              contactsFound: linkedinHandles.length,
              emailsProcessed: globalIndex + 1,
              emailsFound
            })
          } catch (error) {
            console.error(`Error processing contact ${handle}:`, error)

            // Update progress even on error
            onProgress?.({
              step: 'emails',
              message: `Processing emails... ${globalIndex + 1}/${linkedinHandles.length}`,
              contactsFound: linkedinHandles.length,
              emailsProcessed: globalIndex + 1,
              emailsFound
            })
          }
        })

        // Wait for current batch to complete
        await Promise.all(batchPromises)

        // Add a small delay between batches to respect rate limits
        if (i + batchSize < linkedinHandles.length) {
          await new Promise(resolve => setTimeout(resolve, 1500)) // Increased delay
        }
      }

      // Step 5: Complete analysis
      await this.updateCompanyStatus(companyId, 'completed', linkedinHandles.length)

      const contacts = await this.getCompanyContacts(companyId)

      onProgress?.({
        step: 'completed',
        message: `Analysis completed! Found ${linkedinHandles.length} contacts, ${emailsFound} emails`,
        company,
        contacts,
        contactsFound: linkedinHandles.length,
        emailsFound
      })

      return { company, contacts }
    } catch (error) {
      console.error('Error in company analysis:', error)

      if (companyId) {
        await this.updateCompanyStatus(companyId, 'failed')
      }

      onProgress?.({
        step: 'error',
        message: `Analysis failed: ${error.message}`,
        error
      })

      throw error
    } finally {
      // Always remove from ongoing analyses
      this.ongoingAnalyses.delete(analysisKey)
    }
  }

  // Emergency cleanup function to remove all corrupted records for a user
  async cleanupCorruptedRecords(userId) {
    try {
      console.log('🧹 Starting cleanup of corrupted records for user:', userId)

      // Get all companies for this user
      const { data: companies, error: fetchError } = await supabase
        .from('companies_analyzer2024')
        .select('id, company_name, domain, status')
        .eq('user_id', userId)

      if (fetchError) {
        console.error('Error fetching companies for cleanup:', fetchError)
        throw fetchError
      }

      console.log(`Found ${companies?.length || 0} companies to check`)

      let deletedCount = 0
      const errors = []

      for (const company of companies || []) {
        try {
          // Try to validate the company record
          const requiredFields = ['id', 'company_name', 'domain', 'status']
          const missingFields = requiredFields.filter(field =>
            !company[field] || company[field] === null || company[field] === undefined
          )

          if (missingFields.length > 0) {
            console.log(`🗑️ Deleting corrupted company ${company.id} - missing: ${missingFields.join(', ')}`)

            // Delete contacts first
            await supabase
              .from('company_contacts_analyzer2024')
              .delete()
              .eq('company_id', company.id)

            // Delete company
            await supabase
              .from('companies_analyzer2024')
              .delete()
              .eq('id', company.id)
              .eq('user_id', userId)

            deletedCount++
          }
        } catch (error) {
          console.error(`Error processing company ${company.id}:`, error)
          errors.push({
            companyId: company.id,
            error: error.message
          })
        }
      }

      console.log(`✅ Cleanup complete: ${deletedCount} corrupted records deleted`)
      return { deletedCount, errors }
    } catch (error) {
      console.error('Error in cleanup process:', error)
      throw error
    }
  }

  // Force delete a specific problematic record
  async forceDeleteCorruptedRecord(companyId, userId) {
    try {
      console.log('🔧 Force deleting problematic record:', { companyId, userId })

      // Try to find and delete by raw SQL if necessary
      const { data: allCompanies, error: fetchError } = await supabase
        .from('companies_analyzer2024')
        .select('id, company_name, domain')
        .eq('user_id', userId)

      if (fetchError) {
        throw fetchError
      }

      // Find any record that might match this ID
      const targetCompany = allCompanies?.find(c =>
        c.id.toString().includes(companyId.toString()) ||
        companyId.toString().includes(c.id.toString()) ||
        !c.company_name ||
        !c.domain
      )

      if (!targetCompany) {
        throw new Error('No matching corrupted record found')
      }

      console.log('🎯 Found target company for force deletion:', targetCompany)

      // Delete contacts first
      await supabase
        .from('company_contacts_analyzer2024')
        .delete()
        .eq('company_id', targetCompany.id)

      // Delete company
      const { error: deleteError } = await supabase
        .from('companies_analyzer2024')
        .delete()
        .eq('id', targetCompany.id)
        .eq('user_id', userId)

      if (deleteError) {
        throw deleteError
      }

      console.log('✅ Force deletion successful')
      return { success: true, deletedCompany: targetCompany }
    } catch (error) {
      console.error('Error in force deletion:', error)
      throw error
    }
  }
}

export default new CompanyAnalyzerService()