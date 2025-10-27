/**
 * Icon Component
 * Author: David Castro Moreno
 */

import React from 'react';
import { IconType } from '../types';

interface IconProps {
  type: IconType;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ type, size = 16 }) => {
  if (!type) {
    return null;
  }

  const style = {
    width: size,
    height: size,
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  switch (type) {
    case 'check':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            fill="currentColor"
          />
        </svg>
      );

    case 'alert':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"
            fill="currentColor"
          />
        </svg>
      );

    case 'info':
      return (
        <svg style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            fill="currentColor"
          />
        </svg>
      );

    default:
      return null;
  }
};
