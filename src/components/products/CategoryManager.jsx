import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiLoader, FiTag } = FiIcons

function CategoryManager({ categories, onCategoriesUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required')
      return
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
      setError('Category already exists')
      return
    }

    setLoading(true)
    try {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim(),
        created_at: new Date().toISOString()
      }
      
      await onCategoriesUpdate([...categories, newCategory])
      setNewCategoryName('')
      setShowAddForm(false)
      setError('')
    } catch (error) {
      setError('Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = async (categoryId, newName) => {
    if (!newName.trim()) {
      setError('Category name is required')
      return
    }

    if (categories.some(cat => cat.id !== categoryId && cat.name.toLowerCase() === newName.toLowerCase())) {
      setError('Category already exists')
      return
    }

    setLoading(true)
    try {
      const updatedCategories = categories.map(cat =>
        cat.id === categoryId ? { ...cat, name: newName.trim() } : cat
      )
      
      await onCategoriesUpdate(updatedCategories)
      setEditingCategory(null)
      setError('')
    } catch (error) {
      setError('Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId)
      await onCategoriesUpdate(updatedCategories)
      setError('')
    } catch (error) {
      setError('Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  const EditCategoryForm = ({ category, onSave, onCancel }) => {
    const [name, setName] = useState(category.name)

    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSave(category.id, name)
            } else if (e.key === 'Escape') {
              onCancel()
            }
          }}
          autoFocus
        />
        <button
          onClick={() => onSave(category.id, name)}
          disabled={loading}
          className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
        >
          <SafeIcon icon={FiSave} className="h-4 w-4" />
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="p-1 text-gray-600 hover:text-gray-700 disabled:opacity-50"
        >
          <SafeIcon icon={FiX} className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <SafeIcon icon={FiTag} className="h-5 w-5 text-primary-600" />
          <span>Manage Categories</span>
        </h3>
        
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Add Category Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter category name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory()
                  } else if (e.key === 'Escape') {
                    setShowAddForm(false)
                    setNewCategoryName('')
                    setError('')
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                disabled={loading || !newCategoryName.trim()}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <SafeIcon icon={FiLoader} className="h-4 w-4 animate-spin" />
                ) : (
                  <SafeIcon icon={FiSave} className="h-4 w-4" />
                )}
                <span>Add</span>
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewCategoryName('')
                  setError('')
                }}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiTag} className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No categories yet. Add your first category to get started.</p>
          </div>
        ) : (
          categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {editingCategory === category.id ? (
                <EditCategoryForm
                  category={category}
                  onSave={handleEditCategory}
                  onCancel={() => {
                    setEditingCategory(null)
                    setError('')
                  }}
                />
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiTag} className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-xs text-gray-500">
                      Created {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingCategory(category.id)}
                      disabled={loading}
                      className="p-1 text-gray-600 hover:text-primary-600 disabled:opacity-50 transition-colors"
                      title="Edit category"
                    >
                      <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={loading}
                      className="p-1 text-gray-600 hover:text-red-600 disabled:opacity-50 transition-colors"
                      title="Delete category"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Note:</strong> Categories are shared between Products & Services and Success Stories. 
          Deleting a category will not affect existing items, but the category won't be available for new items.
        </p>
      </div>
    </div>
  )
}

export default CategoryManager