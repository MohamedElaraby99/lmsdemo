import React, { useState } from 'react';

const BackendTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testPdfConverter = async () => {
    setLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test if the PDF file exists
      const testResponse = await fetch('http://localhost:4000/api/v1/pdf-converter/test/ex_level_1%20(1).pdf', {
        credentials: 'include'
      });
      
      const testData = await testResponse.json();
      console.log('Test response:', testData);
      
      if (testData.success) {
        setTestResult('✅ PDF file found! Path: ' + testData.path);
        
        // Now test the conversion API
        const convertResponse = await fetch('http://localhost:4000/api/v1/pdf-converter/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            pdfUrl: 'http://localhost:4000/uploads/pdfs/ex_level_1%20(1).pdf'
          })
        });
        
        const convertData = await convertResponse.json();
        console.log('Convert response:', convertData);
        
        if (convertData.success) {
          setTestResult(prev => prev + '\n✅ Conversion successful! Pages: ' + convertData.data.length);
        } else {
          setTestResult(prev => prev + '\n❌ Conversion failed: ' + convertData.message);
        }
      } else {
        setTestResult('❌ PDF file not found: ' + testData.message);
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult('❌ Test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
    
    </div>
  );
};

export default BackendTest;
