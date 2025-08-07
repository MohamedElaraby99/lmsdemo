import React from 'react';
import { FaTimes } from 'react-icons/fa';
import Layout from '../../Layout/Layout';

export default function ErrorState() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaTimes className="text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">لم يتم العثور على الدورة</p>
        </div>
      </div>
    </Layout>
  );
} 