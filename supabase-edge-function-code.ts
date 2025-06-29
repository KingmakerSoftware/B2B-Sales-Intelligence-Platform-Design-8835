import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SALES_ROCKS_API_BASE = 'https://api.sales.rocks'
const SALES_ROCKS_CREDENTIALS = {
  username: 'drewharrison@outlook.com',
  password: 'LYt@rc5azwa6JXu'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Edge Function called:', {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    })
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    console.log('👤 User authenticated:', user.id)

    const requestBody = await req.text()
    console.log('📥 Request body received:', {
      body: requestBody,
      length: requestBody.length
    })

    let parsedBody
    try {
      parsedBody = JSON.parse(requestBody)
    } catch (e) {
      console.error('❌ JSON parse error:', e)
      throw new Error('Invalid JSON in request body')
    }

    const { action, data } = parsedBody

    console.log('🎯 Action and data parsed:', {
      action,
      data,
      dataType: typeof data
    })

    let result
    switch (action) {
      case 'ping':
        result = { message: 'Edge Function is working!', timestamp: new Date().toISOString() }
        break
      case 'authenticate':
        result = await authenticateWithSalesRocks()
        break
      case 'getLinkedInContacts':
        result = await getLinkedInContactsByDomain(data.domain, data.accessToken)
        break
      case 'getContactEmail':
        result = await getContactEmailByLinkedInHandle(data.linkedinHandle, data.accessToken)
        break
      case 'testConnection':
        result = await testConnection()
        break
      default:
        throw new Error(`Invalid action: ${action}`)
    }

    console.log('✅ Action completed successfully:', {
      action,
      resultType: typeof result,
      resultKeys: result && typeof result === 'object' ? Object.keys(result) : 'N/A',
      resultSample: JSON.stringify(result).substring(0, 500)
    })

    // Log the API call
    try {
      await logApiCall(supabaseClient, user.id, action, data, result, true)
    } catch (logError) {
      console.error('⚠️ Failed to log API call:', logError)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Edge Function Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function authenticateWithSalesRocks() {
  console.log('🔑 Starting Sales.rocks authentication...')
  
  const response = await fetch(`${SALES_ROCKS_API_BASE}/auth/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(SALES_ROCKS_CREDENTIALS),
  })

  console.log('🔑 Auth response details:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Auth error response:', errorText)
    throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('🔑 Auth success data:', {
    hasAccessToken: !!data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
    dataKeys: Object.keys(data)
  })
  
  if (!data.access_token) {
    throw new Error('No access token received')
  }

  console.log('✅ Successfully authenticated with Sales.rocks')
  return {
    access_token: data.access_token,
    token_type: data.token_type || 'Bearer',
    expires_in: data.expires_in || 3600
  }
}

async function getLinkedInContactsByDomain(domain: string, accessToken: string) {
  console.log('🔍 Starting LinkedIn search:', {
    domain,
    hasAccessToken: !!accessToken,
    tokenLength: accessToken ? accessToken.length : 0
  })
  
  const requestBody = JSON.stringify({ domain })
  console.log('📤 LinkedIn search request:', {
    url: `${SALES_ROCKS_API_BASE}/search/linkedinContactsByDomain`,
    method: 'POST',
    body: requestBody,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken.substring(0, 10)}...`
    }
  })
  
  const response = await fetch(`${SALES_ROCKS_API_BASE}/search/linkedinContactsByDomain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: requestBody,
  })

  console.log('📥 LinkedIn search response details:', {
    domain,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ LinkedIn search error:', {
      domain,
      status: response.status,
      statusText: response.statusText,
      errorText
    })
    throw new Error(`LinkedIn search failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('📊 LinkedIn search raw response:', {
    domain,
    data,
    dataType: typeof data,
    isArray: Array.isArray(data),
    dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A',
    dataStringified: JSON.stringify(data, null, 2)
  })
  
  // Detailed processing with extensive logging
  let linkedinHandles = []
  const processingLog = []
  
  if (Array.isArray(data)) {
    processingLog.push('Data is direct array')
    linkedinHandles = data.slice(0, 10)
  } else if (data && Array.isArray(data.contact_linkedin_handles)) {
    processingLog.push('Data has contact_linkedin_handles array')
    linkedinHandles = data.contact_linkedin_handles.slice(0, 10)
  } else if (data && data.contact_linkedin_handles) {
    processingLog.push('Data has contact_linkedin_handles (non-array)')
    console.log('🔍 contact_linkedin_handles details:', {
      type: typeof data.contact_linkedin_handles,
      value: data.contact_linkedin_handles,
      stringified: JSON.stringify(data.contact_linkedin_handles)
    })
  } else if (data && typeof data === 'object') {
    processingLog.push('Searching object for arrays')
    const allKeys = Object.keys(data)
    const allValues = Object.values(data)
    
    console.log('🔍 Object analysis:', {
      allKeys,
      allValues,
      valuesToTypes: allValues.map(v => ({ type: typeof v, isArray: Array.isArray(v), value: v }))
    })
    
    const arrayValues = allValues.filter(val => Array.isArray(val))
    if (arrayValues.length > 0) {
      processingLog.push(`Found ${arrayValues.length} arrays in object`)
      linkedinHandles = arrayValues[0].slice(0, 10)
    }
  }
  
  console.log('📋 LinkedIn processing complete:', {
    domain,
    processingLog,
    handlesFound: linkedinHandles.length,
    handles: linkedinHandles,
    originalDataSample: JSON.stringify(data).substring(0, 200)
  })
  
  return {
    contact_linkedin_handles: linkedinHandles,
    _debug: {
      originalData: data,
      processingLog,
      handlesFound: linkedinHandles.length
    }
  }
}

async function getContactEmailByLinkedInHandle(linkedinHandle: string, accessToken: string) {
  console.log('📧 Starting email search:', {
    linkedinHandle,
    hasAccessToken: !!accessToken
  })
  
  const requestBody = JSON.stringify({ linkedin_handle: linkedinHandle })
  console.log('📤 Email search request:', {
    url: `${SALES_ROCKS_API_BASE}/search/contactEmailByContactLinkedinHandle`,
    method: 'POST',
    body: requestBody
  })
  
  const response = await fetch(`${SALES_ROCKS_API_BASE}/search/contactEmailByContactLinkedinHandle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: requestBody,
  })

  console.log('📥 Email search response details:', {
    linkedinHandle,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Email search error:', {
      linkedinHandle,
      status: response.status,
      statusText: response.statusText,
      errorText
    })
    throw new Error(`Email search failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('📧 Email search raw response:', {
    linkedinHandle,
    data,
    dataType: typeof data,
    dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A',
    dataStringified: JSON.stringify(data, null, 2)
  })
  
  const result = {
    contact_email: data.contact_email || null,
    full_name: data.full_name || null,
    job_title: data.job_title || null,
    _debug: {
      originalData: data,
      hasEmail: !!data.contact_email
    }
  }
  
  console.log('📧 Email search processed result:', {
    linkedinHandle,
    result
  })
  
  return result
}

async function testConnection() {
  console.log('🧪 Testing Sales.rocks API connection...')
  
  try {
    const authResult = await authenticateWithSalesRocks()
    return {
      connected: true,
      message: 'Successfully connected to Sales.rocks API',
      token_received: !!authResult.access_token
    }
  } catch (error) {
    console.error('❌ Connection test error:', error)
    throw new Error(`Connection test failed: ${error.message}`)
  }
}

async function logApiCall(
  supabaseClient: any,
  userId: string,
  requestType: string,
  requestData: any,
  responseData: any,
  success: boolean,
  errorMessage?: string
) {
  try {
    await supabaseClient
      .from('sales_rocks_api_logs_2024')
      .insert({
        user_id: userId,
        request_type: requestType,
        request_data: requestData,
        response_data: responseData,
        success,
        error_message: errorMessage
      })
    console.log('📝 API call logged successfully')
  } catch (error) {
    console.error('⚠️ Failed to log API call:', error)
  }
}