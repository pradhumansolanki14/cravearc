import React from 'react';
import { FiShield } from 'react-icons/fi';

/**
 * Reusable BrandLogo component for the Admin dashboard panel.
 * Cohesive logo styling across the entire platform.
 */
const BrandLogo = ({ size = 20, className = "" }) => {
  return (
    <div 
      className={`rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-emerald-sm transition-all duration-300 ${className}`}
      style={{ width: size * 2.2, height: size * 2.2 }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-white"
      >
        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>
  );
};

export default BrandLogo;
