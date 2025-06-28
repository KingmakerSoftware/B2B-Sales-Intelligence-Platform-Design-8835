import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { useAuth } from '../../context/AuthContext'

const { FiTarget, FiSearch, FiBarChart3, FiPackage, FiUser, FiLogOut, FiSettings } = FiIcons

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, userProfile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiBarChart3 },
    { path: '/prospect-search', label: 'Prospect Search', icon: FiSearch },
    { path: '/products', label: 'Products & Stories', icon: FiPackage },
  ]

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      navigate('/login')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <SafeIcon icon={FiTarget} className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SalesIntel Pro</span>
          </Link>

          <div className="flex items-center space-x-8">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative group"
                >
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-primary-50">
                    <SafeIcon
                      icon={item.icon}
                      className={`h-5 w-5 ${
                        location.pathname === item.path
                          ? 'text-primary-600'
                          : 'text-gray-600 group-hover:text-primary-600'
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        location.pathname === item.path
                          ? 'text-primary-600'
                          : 'text-gray-600 group-hover:text-primary-600'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                </span>
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <SafeIcon icon={FiUser} className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleSignOut()
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <SafeIcon icon={FiLogOut} className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  )
}

export default Navbar