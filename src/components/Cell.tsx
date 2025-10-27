/**
 * Cell Component
 * Author: David Castro Moreno
 */

import React from 'react';
import { Severity, IconType, AlignMode, CellFormat } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatValue } from '../utils/data';

interface CellProps {
  title?: string;
  value: string | number | null;
  severity: Severity;
  severityColor?: string;
  showIcon?: boolean;
  icon?: IconType;
  align?: AlignMode;
  badge?: boolean;
  format?: CellFormat;
  label?: string;
  onClick?: () => void;
}

export const Cell: React.FC<CellProps> = ({
  title,
  value,
  severity,
  severityColor,
  showIcon = true,
  icon,
  align = 'left',
  badge = false,
  format,
  label,
  onClick,
}) => {
  const formattedValue = formatValue(value, format);
  const displayText = label || formattedValue;

  const cellClass = `mbp-cell mbp-cell-${severity} ${badge ? 'mbp-cell-badge' : ''}`;
  const ariaLabel = `Cell ${title || ''} value ${displayText} severity ${severity}`;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const cellStyle: React.CSSProperties = {
    textAlign: align,
    cursor: onClick ? 'pointer' : 'default',
  };

  if (severityColor) {
    cellStyle.borderColor = severityColor;
  }

  return (
    <div
      className={cellClass}
      aria-label={ariaLabel}
      style={cellStyle}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="mbp-cell-content">
        {badge && showIcon && (
          <StatusBadge
            severity={severity}
            icon={icon}
            showIcon={showIcon}
            color={severityColor}
          />
        )}
        <div className="mbp-cell-value-wrapper">
          {title && <div className="mbp-cell-title">{title}</div>}
          <div className="mbp-cell-value">{displayText}</div>
        </div>
        {!badge && showIcon && (
          <StatusBadge
            severity={severity}
            icon={icon}
            showIcon={showIcon}
            color={severityColor}
          />
        )}
      </div>
    </div>
  );
};
