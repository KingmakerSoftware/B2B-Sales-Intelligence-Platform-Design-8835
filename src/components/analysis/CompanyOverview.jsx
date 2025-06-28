import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiGlobe, FiCalendar, FiUsers, FiDollarSign } = FiIcons;

function CompanyOverview({ company }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Overview</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700">{company.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiGlobe} className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">Website</span>
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary-600 hover:text-primary-700"
                >
                  {company.website}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiCalendar} className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">Founded</span>
                <div className="text-gray-900">{company.founded}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiUsers} className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">Employees</span>
                <div className="text-gray-900">{company.employees}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiDollarSign} className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700">Revenue</span>
                <div className="text-gray-900">{company.revenue}</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Mission Statement</h3>
          <div className="bg-primary-50 border-l-4 border-primary-400 p-4">
            <p className="text-gray-700 italic">"{company.mission}"</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Core Values</h3>
          <div className="flex flex-wrap gap-2">
            {company.values.map((value, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CompanyOverview;