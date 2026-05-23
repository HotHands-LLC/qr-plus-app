import React from 'react';

interface QRPlusLogoProps {
  size?: number;
  className?: string;
}

export default function QRPlusLogo({ size = 80, className = '' }: QRPlusLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="80" height="80" rx="16" fill="#000000" />
      <rect width="80" height="80" rx="16" stroke="#F59E0B" strokeWidth="2" />

      {/* QR pattern - top left module */}
      <rect x="8" y="8" width="24" height="24" rx="2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <rect x="14" y="14" width="12" height="12" rx="1" fill="#FFFFFF" />

      {/* QR pattern - top right module */}
      <rect x="48" y="8" width="24" height="24" rx="2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <rect x="54" y="14" width="12" height="12" rx="1" fill="#FFFFFF" />

      {/* QR pattern - bottom left module */}
      <rect x="8" y="48" width="24" height="24" rx="2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <rect x="14" y="54" width="12" height="12" rx="1" fill="#FFFFFF" />

      {/* + sign in amber (bottom right area) */}
      <rect x="50" y="56" width="16" height="4" rx="2" fill="#F59E0B" />
      <rect x="56" y="50" width="4" height="16" rx="2" fill="#F59E0B" />

      {/* Data dots */}
      <rect x="36" y="8" width="4" height="4" rx="1" fill="#FFFFFF" />
      <rect x="36" y="16" width="4" height="4" rx="1" fill="#FFFFFF" />
      <rect x="8" y="36" width="4" height="4" rx="1" fill="#FFFFFF" />
      <rect x="16" y="36" width="4" height="4" rx="1" fill="#FFFFFF" />
    </svg>
  );
}
