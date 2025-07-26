import React, { useEffect } from 'react';
import { isDesktop, preventMobileInspection, getDeviceType } from '../utils/deviceDetection';

const DeviceProtection = ({ children }) => {
  useEffect(() => {
    // Only apply protection on desktop
    if (isDesktop()) {
      preventMobileInspection();
      
      // Additional protection for specific elements
      const protectElements = () => {
        // Disable text selection on sensitive content
        const sensitiveElements = document.querySelectorAll('.no-select');
        sensitiveElements.forEach(element => {
          element.style.userSelect = 'none';
          element.style.webkitUserSelect = 'none';
          element.style.mozUserSelect = 'none';
          element.style.msUserSelect = 'none';
        });
      };
      
      protectElements();
      
      // Re-apply protection when DOM changes
      const observer = new MutationObserver(protectElements);
      observer.observe(document.body, { childList: true, subtree: true });
      
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return <>{children}</>;
};

export default DeviceProtection; 