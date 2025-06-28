import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiEdit2, FiTrash2, FiAward, FiTrendingUp } = FiIcons;

function SuccessStoryList({ stories, onEdit }) {
  return (
    <div className="space-y-4">
      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <SafeIcon icon={FiAward} className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">{story.companyName}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {story.industry}
                </span>
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
                    <div className="text-xs text-gray-500">Compliance</div>
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
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default SuccessStoryList;