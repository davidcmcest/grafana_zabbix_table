/**
 * Matrix Builder Panel Types
 * Author: David Castro Moreno
 */

export type Severity = 'ok' | 'warn' | 'critical';

export type CellType = 'StaticText' | 'QueryValue' | 'QueryField';

export type FieldSelectorMode = 'name' | 'regex' | 'index';

export type SeriesAggregation = 'last' | 'avg' | 'max' | 'min';

export type ThresholdOperator = '<' | '<=' | '>' | '>=' | 'between' | '==' | 'contains' | 'regex';

export type AlignMode = 'left' | 'center' | 'right';

export type IconType = 'check' | 'alert' | 'info' | null;

export interface FieldSelector {
  mode: FieldSelectorMode;
  value: string | number;
}

export interface CellFormat {
  unit: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export interface ThresholdRule {
  op: ThresholdOperator;
  value?: number | string;
  min?: number;
  max?: number;
  severity: Severity;
  color?: string;
  icon?: IconType;
  label?: string;
}

export interface ThresholdConfig {
  type: 'number' | 'text';
  rules: ThresholdRule[];
  defaultSeverity?: Severity;
}

export interface CellStyle {
  align?: AlignMode;
  showIcon?: boolean;
  badge?: boolean;
}

export interface CellAction {
  type: 'url' | 'dashboard';
  url?: string;
  dashboardUid?: string;
  params?: Record<string, string>;
  newTab?: boolean;
}

export interface MatrixCell {
  id: string;
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  type: CellType;
  title?: string;
  staticText?: string;
  queryRefId?: string;
  fieldSelector?: FieldSelector;
  seriesAgg?: SeriesAggregation;
  format?: CellFormat;
  thresholds?: ThresholdConfig;
  style?: CellStyle;
  action?: CellAction;
}

export interface GridConfig {
  rows: number;
  cols: number;
  gap?: number;
  cellMinWidth?: number;
  cellMinHeight?: number;
}

export interface GridTemplate {
  name: string;
  rows: number;
  cols: number;
}

export interface MatrixBuilderOptions {
  grid: GridConfig;
  cells: MatrixCell[];
  severityColors?: {
    ok: string;
    warn: string;
    critical: string;
  };
}

export const defaultGridConfig: GridConfig = {
  rows: 2,
  cols: 2,
  gap: 8,
  cellMinWidth: 150,
  cellMinHeight: 80,
};

export const defaultSeverityColors = {
  ok: '#2e7d32',
  warn: '#f9a825',
  critical: '#c62828',
};

export const gridTemplates: GridTemplate[] = [
  { name: '1×4', rows: 1, cols: 4 },
  { name: '2×2', rows: 2, cols: 2 },
  { name: '2×3', rows: 2, cols: 3 },
  { name: '2×4', rows: 2, cols: 4 },
  { name: '3×3', rows: 3, cols: 3 },
  { name: '4×4', rows: 4, cols: 4 },
];

export const defaultOptions: MatrixBuilderOptions = {
  grid: defaultGridConfig,
  cells: [],
  severityColors: defaultSeverityColors,
};
