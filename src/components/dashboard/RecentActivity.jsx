import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiFileText, FiUser, FiTrendingUp } = FiIcons;

function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'search',
      description: 'Searched for Technology companies in San Francisco',
      timestamp: '2 hours ago',
      icon: FiSearch,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'analysis',
      description: 'Generated one-pager for TechFlow Industries',
      timestamp: '4 hours ago',
      icon: FiFileText,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'contact',
      description: 'Added new contact: Sarah Johnson (CTO)',
      timestamp: '1 day ago',
      icon: FiUser,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'insight',
      description: 'Identified trend: Cloud migration increasing',
      timestamp: '2 days ago',
      icon: FiTrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <div className="flex-shrink-0">
              <SafeIcon 
                icon={activity.icon} 
                className={`h-5 w-5 ${activity.color}`} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;