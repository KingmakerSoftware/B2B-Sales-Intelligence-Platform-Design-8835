import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from './SafeIcon'

const { FiTarget } = FiIcons

function LoadingSpinner() {
  console.log('LoadingSpinner rendering')
  
  // Add a click handler to help debug
  const handleClick = () => {
    console.log('Loading spinner clicked - this should help debug')
    console.log('Current URL:', window.location.href)
    console.log('Current hash:', window.location.hash)
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center"
      onClick={handleClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center cursor-pointer"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <SafeIcon icon={FiTarget} className="w-full h-full text-primary-600" />
        </motion.div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">SalesIntel Pro</h2>
        <p className="text-gray-600">Loading...</p>
        <p className="text-xs text-gray-400 mt-2">Click anywhere if stuck</p>
      </motion.div>
    </div>
  )
}

export default LoadingSpinner