import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiPhone, FiLinkedin, FiUser } = FiIcons;

function ContactList({ contacts }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Contacts</h2>
      
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <SafeIcon icon={FiUser} className="h-5 w-5 text-primary-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{contact.title}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiMail} className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {contact.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiPhone} className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {contact.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiLinkedin} className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`https://${contact.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default ContactList;