import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useApp } from '../context/AppContext';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import SuccessStoryList from '../components/products/SuccessStoryList';
import SuccessStoryForm from '../components/products/SuccessStoryForm';

const { FiPlus } = FiIcons;

function ProductManager() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStory, setEditingStory] = useState(null);

  const tabs = [
    { id: 'products', label: 'Products & Services' },
    { id: 'stories', label: 'Success Stories' }
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
            Products & Success Stories
          </h1>
          <p className="text-gray-600">
            Manage your product portfolio and showcase success stories for better sales alignment.
          </p>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Products & Services
              </h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            </div>

            <ProductList
              products={state.products}
              onEdit={(product) => {
                setEditingProduct(product);
                setShowProductForm(true);
              }}
            />

            {showProductForm && (
              <ProductForm
                product={editingProduct}
                onClose={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Success Stories
              </h2>
              <button
                onClick={() => setShowStoryForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="h-5 w-5" />
                <span>Add Success Story</span>
              </button>
            </div>

            <SuccessStoryList
              stories={state.successStories}
              onEdit={(story) => {
                setEditingStory(story);
                setShowStoryForm(true);
              }}
            />

            {showStoryForm && (
              <SuccessStoryForm
                story={editingStory}
                onClose={() => {
                  setShowStoryForm(false);
                  setEditingStory(null);
                }}
              />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ProductManager;