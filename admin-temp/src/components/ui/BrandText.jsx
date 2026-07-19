import React from 'react';
import { BRAND } from '../../constants/brand';

/**
 * Reusable BrandText typography component for the Admin app.
 * Cohesive text wordmark across the platform.
 */
const BrandText = ({ className = "text-xl" }) => {
  const mainPart = BRAND.NAME.slice(0, 5); // "Crave"
  const accentPart = BRAND.NAME.slice(5); // "Arc"

  return (
    <span className={`font-poppins font-extrabold text-slate-900 tracking-tight ${className}`}>
      {mainPart}
      <span className="text-emerald-500">{accentPart}</span>
      <span className="text-emerald-500">.</span>
    </span>
  );
};

export default BrandText;
