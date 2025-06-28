import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTrendingUp, FiAlertCircle, FiTarget } = FiIcons;

function CompanyInsights({ company }) {
  const insights = [
    {
      type: 'opportunity',
      title: 'Cloud Migration Trend',
      description: 'Company shows strong interest in cloud technologies based on recent job postings and news.',
      icon: FiTrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      type: 'challenge',
      title: 'Security Compliance',
      description: 'Industry regulations require enhanced data security measures.',
      icon: FiAlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      type: 'alignment',
      title: 'Value Alignment',
      description: 'Company values of innovation and efficiency align well with our solution.',
      icon: FiTarget,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Insights</h2>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${insight.bgColor}`}
          >
            <div className="flex items-start space-x-3">
              <SafeIcon 
                icon={insight.icon} 
                className={`h-5 w-5 ${insight.color} mt-0.5`} 
              />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-700">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3">Recent Company News</h3>
        <div className="space-y-2">
          {company.recentNews.map((news, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <span className="text-sm text-gray-700">{news}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default CompanyInsights;