// Device detection and mobile inspection prevention utility

// Detect if user is on desktop
export const isDesktop = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'blackberry', 'windows phone'];
  
  // Check if it's a mobile device
  const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Check screen size (desktop typically has larger screens)
  const isLargeScreen = window.innerWidth > 768 && window.innerHeight > 600;
  
  // Check if it's a desktop browser
  const isDesktopBrowser = !isMobile && isLargeScreen;
  
  return isDesktopBrowser;
};

// Detect if user is on mobile
export const isMobile = () => {
  return !isDesktop();
};

// Prevent mobile inspection on desktop
export const preventMobileInspection = () => {
  if (isDesktop()) {
    // TEMPORARY: Check if protection is disabled via localStorage
    const protectionDisabled = localStorage.getItem('disableProtection') === 'true';
    
    if (protectionDisabled) {
      console.log('Device protection is temporarily disabled');
      return;
    }
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
    
    // Disable F12 key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        return false;
      }
    });
    
    // Disable Ctrl+Shift+C (inspect element)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
    });
    
    // Disable Ctrl+U (view source)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    });
    
    // Disable Ctrl+Shift+J (console)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
    });
    
    // Disable Ctrl+Shift+K (console in Firefox)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        return false;
      }
    });
    
    console.log('Mobile inspection prevention enabled for desktop');
  }
};

// Initialize device detection and prevention
export const initializeDeviceProtection = () => {
  // Only apply protection on desktop
  if (isDesktop()) {
    preventMobileInspection();
    
    // Additional protection: disable console
    const disableConsole = () => {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
      console.debug = () => {};
    };
    
    // Uncomment the line below if you want to completely disable console
    // disableConsole();
  }
};

// Get device type for conditional rendering
export const getDeviceType = () => {
  return isDesktop() ? 'desktop' : 'mobile';
};

// Check if we should show mobile-specific features
export const shouldShowMobileFeatures = () => {
  return isMobile();
};

// Check if we should show desktop-specific features
export const shouldShowDesktopFeatures = () => {
  return isDesktop();
};

// Temporarily disable protection for debugging
export const disableProtection = () => {
  localStorage.setItem('disableProtection', 'true');
  console.log('🔓 Device protection DISABLED - You can now use F12 and inspect tools');
  console.log('To re-enable protection, call enableProtection()');
};

// Re-enable protection
export const enableProtection = () => {
  localStorage.removeItem('disableProtection');
  console.log('🔒 Device protection ENABLED');
  // Note: Protection will be applied on next page load or component re-render
};

// Check if protection is currently disabled
export const isProtectionDisabled = () => {
  return localStorage.getItem('disableProtection') === 'true';
}; 