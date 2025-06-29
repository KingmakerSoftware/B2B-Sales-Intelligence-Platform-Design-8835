import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiPlus, FiBarChart3, FiFileText, FiGlobe } = FiIcons;

function QuickActions() {
  const actions = [
    {
      title: 'Search Prospects',
      description: 'Find new potential customers in your target market',
      icon: FiSearch,
      link: '/prospect-search',
      color: 'bg-blue-500'
    },
    {
      title: 'Analyze Company',
      description: 'Get contact data and insights for any company domain',
      icon: FiGlobe,
      link: '/company-analyzer',
      color: 'bg-purple-500'
    },
    {
      title: 'Add Product',
      description: 'Add new products or services to your portfolio',
      icon: FiPlus,
      link: '/products',
      color: 'bg-green-500'
    },
    {
      title: 'Generate Report',
      description: 'Create detailed sales intelligence reports',
      icon: FiFileText,
      link: '/',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              to={action.link}
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 ${action.color} rounded-lg`}>
                  <SafeIcon icon={action.icon} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;