import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTarget, FiSearch, FiBarChart3, FiPackage, FiFileText } = FiIcons;

function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiBarChart3 },
    { path: '/prospect-search', label: 'Prospect Search', icon: FiSearch },
    { path: '/products', label: 'Products & Stories', icon: FiPackage },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <SafeIcon icon={FiTarget} className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SalesIntel Pro</span>
          </Link>

          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative group"
              >
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-primary-50">
                  <SafeIcon 
                    icon={item.icon} 
                    className={`h-5 w-5 ${
                      location.pathname === item.path 
                        ? 'text-primary-600' 
                        : 'text-gray-600 group-hover:text-primary-600'
                    }`} 
                  />
                  <span className={`font-medium ${
                    location.pathname === item.path 
                      ? 'text-primary-600' 
                      : 'text-gray-600 group-hover:text-primary-600'
                  }`}>
                    {item.label}
                  </span>
                </div>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;