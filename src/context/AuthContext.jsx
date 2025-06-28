import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_auth2024')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    setAuthLoading(true)
    try {
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

      // If user is created, also create/update profile
      if (data.user) {
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          full_name: userData.fullName || '',
          company_name: userData.companyName || '',
          job_title: userData.jobTitle || '',
          phone: userData.phone || ''
        }

        const { error: profileError } = await supabase
          .from('user_profiles_auth2024')
          .upsert(profileData)

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setAuthLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setAuthLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setAuthLoading(false)
    }
  }

  const signOut = async () => {
    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setUserProfile(null)
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setAuthLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') }

    setAuthLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles_auth2024')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setAuthLoading(false)
    }
  }

  const resetPassword = async (email) => {
    setAuthLoading(true)
    try {
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}