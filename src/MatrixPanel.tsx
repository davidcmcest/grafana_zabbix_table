/**
 * Matrix Panel Component
 * Author: David Castro Moreno
 */

import React, { useMemo } from 'react';
import { PanelProps } from '@grafana/data';
import { MatrixBuilderOptions, MatrixCell } from './types';
import { Cell } from './components/Cell';
import {
  findFrameByRefId,
  pickField,
  getSeriesValue,
  evalThreshold,
  getMatchingRule,
  replaceVariables,
} from './utils/data';
import { defaultSeverityColors } from './types';
import './styles.css';

interface MatrixPanelProps extends PanelProps<MatrixBuilderOptions> {}

export const MatrixPanel: React.FC<MatrixPanelProps> = ({ options, data, width, height, replaceVariables: grafanaReplaceVariables }) => {
  const { grid, cells, severityColors = defaultSeverityColors } = options;

  // Build grid template styles
  const gridStyle = useMemo(() => {
    const colWidth = grid.cellMinWidth || 150;
    const rowHeight = grid.cellMinHeight || 80;

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${grid.cols}, minmax(${colWidth}px, 1fr))`,
      gridTemplateRows: `repeat(${grid.rows}, minmax(${rowHeight}px, auto))`,
      gap: `${grid.gap || 8}px`,
      width: '100%',
      height: '100%',
      padding: '8px',
    };
  }, [grid]);

  // Render cells
  const renderedCells = useMemo(() => {
    return cells.map((cell) => renderCell(cell, data.series, severityColors, grafanaReplaceVariables));
  }, [cells, data.series, severityColors, grafanaReplaceVariables]);

  return (
    <div className="mbp-grid" style={gridStyle}>
      {renderedCells}
    </div>
  );
};

function renderCell(
  cell: MatrixCell,
  frames: any[],
  severityColors: Record<string, string>,
  grafanaReplaceVariables?: (value: string) => string
) {
  const { id, row, col, rowSpan = 1, colSpan = 1, type, style } = cell;

  let value: string | number | null = null;
  let severity = 'ok';
  let icon = undefined;
  let label = undefined;

  // Determine cell value based on type
  switch (type) {
    case 'StaticText':
      value = cell.staticText || '';
      // Replace variables if function is available
      if (grafanaReplaceVariables) {
        value = grafanaReplaceVariables(value);
      } else if (cell.staticText) {
        // Fallback to basic variable replacement
        value = replaceVariables(cell.staticText, {});
      }
      break;

    case 'QueryValue':
    case 'QueryField': {
      const frame = findFrameByRefId(frames, cell.queryRefId);
      if (frame && cell.fieldSelector) {
        const field = pickField(frame, cell.fieldSelector);
        if (field) {
          value = getSeriesValue(field, cell.seriesAgg || 'last');
        }
      }
      break;
    }
  }

  // Evaluate thresholds
  if (cell.thresholds) {
    severity = evalThreshold(value, cell.thresholds);
    const matchingRule = getMatchingRule(value, cell.thresholds);
    if (matchingRule) {
      icon = matchingRule.icon || undefined;
      label = matchingRule.label;
    }
  }

  // Get severity color
  const severityColor = severityColors[severity] || defaultSeverityColors[severity as keyof typeof defaultSeverityColors];

  // Cell positioning
  const cellStyle: React.CSSProperties = {
    gridColumn: `${col} / span ${colSpan}`,
    gridRow: `${row} / span ${rowSpan}`,
  };

  // Handle cell action
  const handleClick = cell.action
    ? () => {
        if (cell.action?.type === 'url' && cell.action.url) {
          const url = grafanaReplaceVariables ? grafanaReplaceVariables(cell.action.url) : cell.action.url;
          if (cell.action.newTab) {
            window.open(url, '_blank');
          } else {
            window.location.href = url;
          }
        } else if (cell.action?.type === 'dashboard' && cell.action.dashboardUid) {
          // Navigate to dashboard (would need Grafana runtime)
          const baseUrl = `/d/${cell.action.dashboardUid}`;
          const params = new URLSearchParams(cell.action.params || {});
          const url = `${baseUrl}?${params.toString()}`;
          if (cell.action.newTab) {
            window.open(url, '_blank');
          } else {
            window.location.href = url;
          }
        }
      }
    : undefined;

  return (
    <div key={id} style={cellStyle}>
      <Cell
        title={cell.title}
        value={value}
        severity={severity as any}
        severityColor={severityColor}
        showIcon={style?.showIcon ?? true}
        icon={icon}
        align={style?.align || 'left'}
        badge={style?.badge || false}
        format={cell.format}
        label={label}
        onClick={handleClick}
      />
    </div>
  );
}
