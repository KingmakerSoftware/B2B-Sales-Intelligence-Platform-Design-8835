import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';

const { FiUsers, FiTarget, FiTrendingUp, FiDollarSign } = FiIcons;

function Dashboard() {
  const { state } = useApp();

  const stats = [
    {
      title: 'Total Prospects',
      value: state.companies.length,
      icon: FiUsers,
      change: '+12%',
      positive: true
    },
    {
      title: 'Active Campaigns',
      value: 8,
      icon: FiTarget,
      change: '+5%',
      positive: true
    },
    {
      title: 'Conversion Rate',
      value: '24.5%',
      icon: FiTrendingUp,
      change: '+3.2%',
      positive: true
    },
    {
      title: 'Revenue Pipeline',
      value: '$450K',
      icon: FiDollarSign,
      change: '+18%',
      positive: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {state.user.name}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your sales intelligence today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <QuickActions />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <RecentActivity />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;