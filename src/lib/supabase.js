import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dcrxudbewrxpfjcvoren.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnh1ZGJld3J4cGZqY3ZvcmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMjQ0NTUsImV4cCI6MjA2NjcwMDQ1NX0.i9OJk4y0AMPf34tw9YNqECBAbSH_hyU2YhTeWUddAW8'

console.log('Supabase module loading...')
console.log('SUPABASE_URL:', SUPABASE_URL)
console.log('SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY?.length)

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables')
}

let supabase
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  console.log('Supabase client created successfully')
} catch (error) {
  console.error('Error creating Supabase client:', error)
  throw error
}

export { supabase }
export default supabase