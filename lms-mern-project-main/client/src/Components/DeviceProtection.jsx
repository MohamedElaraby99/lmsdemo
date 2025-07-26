import React, { useEffect, useState } from 'react';
import { isDesktop, preventMobileInspection, getDeviceType, isProtectionDisabled } from '../utils/deviceDetection';

const DeviceProtection = ({ children }) => {
  const [protectionState, setProtectionState] = useState(!isProtectionDisabled());

  useEffect(() => {
    // Only apply protection on desktop
    if (isDesktop()) {
      // Check protection status periodically
      const checkProtection = () => {
        const currentState = !isProtectionDisabled();
        if (currentState !== protectionState) {
          setProtectionState(currentState);
        }
      };

      // Initial check
      checkProtection();

      // Set up interval to check protection status
      const interval = setInterval(checkProtection, 1000);

      // Apply protection if enabled
      if (!isProtectionDisabled()) {
        preventMobileInspection();
      }
      
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
        clearInterval(interval);
      };
    }
  }, [protectionState]);

  return <>{children}</>;
};

export default DeviceProtection; 