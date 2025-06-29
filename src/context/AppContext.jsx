import React, { createContext, useContext, useReducer } from 'react'

const AppContext = createContext()

const initialState = {
  categories: [
    { id: 1, name: 'Software Solutions', created_at: '2024-01-01' },
    { id: 2, name: 'Consulting Services', created_at: '2024-01-01' },
    { id: 3, name: 'Cloud Services', created_at: '2024-01-01' }
  ],
  products: [
    {
      id: 1,
      name: 'CloudSync Pro',
      category: 'Software Solutions',
      description: 'Enterprise-grade cloud storage and synchronization solution',
      targetIndustries: ['Technology', 'Finance', 'Healthcare'],
      keyFeatures: ['99.9% uptime', 'End-to-end encryption', 'Real-time sync'],
      pricing: '$15/user/month'
    }
  ],
  successStories: [
    {
      id: 1,
      companyName: 'MedTech Solutions',
      industry: 'Healthcare',
      category: 'Software Solutions',
      challenge: 'Secure patient data storage and compliance',
      solution: 'Implemented CloudSync Pro with HIPAA compliance',
      results: '40% reduction in data management costs, 100% compliance achieved',
      metrics: {
        costSaving: 40,
        complianceScore: 100,
        userSatisfaction: 95
      }
    }
  ],
  companies: [],
  selectedCompany: null,
  searchHistory: []
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_COMPANIES':
      return { ...state, companies: action.payload }
    
    case 'SET_SELECTED_COMPANY':
      return { ...state, selectedCompany: action.payload }
    
    // Category management
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        )
      }
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== action.payload)
      }
    
    // Product management
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] }
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? action.payload : p
        )
      }
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      }
    
    // Success story management
    case 'ADD_SUCCESS_STORY':
      return { ...state, successStories: [...state.successStories, action.payload] }
    
    case 'UPDATE_SUCCESS_STORY':
      return {
        ...state,
        successStories: state.successStories.map(s =>
          s.id === action.payload.id ? action.payload : s
        )
      }
    
    case 'DELETE_SUCCESS_STORY':
      return {
        ...state,
        successStories: state.successStories.filter(s => s.id !== action.payload)
      }
    
    case 'ADD_SEARCH_HISTORY':
      return {
        ...state,
        searchHistory: [action.payload, ...state.searchHistory.slice(0, 9)]
      }
    
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}