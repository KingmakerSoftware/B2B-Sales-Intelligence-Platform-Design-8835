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
    console.log('Edge Function called with method:', req.method)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))

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

    console.log('User authenticated:', user.id)

    const requestBody = await req.text()
    console.log('Request body:', requestBody)

    let parsedBody
    try {
      parsedBody = JSON.parse(requestBody)
    } catch (e) {
      throw new Error('Invalid JSON in request body')
    }

    const { action, data } = parsedBody

    console.log('Action:', action)
    console.log('Data:', data)

    let result
    switch (action) {
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

    console.log('Result:', result)

    // Log the API call
    try {
      await logApiCall(supabaseClient, user.id, action, data, result, true)
    } catch (logError) {
      console.error('Failed to log API call:', logError)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Edge Function Error:', error)

    // Try to log the error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user) {
        await logApiCall(supabaseClient, user.id, 'error', {}, null, false, error.message)
      }
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

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
  console.log('Authenticating with Sales.rocks...')
  
  const response = await fetch(`${SALES_ROCKS_API_BASE}/auth/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(SALES_ROCKS_CREDENTIALS),
  })

  console.log('Auth response status:', response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Auth error response:', errorText)
    throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('Auth response data:', data)
  
  if (!data.access_token) {
    throw new Error('No access token received')
  }

  console.log('Successfully authenticated with Sales.rocks')
  return {
    access_token: data.access_token,
    token_type: data.token_type || 'Bearer',
    expires_in: data.expires_in || 3600
  }
}

async function getLinkedInContactsByDomain(domain: string, accessToken: string) {
  console.log(`Searching LinkedIn contacts for domain: ${domain}`)
  
  const response = await fetch(`${SALES_ROCKS_API_BASE}/search/linkedinContactsByDomain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ domain }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LinkedIn search failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log(`Found ${data.contact_linkedin_handles?.length || 0} LinkedIn contacts`)
  
  return {
    contact_linkedin_handles: data.contact_linkedin_handles || []
  }
}

async function getContactEmailByLinkedInHandle(linkedinHandle: string, accessToken: string) {
  console.log(`Searching email for LinkedIn handle: ${linkedinHandle}`)
  
  const response = await fetch(`${SALES_ROCKS_API_BASE}/search/contactEmailByContactLinkedinHandle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ linkedin_handle: linkedinHandle }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Email search failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log(`Email search result for ${linkedinHandle}:`, data)
  
  return {
    contact_email: data.contact_email || null,
    full_name: data.full_name || null,
    job_title: data.job_title || null
  }
}

async function testConnection() {
  console.log('Testing Sales.rocks API connection...')
  
  try {
    const authResult = await authenticateWithSalesRocks()
    return {
      connected: true,
      message: 'Successfully connected to Sales.rocks API',
      token_received: !!authResult.access_token
    }
  } catch (error) {
    console.error('Connection test error:', error)
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
    console.log('API call logged successfully')
  } catch (error) {
    console.error('Failed to log API call:', error)
  }
}