'use client';

export default function QRCode() {
  // Simple SVG QR code representation
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="white" />
      {/* Top-left finder pattern */}
      <rect width="28" height="28" fill="black" />
      <rect x="2" y="2" width="24" height="24" fill="white" />
      <rect x="6" y="6" width="16" height="16" fill="black" />
      
      {/* Top-right finder pattern */}
      <rect x="92" y="0" width="28" height="28" fill="black" />
      <rect x="94" y="2" width="24" height="24" fill="white" />
      <rect x="98" y="6" width="16" height="16" fill="black" />
      
      {/* Bottom-left finder pattern */}
      <rect x="0" y="92" width="28" height="28" fill="black" />
      <rect x="2" y="94" width="24" height="24" fill="white" />
      <rect x="6" y="98" width="16" height="16" fill="black" />
      
      {/* Timing patterns */}
      <line x1="32" y1="6" x2="60" y2="6" stroke="black" strokeWidth="2" />
      <line x1="6" y1="32" x2="6" y2="60" stroke="black" strokeWidth="2" />
      
      {/* Data pattern */}
      <rect x="40" y="40" width="40" height="40" fill="black" opacity="0.3" />
      <circle cx="60" cy="60" r="12" fill="indigo" />
    </svg>
  );
}
