import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import ProspectSearch from './pages/ProspectSearch';
import CompanyAnalysis from './pages/CompanyAnalysis';
import ProductManager from './pages/ProductManager';
import OnePager from './pages/OnePager';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
          <Navbar />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="pt-16"
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prospect-search" element={<ProspectSearch />} />
              <Route path="/company-analysis/:companyId" element={<CompanyAnalysis />} />
              <Route path="/products" element={<ProductManager />} />
              <Route path="/one-pager/:companyId" element={<OnePager />} />
            </Routes>
          </motion.main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;