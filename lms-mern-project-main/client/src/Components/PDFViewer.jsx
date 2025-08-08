import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaExpand, FaCompress, FaSearchPlus, FaSearchMinus, FaUndo, FaPrint } from 'react-icons/fa';

const PDFViewer = ({ 
  pdfUrl, 
  title = "PDF Document", 
  isOpen, 
  onClose 
}) => {
  console.log('PDFViewer rendered with icons:', { FaSearchPlus, FaSearchMinus, FaUndo });
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen, pdfUrl]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const container = document.getElementById('pdf-container');
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
          await container.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen toggle failed:', error);
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-iframe');
    if (iframe) {
      iframe.contentWindow.print();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getCleanPdfUrl(pdfUrl);
    link.download = title || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean and encode PDF URL
  const getCleanPdfUrl = (url) => {
    if (!url) return '';
    
    try {
      // If the URL is already encoded, return as is
      if (url.includes('%')) {
        return url;
      }
      
      // Split the URL into base and filename
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Encode the filename
      const encodedFilename = encodeURIComponent(filename);
      
      // Reconstruct the URL with encoded filename
      urlParts[urlParts.length - 1] = encodedFilename;
      const encodedUrl = urlParts.join('/');
      
      console.log('Original URL:', url);
      console.log('Encoded URL:', encodedUrl);
      
      return encodedUrl;
    } catch (error) {
      console.error('Error encoding PDF URL:', error);
      return url;
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError(`Failed to load PDF from: ${pdfUrl}. Please check if the file exists or try downloading it instead.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Main Container */}
      <div 
        id="pdf-container"
        className={`relative bg-white rounded-lg shadow-2xl ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-11/12 h-5/6 max-w-7xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500">PDF Document</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Zoom Out"
              >
                <FaSearchMinus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Zoom In"
              >
                <FaSearchPlus className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Reset Zoom"
              >
                                 <FaUndo className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Print"
            >
              <FaPrint className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <FaDownload className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <FaCompress className="w-4 h-4 text-gray-600" />
              ) : (
                <FaExpand className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Close"
            >
              <FaTimes className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="relative flex-1 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

                     {error && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
               <div className="text-center max-w-md mx-auto p-6">
                 <div className="text-red-500 text-6xl mb-4">📄</div>
                 <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Loading Error</h3>
                 <p className="text-gray-600 mb-4">{error}</p>
                                   <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
                    <p className="font-medium">Debug Info:</p>
                    <p>URL: {pdfUrl}</p>
                    <p>Encoded URL: {getCleanPdfUrl(pdfUrl)}</p>
                    <p>Backend Status: {pdfUrl.includes('localhost:4000') ? '✅ Backend URL' : '❌ Not backend URL'}</p>
                    <p>Expected Backend URL: http://localhost:4000/uploads/pdfs/ex_level_1%20(1).pdf</p>
                  </div>
                 <div className="flex gap-2 justify-center">
                   <button
                     onClick={() => window.location.reload()}
                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                   >
                     Retry
                   </button>
                   <button
                     onClick={handleDownload}
                     className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                   >
                     Download Instead
                   </button>
                                       <button
                      onClick={() => window.open(getCleanPdfUrl(pdfUrl), '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Open in New Tab
                    </button>
                    <button
                      onClick={() => window.open('http://localhost:4000/uploads/pdfs/ex_level_1%20(1).pdf', '_blank')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Test Backend URL
                    </button>
                 </div>
               </div>
             </div>
           )}

                     {/* PDF Iframe */}
           <iframe
             id="pdf-iframe"
             src={`${getCleanPdfUrl(pdfUrl)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
             className="w-full h-full border-0"
             style={{ 
               transform: `scale(${zoom / 100})`,
               transformOrigin: 'top left',
               width: `${100 / (zoom / 100)}%`,
               height: `${100 / (zoom / 100)}%`
             }}
             onLoad={handleIframeLoad}
             onError={handleIframeError}
             title={title}
           />
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Zoom: {zoom}%</span>
              <span>•</span>
              <span>PDF Viewer</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Use mouse wheel to scroll</span>
              <span>•</span>
              <span>Ctrl + scroll to zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
