import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SearchForm from '../components/search/SearchForm';
import SearchResults from '../components/search/SearchResults';
import SearchFilters from '../components/search/SearchFilters';
import { useApp } from '../context/AppContext';

function ProspectSearch() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    companySize: '',
    revenue: '',
    location: ''
  });

  const handleSearch = async (searchParams) => {
    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockCompanies = [
        {
          id: 1,
          name: 'TechFlow Industries',
          industry: 'Technology',
          location: 'San Francisco, CA',
          employees: '500-1000',
          revenue: '$50M-100M',
          website: 'https://techflow.com',
          description: 'Leading provider of enterprise software solutions',
          founded: 2015,
          contacts: [
            {
              name: 'Sarah Johnson',
              title: 'Chief Technology Officer',
              email: 'sarah.johnson@techflow.com',
              linkedin: 'linkedin.com/in/sarahjohnson',
              phone: '+1 (555) 123-4567'
            },
            {
              name: 'Michael Chen',
              title: 'VP of Operations',
              email: 'michael.chen@techflow.com',
              linkedin: 'linkedin.com/in/michaelchen',
              phone: '+1 (555) 123-4568'
            }
          ],
          mission: 'Empowering businesses through innovative technology solutions',
          values: ['Innovation', 'Customer Success', 'Integrity', 'Collaboration'],
          recentNews: [
            'Expanded to European markets',
            'Launched new AI-powered analytics platform',
            'Raised $25M Series B funding'
          ]
        },
        {
          id: 2,
          name: 'GreenEnergy Corp',
          industry: 'Renewable Energy',
          location: 'Austin, TX',
          employees: '200-500',
          revenue: '$25M-50M',
          website: 'https://greenenergy.com',
          description: 'Sustainable energy solutions for commercial enterprises',
          founded: 2018,
          contacts: [
            {
              name: 'David Martinez',
              title: 'CEO',
              email: 'david.martinez@greenenergy.com',
              linkedin: 'linkedin.com/in/davidmartinez',
              phone: '+1 (555) 234-5678'
            }
          ],
          mission: 'Creating a sustainable future through clean energy innovation',
          values: ['Sustainability', 'Innovation', 'Community Impact'],
          recentNews: [
            'Signed partnership with major utility company',
            'Opened new manufacturing facility',
            'Won Clean Energy Innovation Award'
          ]
        }
      ];

      dispatch({ type: 'SET_COMPANIES', payload: mockCompanies });
      dispatch({ 
        type: 'ADD_SEARCH_HISTORY', 
        payload: { 
          ...searchParams, 
          timestamp: new Date().toISOString(),
          results: mockCompanies.length 
        } 
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prospect Search
          </h1>
          <p className="text-gray-600">
            Find and analyze potential customers in your target market.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilters filters={filters} setFilters={setFilters} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <SearchForm onSearch={handleSearch} loading={loading} />
            <SearchResults companies={state.companies} loading={loading} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProspectSearch;