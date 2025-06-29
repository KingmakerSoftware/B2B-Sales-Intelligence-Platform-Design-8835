import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../components/common/SafeIcon'
import { useApp } from '../context/AppContext'
import ProductList from '../components/products/ProductList'
import ProductForm from '../components/products/ProductForm'
import SuccessStoryList from '../components/products/SuccessStoryList'
import SuccessStoryForm from '../components/products/SuccessStoryForm'
import CategoryManager from '../components/products/CategoryManager'

const { FiPlus, FiSettings } = FiIcons

function ProductManager() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('products')
  const [showProductForm, setShowProductForm] = useState(false)
  const [showStoryForm, setShowStoryForm] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingStory, setEditingStory] = useState(null)

  const tabs = [
    { id: 'products', label: 'Products & Services' },
    { id: 'stories', label: 'Success Stories' },
    { id: 'categories', label: 'Categories' }
  ]

  const handleCategoriesUpdate = async (newCategories) => {
    dispatch({ type: 'SET_CATEGORIES', payload: newCategories })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Products & Success Stories
          </h1>
          <p className="text-gray-600">
            Manage your product portfolio, success stories, and categories for better sales alignment.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Products & Services Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Products & Services
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showcase what you offer to potential clients
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('categories')}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SafeIcon icon={FiSettings} className="h-5 w-5" />
                  <span>Manage Categories</span>
                </button>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="h-5 w-5" />
                  <span>Add Product/Service</span>
                </button>
              </div>
            </div>

            <ProductList
              products={state.products}
              categories={state.categories}
              onEdit={(product) => {
                setEditingProduct(product)
                setShowProductForm(true)
              }}
            />

            {showProductForm && (
              <ProductForm
                product={editingProduct}
                categories={state.categories}
                onClose={() => {
                  setShowProductForm(false)
                  setEditingProduct(null)
                }}
              />
            )}
          </div>
        )}

        {/* Success Stories Tab */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Success Stories
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Share your achievements and build credibility with prospects
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('categories')}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SafeIcon icon={FiSettings} className="h-5 w-5" />
                  <span>Manage Categories</span>
                </button>
                <button
                  onClick={() => setShowStoryForm(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="h-5 w-5" />
                  <span>Add Success Story</span>
                </button>
              </div>
            </div>

            <SuccessStoryList
              stories={state.successStories}
              categories={state.categories}
              onEdit={(story) => {
                setEditingStory(story)
                setShowStoryForm(true)
              }}
            />

            {showStoryForm && (
              <SuccessStoryForm
                story={editingStory}
                categories={state.categories}
                onClose={() => {
                  setShowStoryForm(false)
                  setEditingStory(null)
                }}
              />
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Category Management
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage categories that apply to both products/services and success stories.
                This helps organize your portfolio and makes it easier for prospects to understand your offerings.
              </p>
            </div>

            <CategoryManager
              categories={state.categories}
              onCategoriesUpdate={handleCategoriesUpdate}
            />

            {/* Usage Statistics */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Category Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Products & Services</h4>
                  <div className="space-y-1">
                    {state.categories.map(category => {
                      const count = state.products.filter(p => p.category === category.name).length
                      return (
                        <div key={category.id} className="flex justify-between text-sm text-blue-700">
                          <span>{category.name}</span>
                          <span>{count} items</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Success Stories</h4>
                  <div className="space-y-1">
                    {state.categories.map(category => {
                      const count = state.successStories.filter(s => s.category === category.name).length
                      return (
                        <div key={category.id} className="flex justify-between text-sm text-blue-700">
                          <span>{category.name}</span>
                          <span>{count} stories</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ProductManager