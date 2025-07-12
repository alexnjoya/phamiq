import React from 'react';

const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      stroke="#3b82f6"
      strokeWidth="5"
      opacity="0.2"
      fill="none"
    />
    <path
      d="M45 25a20 20 0 1 1-20-20"
      stroke="url(#spinner-gradient)"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    <defs>
      <linearGradient id="spinner-gradient" x1="25" y1="5" x2="25" y2="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
);

export default Spinner; 