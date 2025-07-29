import React, { useState, useEffect } from "react";
import { BsFacebook, BsLinkedin } from "react-icons/bs";
import { FaShieldAlt, FaUnlock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { disableProtection, enableProtection, isProtectionDisabled } from "../utils/deviceDetection";

export default function Footer() {
  const curDate = new Date();
  const year = curDate.getFullYear();
  
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  
  useEffect(() => {
    // Check initial protection status
    setProtectionEnabled(!isProtectionDisabled());
  }, []);
  
  const handleProtectionToggle = () => {
    if (protectionEnabled) {
      // Disable protection
      disableProtection();
      setProtectionEnabled(false);
    } else {
      // Enable protection
      enableProtection();
      setProtectionEnabled(true);
    }
  };
  return (
    <footer className="py-12 md:px-16 px-3 bg-slate-100 dark:bg-gray-900">
      <div className="flex md:flex-row flex-col md:justify-between justify-center items-center gap-4 mb-8">
        <span className="md:text-xl text-lg font-[600] text-gray-700 dark:text-white">
          حقوق النشر {year} | جميع الحقوق محفوظة
        </span>
        <div className="flex gap-5 items-center">
          {/* Protection Toggle Button */}
          <button
            onClick={handleProtectionToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              protectionEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
            }`}
            title={protectionEnabled ? "انقر لتعطيل الحماية" : "انقر لتفعيل الحماية"}
          >
            {protectionEnabled ? (
              <>
                <FaShieldAlt className="text-green-600 dark:text-green-400" />
                <span className="hidden sm:inline">الحماية مفعلة</span>
              </>
            ) : (
              <>
                <FaUnlock className="text-red-600 dark:text-red-400" />
                <span className="hidden sm:inline">الحماية معطلة</span>
              </>
            )}
          </button>
          
          <a
            href="https://www.facebook.com/people/Fikra-Software-%D9%81%D9%83%D8%B1%D8%A9/61572824761047/"
            target="_blank"
            rel="noopener noreferrer"
            className="md:text-3xl text-xl text-gray-900 dark:text-slate-50 hover:text-gray-500 dark:hover:text-slate-300 transition-colors"
          >
            <BsFacebook />
          </a>
          <a
            href="https://www.linkedin.com/company/fikra-software-%D9%81%D9%83%D8%B1%D8%A9-%D9%84%D9%84%D8%A8%D8%B1%D9%85%D8%AC%D9%8A%D8%A7%D8%AA/"
            target="_blank"
            rel="noopener noreferrer"
            className="md:text-3xl text-xl text-gray-900 dark:text-slate-50 hover:text-gray-500 dark:hover:text-slate-300 transition-colors"
          >
            <BsLinkedin />
          </a>
        </div>
      </div>
      
      {/* Legal Links */}
      <div className="flex justify-center items-center mb-6">
        <div className="flex gap-6 text-sm">
          <Link 
            to="/terms" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 font-medium"
          >
            شروط الخدمة
          </Link>
          <span className="text-gray-400 dark:text-gray-600">|</span>
          <Link 
            to="/privacy" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 font-medium"
          >
            سياسة الخصوصية
          </Link>
        </div>
      </div>
      
      {/* Powered by Fikra Software */}
      <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            مدعوم بواسطة
          </span>
          <a 
            href="https://fikra.solutions/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity duration-300"
          >
            <svg 
              className="mx-auto opacity-80 hover:opacity-100 transition-opacity duration-300" 
              width="55" 
              height="60" 
              viewBox="0 0 226 314" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_2311_2)">
                <path d="M222.67 242.4C222.12 242.34 217.25 235.37 215.69 233.82C202.05 220.28 177.14 219.92 159.86 225.41C149.37 228.74 140.73 233.2 136.92 244.19C147.26 244.32 158.57 241.07 168.89 241.88C170.36 242 176.59 243.02 176.49 244.82C176.47 245.16 172.12 245.53 169.99 246.96C160.84 253.09 160.13 266.77 156.21 276.38C147.17 298.52 136.12 302.03 113.78 302.57C111.49 302.63 96.8599 302.97 96.2899 302.3C95.4699 301.33 105.6 282.56 106.87 279.27C110.3 270.4 113.17 259.84 114.94 250.53C112.4 253.15 108.03 251.89 105.92 254.92C100.98 280.78 88.8799 319.26 55.4199 313.23C59.6299 308.26 64.4799 304.38 68.5899 299.24C73.7799 292.74 77.8799 284.83 81.2199 277.26L86.1799 261.54C83.6099 263.47 74.7199 266.14 73.2599 268.07C71.3199 270.63 70.6899 280.54 68.3299 284.18C63.4899 291.67 57.0699 289.94 49.8599 291.84C41.5899 294.01 32.5299 298.36 24.0199 299.07C18.3099 299.55 10.4399 297.61 4.65991 296.77C6.55991 295.07 8.87991 295.84 11.1599 294.52C18.3399 290.36 22.3599 275.68 24.8699 267.7C25.9099 264.39 26.1099 259.75 27.2999 256.28C36.5199 233.8 62.3199 241.46 81.3999 240.56C79.2899 249.02 75.2199 257.36 74.8199 266.12C77.7099 263.09 85.0099 261.91 87.0099 258.76C88.2399 252.27 90.6799 244.71 90.7499 238.21C90.7699 236.8 88.8999 235.79 91.1799 235.06C93.6999 234.26 103.82 234.26 107.17 234.22C108.61 234.2 112.61 232.4 111.05 235.63C108.82 240.26 108.06 247.06 107.23 252.17C109.07 250.29 114.82 250.96 116.07 249.41C116.73 248.59 116.56 246.56 117.24 245.34C121.22 238.21 125.47 233.69 132.33 229.06C125.11 228.24 117.27 230.38 109.99 231.07C87.1799 233.24 48.0499 236.21 29.2499 221.53C19.1099 213.61 13.8199 203.83 10.0299 191.77C9.60991 190.42 8.14991 187.26 9.35991 186.28C29.9799 222.47 73.5699 216.94 108.63 213.22C141.34 209.75 186.72 195.54 212.78 222.49C215.14 224.93 224.08 235.67 225.05 238.07C225.77 239.86 223.68 242.51 222.68 242.4H222.67ZM119.18 295.24C128.23 297.31 131.67 286.59 134.35 279.8C136.47 274.43 137.36 267.96 139.28 262.82C141.43 257.06 144.77 251.66 147.54 246.21C144.73 245.69 138.4 246.1 136.73 248.29C131.14 263.96 127.48 280.74 119.17 295.25L119.18 295.24ZM33.5999 291.63C36.5599 292.91 47.6599 288.15 48.8899 286.28C49.8699 281.26 61.2099 247.4 59.9399 245.71C59.1699 244.68 56.6699 246.16 55.6599 246.83C40.7299 256.79 48.3699 280.95 33.5999 291.62V291.63Z" fill="#113352" className="dark:fill-gray-300"></path>
                <path d="M7.81982 252.68C13.8098 250.4 10.4198 237.81 11.9098 235.99C12.7098 235.01 25.4498 233.78 26.1498 234.3C28.1998 235.81 26.7898 247.54 24.3498 249.97C21.3798 252.93 11.8498 253.85 7.81982 252.68Z" fill="#1B98C3" className="dark:fill-blue-400"></path>
                <path d="M19.3199 255.58C13.3299 257.86 16.7199 270.45 15.2299 272.27C14.4299 273.25 1.68989 274.48 0.989891 273.96C-1.06011 272.45 0.349891 260.72 2.78989 258.29C5.75989 255.33 15.2899 254.41 19.3199 255.58Z" fill="#1B98C3" className="dark:fill-blue-400"></path>
                <path d="M183.28 258.91L186.13 252.14C187.14 249.94 185.52 240.72 186.74 239.78C187.34 239.32 201.32 238.25 201.77 238.85C202.12 239.31 201.84 249.22 201.41 250.49C198.56 259 189.51 256.08 183.28 258.91Z" fill="#1B98C3" className="dark:fill-blue-400"></path>
                <path d="M18.0701 94.52C18.0701 42.32 60.3901 0 112.59 0C164.79 0 207.11 42.32 207.11 94.52C207.11 124.4 193.24 151.04 171.59 168.37C188.53 152.57 199.13 130.05 199.13 105.06C199.13 57.26 160.38 18.52 112.59 18.52C64.8001 18.52 26.0501 57.26 26.0501 105.06C26.0501 130.05 36.6501 152.57 53.5901 168.37C31.9401 151.05 18.0701 124.41 18.0701 94.52Z" fill="#113352" className="dark:fill-gray-300"></path>
                <path d="M84.82 211.68V202.96C84.82 201.56 85.96 200.43 87.35 200.43H92.97V191.42L64.43 162.93C62.32 160.83 61.14 157.98 61.14 155V144.77L59.97 144.42C53.08 142.36 48.63 135.8 49.37 128.44C50.06 121.6 55.57 115.98 62.39 115.12C71.53 113.98 79.34 121.11 79.34 130.03C79.34 136.72 75.05 142.5 68.67 144.42L67.5 144.77V153.76C67.5 155.84 68.33 157.84 69.8 159.31L99.33 188.78V200.43H109.4V138.71C109.4 136.59 108.56 134.57 107.06 133.07L92.29 118.32V60.96L91.12 60.61C84.23 58.55 79.78 51.98 80.52 44.62C81.21 37.78 86.73 32.16 93.55 31.31C102.69 30.18 110.49 37.3 110.49 46.22C110.49 52.91 106.2 58.69 99.82 60.61L98.65 60.96V115.68L113.32 130.32C114.89 131.88 115.77 134 115.77 136.22V167.74L126.51 157.02V102.3L125.34 101.95C118.45 99.88 114.01 93.32 114.75 85.96C115.44 79.12 120.96 73.5 127.78 72.66C136.91 71.53 144.72 78.65 144.72 87.57C144.72 94.27 140.43 100.05 134.05 101.96L132.88 102.31V159.67L115.77 176.75V200.45H125.84V188.8L157.67 157.03V144.79L156.5 144.44C149.61 142.38 145.17 135.81 145.91 128.45C146.6 121.61 152.12 115.99 158.94 115.14C168.08 114 175.88 121.13 175.88 130.05C175.88 136.74 171.59 142.53 165.2 144.44L164.03 144.79V159.67L132.2 191.44V200.45H137.14C138.91 200.45 140.35 201.89 140.35 203.66V206.71C121.42 209.21 102.32 211.17 84.8 211.7L84.82 211.68ZM67.02 120.46C59.48 118.46 52.75 125.18 54.76 132.72C55.64 136.03 58.32 138.71 61.63 139.59C69.17 141.59 75.89 134.87 73.89 127.33C73.01 124.02 70.33 121.34 67.02 120.46ZM132.42 77.99C124.87 75.98 118.14 82.71 120.15 90.26C121.03 93.57 123.71 96.25 127.02 97.12C134.56 99.12 141.28 92.4 139.28 84.86C138.4 81.55 135.73 78.87 132.42 77.99Z" fill="#1B98C3" className="dark:fill-blue-400"></path>
              </g>
              <defs>
                <clipPath id="clip0_2311_2">
                  <rect width="225.18" height="313.86" fill="white"></rect>
                </clipPath>
              </defs>
            </svg>
          </a>
        </div>
        <span className="oi-regular text-xs text-gray-500 dark:text-gray-400">
          Fikra Software - فكرة للبرمجيات
        </span>
      </div>
    </footer>
  );
}
