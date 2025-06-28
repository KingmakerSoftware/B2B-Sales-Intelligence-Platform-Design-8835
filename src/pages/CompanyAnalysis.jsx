import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useApp } from '../context/AppContext';
import CompanyOverview from '../components/analysis/CompanyOverview';
import ContactList from '../components/analysis/ContactList';
import CompanyInsights from '../components/analysis/CompanyInsights';
import ProductAlignment from '../components/analysis/ProductAlignment';

const { FiFileText, FiArrowLeft } = FiIcons;

function CompanyAnalysis() {
  const { companyId } = useParams();
  const { state, dispatch } = useApp();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundCompany = state.companies.find(c => c.id === parseInt(companyId));
    if (foundCompany) {
      setCompany(foundCompany);
      dispatch({ type: 'SET_SELECTED_COMPANY', payload: foundCompany });
    }
    setLoading(false);
  }, [companyId, state.companies, dispatch]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <Link to="/prospect-search" className="text-primary-600 hover:text-primary-700">
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/prospect-search"
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {company.name}
              </h1>
              <p className="text-gray-600">
                Deep analysis and sales intelligence
              </p>
            </div>
          </div>

          <Link
            to={`/one-pager/${company.id}`}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiFileText} className="h-5 w-5" />
            <span>Generate One-Pager</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CompanyOverview company={company} />
            <CompanyInsights company={company} />
            <ProductAlignment company={company} />
          </div>

          <div className="space-y-8">
            <ContactList contacts={company.contacts} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CompanyAnalysis;