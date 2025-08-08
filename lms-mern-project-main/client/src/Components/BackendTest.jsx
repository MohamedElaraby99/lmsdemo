import React, { useState, useEffect } from 'react';

const BackendTest = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [pdfStatus, setPdfStatus] = useState('Checking...');

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:4000/api/test')
      .then(response => {
        if (response.ok) {
          setBackendStatus('✅ Backend is running');
        } else {
          setBackendStatus('❌ Backend responded with error');
        }
      })
      .catch(error => {
        setBackendStatus('❌ Backend is not running');
        console.error('Backend test failed:', error);
      });

    // Test PDF file access
    fetch('http://localhost:4000/uploads/pdfs/ex_level_1%20(1).pdf')
      .then(response => {
        if (response.ok) {
          setPdfStatus('✅ PDF file is accessible');
        } else {
          setPdfStatus(`❌ PDF file error: ${response.status}`);
        }
      })
      .catch(error => {
        setPdfStatus('❌ PDF file not accessible');
        console.error('PDF test failed:', error);
      });
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold mb-2">Backend Status</h3>
      <p className="text-sm mb-1">{backendStatus}</p>
      <p className="text-sm">{pdfStatus}</p>
    </div>
  );
};

export default BackendTest;
