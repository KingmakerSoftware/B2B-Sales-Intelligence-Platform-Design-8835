import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { useApp } from '../../context/AppContext'

const { FiX } = FiIcons

function SuccessStoryForm({ story, onClose, categories }) {
  const { dispatch } = useApp()
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    category: '',
    challenge: '',
    solution: '',
    results: '',
    metrics: {
      costSaving: 0,
      complianceScore: 0,
      userSatisfaction: 0
    }
  })

  useEffect(() => {
    if (story) {
      setFormData(story)
    }
  }, [story])

  const handleSubmit = (e) => {
    e.preventDefault()
    const storyData = {
      ...formData,
      id: story?.id || Date.now()
    }
    dispatch({ type: 'ADD_SUCCESS_STORY', payload: storyData })
    onClose()
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMetricChange = (metric, value) => {
    setFormData({
      ...formData,
      metrics: { ...formData.metrics, [metric]: parseInt(value) || 0 }
    })
  }

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 
    'Education', 'Real Estate', 'Renewable Energy', 'Consulting',
    'Media & Entertainment', 'Transportation', 'Government'
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {story ? 'Edit Success Story' : 'Add Success Story'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., TechFlow Industries"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-orange-600">
                No categories available. Please add categories first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challenge *
            </label>
            <textarea
              name="challenge"
              value={formData.challenge}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the main challenge or problem the client faced"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solution *
            </label>
            <textarea
              name="solution"
              value={formData.solution}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe how your product/service solved the problem"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Results *
            </label>
            <textarea
              name="results"
              value={formData.results}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the outcomes and benefits achieved"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Success Metrics
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Cost Savings (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.metrics.costSaving}
                  onChange={(e) => handleMetricChange('costSaving', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Efficiency Improvement (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.metrics.complianceScore}
                  onChange={(e) => handleMetricChange('complianceScore', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Client Satisfaction (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.metrics.userSatisfaction}
                  onChange={(e) => handleMetricChange('userSatisfaction', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {story ? 'Update Story' : 'Add Story'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default SuccessStoryForm