import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: {
    name: 'John Smith',
    company: 'TechSolutions Inc.',
    email: 'john.smith@techsolutions.com'
  },
  products: [
    {
      id: 1,
      name: 'CloudSync Pro',
      category: 'Cloud Storage',
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
      challenge: 'Secure patient data storage and compliance',
      solution: 'Implemented CloudSync Pro with HIPAA compliance',
      results: '40% reduction in data management costs, 100% compliance achieved',
      metrics: { costSaving: 40, complianceScore: 100, userSatisfaction: 95 }
    }
  ],
  companies: [],
  selectedCompany: null,
  searchHistory: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_COMPANIES':
      return { ...state, companies: action.payload };
    case 'SET_SELECTED_COMPANY':
      return { ...state, selectedCompany: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'ADD_SUCCESS_STORY':
      return { ...state, successStories: [...state.successStories, action.payload] };
    case 'ADD_SEARCH_HISTORY':
      return {
        ...state,
        searchHistory: [action.payload, ...state.searchHistory.slice(0, 9)]
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}