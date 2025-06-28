import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dcrxudbewrxpfjcvoren.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnh1ZGJld3J4cGZqY3ZvcmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMjQ0NTUsImV4cCI6MjA2NjcwMDQ1NX0.i9OJk4y0AMPf34tw9YNqECBAbSH_hyU2YhTeWUddAW8'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export default supabase