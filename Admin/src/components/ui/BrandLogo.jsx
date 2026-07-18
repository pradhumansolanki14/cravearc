import React from 'react';
import { FiShield } from 'react-icons/fi';

/**
 * Reusable BrandLogo component for the Admin dashboard panel.
 * Cohesive logo styling across the entire platform.
 */
const BrandLogo = ({ size = 20, className = "" }) => {
  return (
    <img 
      src="/logo_light.png" 
      alt="CraveArc Logo" 
      className={`object-contain ${className}`}
      style={{ width: size * 2.2, height: size * 2.2 }}
    />
  );
};

export default BrandLogo;
