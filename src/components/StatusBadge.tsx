/**
 * Status Badge Component
 * Author: David Castro Moreno
 */

import React from 'react';
import { Severity, IconType } from '../types';
import { Icon } from './Icon';

interface StatusBadgeProps {
  severity: Severity;
  icon?: IconType;
  showIcon?: boolean;
  color?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  severity,
  icon,
  showIcon = true,
  color
}) => {
  if (!showIcon) {
    return null;
  }

  const severityIcons: Record<Severity, IconType> = {
    ok: 'check',
    warn: 'alert',
    critical: 'alert',
  };

  const iconType = icon || severityIcons[severity];
  const badgeColor = color || getSeverityColor(severity);

  return (
    <span
      className={`mbp-status-badge mbp-status-${severity}`}
      style={{ color: badgeColor }}
    >
      <Icon type={iconType} size={18} />
    </span>
  );
};

function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'ok':
      return '#2e7d32';
    case 'warn':
      return '#f9a825';
    case 'critical':
      return '#c62828';
    default:
      return '#666';
  }
}
