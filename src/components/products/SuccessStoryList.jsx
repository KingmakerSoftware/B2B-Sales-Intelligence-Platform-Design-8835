import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { useApp } from '../../context/AppContext'

const { FiEdit2, FiTrash2, FiAward, FiTag } = FiIcons

function SuccessStoryList({ stories, onEdit, categories }) {
  const { dispatch } = useApp()

  const handleDelete = (storyId) => {
    if (window.confirm('Are you sure you want to delete this success story?')) {
      dispatch({ type: 'DELETE_SUCCESS_STORY', payload: storyId })
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

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiAward} className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Success Stories Yet</h3>
        <p className="text-gray-500 mb-4">
          Add your first success story to showcase your achievements and build credibility.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <SafeIcon icon={FiAward} className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">{story.companyName}</h3>
                
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {story.industry}
                </span>
                
                {story.category && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(story.category)}`}>
                    <SafeIcon icon={FiTag} className="h-3 w-3 mr-1" />
                    {story.category}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Challenge</h4>
                  <p className="text-sm text-gray-600">{story.challenge}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Solution</h4>
                  <p className="text-sm text-gray-600">{story.solution}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Results</h4>
                  <p className="text-sm text-gray-600">{story.results}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {story.metrics.costSaving}%
                    </div>
                    <div className="text-xs text-gray-500">Cost Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {story.metrics.complianceScore}%
                    </div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {story.metrics.userSatisfaction}%
                    </div>
                    <div className="text-xs text-gray-500">Satisfaction</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(story)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit success story"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete success story"
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

export default SuccessStoryList