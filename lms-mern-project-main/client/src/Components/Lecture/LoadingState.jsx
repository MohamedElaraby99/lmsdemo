import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import Layout from '../../Layout/Layout';

export default function LoadingState() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    </Layout>
  );
} 