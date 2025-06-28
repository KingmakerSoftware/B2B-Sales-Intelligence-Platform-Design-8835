import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useApp } from '../../context/AppContext';

const { FiPackage, FiCheck, FiStar } = FiIcons;

function ProductAlignment({ company }) {
  const { state } = useApp();

  const getAlignmentScore = (product) => {
    let score = 0;
    if (product.targetIndustries.includes(company.industry)) score += 40;
    if (company.values.some(value => 
      product.keyFeatures.some(feature => 
        feature.toLowerCase().includes(value.toLowerCase())
      )
    )) score += 30;
    score += Math.random() * 30; // Simulated additional scoring
    return Math.min(100, Math.round(score));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Alignment</h2>
      
      <div className="space-y-4">
        {state.products.map((product, index) => {
          const alignmentScore = getAlignmentScore(product);
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiPackage} className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiStar} className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {alignmentScore}% match
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{product.description}</p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Why it's a good fit:</h4>
                <div className="space-y-1">
                  {product.targetIndustries.includes(company.industry) && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <SafeIcon icon={FiCheck} className="h-4 w-4" />
                      <span>Targets {company.industry} industry</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <SafeIcon icon={FiCheck} className="h-4 w-4" />
                    <span>Aligns with company's focus on {company.values[0]?.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <SafeIcon icon={FiCheck} className="h-4 w-4" />
                    <span>Scalable for {company.employees} employee range</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Pricing:</span>
                  <span className="font-medium text-gray-900">{product.pricing}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default ProductAlignment;