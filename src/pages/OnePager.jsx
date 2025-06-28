import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useApp } from '../context/AppContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { FiDownload, FiArrowLeft, FiShare2, FiPrint } = FiIcons;

function OnePager() {
  const { companyId } = useParams();
  const { state } = useApp();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef();

  useEffect(() => {
    const foundCompany = state.companies.find(c => c.id === parseInt(companyId));
    if (foundCompany) {
      setCompany(foundCompany);
    }
    setLoading(false);
  }, [companyId, state.companies]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${company.name}-sales-onepager.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading || !company) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const relevantProduct = state.products.find(p => 
    p.targetIndustries.includes(company.industry)
  ) || state.products[0];

  const relevantStory = state.successStories.find(s => 
    s.industry === company.industry
  ) || state.successStories[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to={`/company-analysis/${company.id}`}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon={FiArrowLeft} className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sales One-Pager
              </h1>
              <p className="text-gray-600">
                {company.name}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <SafeIcon icon={FiDownload} className="h-5 w-5" />
              <span>Download PDF</span>
            </button>
            <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <SafeIcon icon={FiShare2} className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div 
          ref={contentRef}
          className="bg-white rounded-lg shadow-lg p-8 space-y-8"
          style={{ minHeight: '1056px' }} // A4 aspect ratio
        >
          {/* Header */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {company.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {company.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Industry:</span>
                    <span className="ml-2 text-gray-600">{company.industry}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{company.location}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Employees:</span>
                    <span className="ml-2 text-gray-600">{company.employees}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Revenue:</span>
                    <span className="ml-2 text-gray-600">{company.revenue}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">
                  Prepared by: {state.user.name}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Key Contacts */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Key Decision Makers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.contacts.map((contact, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{contact.title}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>{contact.email}</div>
                    <div>{contact.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Mission & Values */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mission & Values</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Mission</h3>
              <p className="text-gray-700">{company.mission}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Core Values</h3>
              <div className="flex flex-wrap gap-2">
                {company.values.map((value, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Product Alignment */}
          {relevantProduct && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Solution Alignment</h2>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {relevantProduct.name}
                </h3>
                <p className="text-gray-700 mb-4">{relevantProduct.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {relevantProduct.keyFeatures.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Value Proposition</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>✓ Aligns with {company.name}'s focus on {company.values[0]?.toLowerCase()}</p>
                      <p>✓ Supports {company.industry} industry requirements</p>
                      <p>✓ Scalable for {company.employees} employee range</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Story */}
          {relevantStory && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Relevant Success Story</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {relevantStory.companyName}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{relevantStory.industry} Industry</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Challenge</h4>
                    <p className="text-sm text-gray-700">{relevantStory.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Solution</h4>
                    <p className="text-sm text-gray-700">{relevantStory.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Results</h4>
                    <p className="text-sm text-gray-700">{relevantStory.results}</p>
                  </div>
                </div>

                <div className="flex space-x-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {relevantStory.metrics.costSaving}%
                    </div>
                    <div className="text-xs text-gray-600">Cost Savings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {relevantStory.metrics.complianceScore}%
                    </div>
                    <div className="text-xs text-gray-600">Compliance</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {relevantStory.metrics.userSatisfaction}%
                    </div>
                    <div className="text-xs text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Next Steps</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <h3 className="font-medium text-gray-900">Discovery Call</h3>
                  <p className="text-sm text-gray-600">Schedule initial conversation with {company.contacts[0]?.name}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <h3 className="font-medium text-gray-900">Needs Assessment</h3>
                  <p className="text-sm text-gray-600">Understand specific challenges and requirements</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <h3 className="font-medium text-gray-900">Proposal & Demo</h3>
                  <p className="text-sm text-gray-600">Present tailored solution with live demonstration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
            <p>
              Prepared by {state.user.name} | {state.user.company} | {state.user.email}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default OnePager;