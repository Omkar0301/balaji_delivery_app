import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface BrandIconProps {
  size?: number;
}

/** Crisp Google Pay multi-color G mark */
export const GooglePayIcon: React.FC<BrandIconProps> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3.1-4.3 3.1-7.4z"
      fill="#4285F4"
    />
    <Path
      d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.7 8 22 12 22z"
      fill="#34A853"
    />
    <Path
      d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.3 2.9 7.6l3.3 2.6C7 7.7 9.3 5.9 12 5.9z"
      fill="#EA4335"
    />
  </Svg>
);

/** PhonePe purple circular emblem (pure vector, no font dependency) */
export const PhonePeIcon: React.FC<BrandIconProps> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="11" fill="#5F259F" />
    <Path
      d="M8.5 7.5h7M14 7.5v8.8M9.5 10.2c0 2.2 1.2 3.5 3.2 3.5 1 0 1.3-.3 1.3-.3"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

/** Paytm dual-tone UPI badge (pure vector, no font dependency) */
export const PaytmIcon: React.FC<BrandIconProps> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="1.5" y="5" width="21" height="14" rx="4" fill="#002970" />
    <Rect x="12" y="5" width="10.5" height="14" rx="4" fill="#00BAF2" />
    <Path
      d="M5.5 9.5v5M5.5 9.5h2.2a1.3 1.3 0 010 2.6H5.5M14.5 9.5l3 2.5-3 2.5"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
