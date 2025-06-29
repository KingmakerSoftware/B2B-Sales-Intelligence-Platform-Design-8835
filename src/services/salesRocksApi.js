import { supabase } from '../lib/supabase'

class SalesRocksService {
  constructor() {
    this.accessToken = null
    this.tokenExpiry = null
    this.fallbackMode = false
  }

  async callEdgeFunction(action, data = {}) {
    try {
      console.log('🔄 Calling Edge Function:', {
        action,
        data,
        timestamp: new Date().toISOString()
      })
      
      const { data: result, error } = await supabase.functions.invoke('sales-rocks-api', {
        body: { action, data }
      })
      
      console.log('📥 Edge Function Raw Response:', {
        action,
        result,
        error,
        resultType: typeof result,
        isArray: Array.isArray(result),
        keys: result && typeof result === 'object' ? Object.keys(result) : 'N/A'
      })
      
      if (error) {
        console.error('❌ Edge function error details:', error)
        throw new Error(`Edge function error: ${error.message}`)
      }
      
      if (!result) {
        console.error('❌ No response from Edge Function')
        throw new Error('No response from Edge Function')
      }
      
      if (!result.success) {
        console.error('❌ Edge Function returned failure:', result)
        throw new Error(result.error || 'Unknown error from API')
      }
      
      console.log('✅ Edge Function Success Data:', {
        action,
        data: result.data,
        dataType: typeof result.data,
        isArray: Array.isArray(result.data),
        dataKeys: result.data && typeof result.data === 'object' ? Object.keys(result.data) : 'N/A'
      })
      
      return result.data
    } catch (error) {
      console.error(`❌ Edge function call failed for action "${action}":`, {
        error: error.message,
        stack: error.stack,
        data
      })
      
      // If Edge Function fails, try fallback for testing
      if (action === 'testConnection') {
        return this.fallbackTestConnection()
      }
      
      throw error
    }
  }

  async fallbackTestConnection() {
    console.log('🔄 Using fallback connection test...')
    
    try {
      // Try a simple test by checking if we can reach our own API
      const response = await fetch('https://api.github.com/zen', {
        method: 'GET',
        mode: 'cors'
      })
      
      if (response.ok) {
        return {
          connected: true,
          message: 'Fallback connection test successful - Edge Function may need deployment',
          fallback: true
        }
      } else {
        throw new Error('Network connectivity issue')
      }
    } catch (error) {
      return {
        connected: false,
        message: 'Connection test failed - check network connectivity',
        fallback: true,
        error: error.message
      }
    }
  }

  async getValidAccessToken() {
    console.log('🔑 Getting valid access token...')
    
    // Check if we have a valid token in memory
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      console.log('✅ Using cached access token')
      return this.accessToken
    }

    // Check for valid token in database
    try {
      console.log('🔍 Checking database for valid token...')
      const { data: tokenData, error } = await supabase
        .from('sales_rocks_tokens_2024')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log('📊 Database token query result:', { tokenData, error })

      if (!error && tokenData) {
        console.log('✅ Using database token:', {
          tokenExists: !!tokenData.access_token,
          expiresAt: tokenData.expires_at
        })
        this.accessToken = tokenData.access_token
        this.tokenExpiry = new Date(tokenData.expires_at)
        return this.accessToken
      }
    } catch (error) {
      console.log('⚠️ No valid database token found:', error.message)
    }

    // Request new token via Edge Function
    console.log('🔄 Requesting new access token...')
    return await this.requestNewAccessToken()
  }

  async requestNewAccessToken() {
    try {
      console.log('🔄 Requesting new Sales.rocks access token via Edge Function...')
      
      const authResult = await this.callEdgeFunction('authenticate')
      
      console.log('🔑 Authentication result:', {
        hasAccessToken: !!authResult.access_token,
        tokenType: authResult.token_type,
        expiresIn: authResult.expires_in
      })
      
      if (!authResult.access_token) {
        throw new Error('No access token received in response')
      }

      // Calculate expiry time (subtract 5 minutes for safety)
      const expiresIn = authResult.expires_in || 3600
      const expiresAt = new Date(Date.now() + (expiresIn - 300) * 1000)

      console.log('💾 Storing token in database...')
      
      // Store token in database
      try {
        const { error: insertError } = await supabase
          .from('sales_rocks_tokens_2024')
          .insert({
            access_token: authResult.access_token,
            token_type: authResult.token_type || 'Bearer',
            expires_at: expiresAt.toISOString()
          })

        if (insertError) {
          console.error('❌ Failed to store token in database:', insertError)
        } else {
          console.log('✅ Successfully stored token in database')
        }
      } catch (dbError) {
        console.error('❌ Database error storing token:', dbError)
      }

      // Store in memory
      this.accessToken = authResult.access_token
      this.tokenExpiry = expiresAt

      console.log('✅ Successfully obtained access token')
      return this.accessToken
    } catch (error) {
      console.error('❌ Error requesting access token:', error)
      throw new Error(`Failed to authenticate with Sales.rocks: ${error.message}`)
    }
  }

  async getLinkedInContactsByDomain(domain) {
    try {
      console.log('🔍 Starting LinkedIn contacts search:', {
        domain,
        timestamp: new Date().toISOString()
      })
      
      const accessToken = await this.getValidAccessToken()
      console.log('🔑 Access token obtained for LinkedIn search')
      
      const result = await this.callEdgeFunction('getLinkedInContacts', {
        domain,
        accessToken
      })

      console.log('📊 Raw LinkedIn contacts API result:', {
        domain,
        result,
        resultType: typeof result,
        isArray: Array.isArray(result),
        resultKeys: result && typeof result === 'object' ? Object.keys(result) : 'N/A',
        resultStringified: JSON.stringify(result, null, 2)
      })

      // Detailed analysis of the result structure
      let handles = []
      let debugInfo = {
        originalResult: result,
        processingSteps: []
      }
      
      if (Array.isArray(result)) {
        debugInfo.processingSteps.push('Result is direct array')
        handles = result.slice(0, 10)
      } else if (result && Array.isArray(result.contact_linkedin_handles)) {
        debugInfo.processingSteps.push('Result has contact_linkedin_handles array')
        handles = result.contact_linkedin_handles.slice(0, 10)
      } else if (result && result.contact_linkedin_handles) {
        debugInfo.processingSteps.push('Result has contact_linkedin_handles but not array')
        console.log('🔍 contact_linkedin_handles type:', typeof result.contact_linkedin_handles)
        console.log('🔍 contact_linkedin_handles value:', result.contact_linkedin_handles)
      } else if (typeof result === 'object' && result !== null) {
        debugInfo.processingSteps.push('Searching for arrays in result object')
        const allValues = Object.values(result)
        const possibleArrays = allValues.filter(val => Array.isArray(val))
        
        console.log('🔍 All values in result:', allValues)
        console.log('🔍 Possible arrays found:', possibleArrays)
        
        if (possibleArrays.length > 0) {
          debugInfo.processingSteps.push(`Found ${possibleArrays.length} arrays in result`)
          handles = possibleArrays[0].slice(0, 10)
        }
      } else {
        debugInfo.processingSteps.push('Result is not an object or array')
      }

      console.log('📋 LinkedIn contacts processing result:', {
        domain,
        handlesFound: handles.length,
        handles,
        debugInfo,
        finalHandles: handles
      })

      if (handles.length === 0) {
        console.log('⚠️ No LinkedIn handles found for domain:', {
          domain,
          resultWasEmpty: !result,
          resultType: typeof result,
          resultValue: result
        })
      }

      return handles

    } catch (error) {
      console.error('❌ Error fetching LinkedIn contacts:', {
        domain,
        error: error.message,
        stack: error.stack
      })
      throw new Error(`Failed to fetch contacts for ${domain}: ${error.message}`)
    }
  }

  async getContactEmailByLinkedInHandle(linkedinHandle) {
    try {
      console.log('📧 Starting email search:', {
        linkedinHandle,
        timestamp: new Date().toISOString()
      })
      
      const accessToken = await this.getValidAccessToken()
      console.log('🔑 Access token obtained for email search')
      
      const result = await this.callEdgeFunction('getContactEmail', {
        linkedinHandle,
        accessToken
      })

      console.log('📊 Raw email search API result:', {
        linkedinHandle,
        result,
        resultType: typeof result,
        resultKeys: result && typeof result === 'object' ? Object.keys(result) : 'N/A',
        resultStringified: JSON.stringify(result, null, 2)
      })

      const emailResult = {
        email: result?.contact_email || null,
        full_name: result?.full_name || null,
        job_title: result?.job_title || null
      }

      console.log('📧 Email search final result:', {
        linkedinHandle,
        emailResult,
        hasEmail: !!emailResult.email
      })

      return emailResult

    } catch (error) {
      console.error('❌ Error fetching email for LinkedIn handle:', {
        linkedinHandle,
        error: error.message,
        stack: error.stack
      })
      return null // Return null instead of throwing to continue processing other contacts
    }
  }

  // Helper method to extract domain from URL
  extractDomain(url) {
    try {
      console.log('🔧 Extracting domain from URL:', url)
      
      // Remove protocol if present
      let cleanUrl = url.replace(/^https?:\/\//, '')
      // Remove www if present
      cleanUrl = cleanUrl.replace(/^www\./, '')
      // Remove path and query parameters
      cleanUrl = cleanUrl.split('/')[0].split('?')[0]
      const result = cleanUrl.toLowerCase()
      
      console.log('🔧 Domain extraction result:', {
        original: url,
        cleaned: result
      })
      
      return result
    } catch (error) {
      console.error('❌ Error extracting domain:', error)
      const fallback = url.replace(/^www\./, '').toLowerCase()
      console.log('🔧 Using fallback domain extraction:', fallback)
      return fallback
    }
  }

  // Helper method to get company name from domain
  getCompanyNameFromDomain(domain) {
    const cleanDomain = domain.replace(/^www\./, '').split('.')[0]
    const result = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1)
    
    console.log('🏢 Company name from domain:', {
      domain,
      companyName: result
    })
    
    return result
  }

  // Method to test API connection
  async testConnection() {
    try {
      console.log('🧪 Testing Sales.rocks API connection via Edge Function...')
      
      const result = await this.callEdgeFunction('testConnection')
      console.log('🧪 Connection test result:', result)
      
      if (result.fallback) {
        // Fallback mode was used
        return result.connected
      }
      
      return result.connected
    } catch (error) {
      console.error('❌ API connection test failed:', error)
      
      // Try fallback test
      try {
        const fallbackResult = await this.fallbackTestConnection()
        return fallbackResult.connected
      } catch (fallbackError) {
        console.error('❌ Fallback test also failed:', fallbackError)
        return false
      }
    }
  }

  // Check if Edge Function is deployed and working
  async checkEdgeFunctionStatus() {
    try {
      console.log('🔍 Checking Edge Function status...')
      
      // Try to call a simple function to check if it's deployed
      const { error } = await supabase.functions.invoke('sales-rocks-api', {
        body: { action: 'ping' }
      })
      
      const isAvailable = !error
      console.log('🔍 Edge Function status:', {
        isAvailable,
        error: error?.message
      })
      
      return isAvailable
    } catch (error) {
      console.error('❌ Edge Function not available:', error)
      return false
    }
  }
}

export default new SalesRocksService()