import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    console.log('AuthProvider useEffect started')
    
    // For debugging - set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached - forcing loading to false')
      setLoading(false)
    }, 5000)

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        // Try to import and use Supabase
        const { supabase } = await import('../lib/supabase')
        console.log('Supabase imported successfully')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session result:', { session: !!session, error })
        
        if (error) {
          console.error('Supabase session error:', error)
          setUser(null)
        } else {
          setUser(session?.user ?? null)
          console.log('User set:', !!session?.user)
        }
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event, !!session?.user)
            setUser(session?.user ?? null)
          }
        )

        clearTimeout(loadingTimeout)
        setLoading(false)
        console.log('Auth initialization complete')

        return () => subscription?.unsubscribe()
      } catch (error) {
        console.error('Auth initialization error:', error)
        // If Supabase fails, still allow the app to load without auth
        clearTimeout(loadingTimeout)
        setLoading(false)
        setUser(null)
      }
    }

    initializeAuth()

    return () => {
      clearTimeout(loadingTimeout)
    }
  }, [])

  const signUp = async (email, password, userData = {}) => {
    setAuthLoading(true)
    try {
      const { supabase } = await import('../lib/supabase')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
          }
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('SignUp error:', error)
      return { data: null, error }
    } finally {
      setAuthLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setAuthLoading(true)
    try {
      const { supabase } = await import('../lib/supabase')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('SignIn error:', error)
      return { data: null, error }
    } finally {
      setAuthLoading(false)
    }
  }

  const signOut = async () => {
    setAuthLoading(true)
    try {
      const { supabase } = await import('../lib/supabase')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setUserProfile(null)
      return { error: null }
    } catch (error) {
      console.error('SignOut error:', error)
      return { error }
    } finally {
      setAuthLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') }
    
    setAuthLoading(true)
    try {
      // Simulate profile update for now
      setUserProfile({ ...userProfile, ...updates })
      return { data: { ...userProfile, ...updates }, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setAuthLoading(false)
    }
  }

  const resetPassword = async (email) => {
    setAuthLoading(true)
    try {
      const { supabase } = await import('../lib/supabase')
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchUserProfile = async (userId) => {
    // Simulate profile data for now
    setUserProfile({
      id: userId,
      full_name: 'Demo User',
      email: user?.email || 'demo@example.com',
      company_name: 'Demo Company',
      job_title: 'Sales Manager'
    })
  }

  const value = {
    user,
    userProfile,
    loading,
    authLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    fetchUserProfile
  }

  console.log('AuthContext render - loading:', loading, 'user:', !!user)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}