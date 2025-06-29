import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { useApp } from '../../context/AppContext'

const { FiEdit2, FiTrash2, FiPackage, FiTag } = FiIcons

function ProductList({ products, onEdit, categories }) {
  const { dispatch } = useApp()

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product/service?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: productId })
    }
  }

  const getCategoryColor = (categoryName) => {
    if (!categoryName) return 'bg-gray-100 text-gray-800'
    
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ]
    
    const hash = categoryName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return colors[Math.abs(hash) % colors.length]
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiPackage} className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Products or Services Yet</h3>
        <p className="text-gray-500 mb-4">
          Start by adding your first product or service to showcase what you offer.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <SafeIcon icon={FiPackage} className="h-6 w-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                
                {product.category && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                    <SafeIcon icon={FiTag} className="h-3 w-3 mr-1" />
                    {product.category}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Target Industries</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.targetIndustries.length > 0 ? (
                      product.targetIndustries.map((industry, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {industry}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">No target industries specified</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.keyFeatures.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                    {product.keyFeatures.length > 3 && (
                      <li className="text-xs text-gray-500 italic">
                        +{product.keyFeatures.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-green-600">
                  {product.pricing}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit product/service"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete product/service"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default ProductList