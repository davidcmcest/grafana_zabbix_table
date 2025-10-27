/**
 * Data utilities for Matrix Builder Panel
 * Author: David Castro Moreno
 */

import { DataFrame, Field, getDisplayProcessor, FieldType } from '@grafana/data';
import { Severity, ThresholdConfig, FieldSelector, SeriesAggregation, CellFormat } from '../types';

/**
 * Pick a field from a DataFrame based on selector mode (name, regex, or index)
 */
export function pickField(
  frame: DataFrame | undefined,
  selector: FieldSelector | undefined
): Field | undefined {
  if (!frame || !frame.fields?.length || !selector) {
    return undefined;
  }

  switch (selector.mode) {
    case 'name': {
      const targetName = String(selector.value).toLowerCase().trim();
      return frame.fields.find((f) => {
        const displayName = (f.config?.displayName || f.name || '').toLowerCase().trim();
        return displayName === targetName;
      });
    }
    case 'regex': {
      try {
        const rx = new RegExp(String(selector.value), 'i');
        return frame.fields.find((f) => {
          const displayName = f.config?.displayName || f.name || '';
          return rx.test(displayName);
        });
      } catch (e) {
        console.error('Invalid regex pattern:', selector.value, e);
        return undefined;
      }
    }
    case 'index': {
      const idx = Number(selector.value);
      return frame.fields[idx];
    }
    default:
      return undefined;
  }
}

/**
 * Get a single value from a field based on aggregation mode
 */
export function getSeriesValue(
  field: Field | undefined,
  agg: SeriesAggregation = 'last'
): number | string | null {
  if (!field || !field.values || field.values.length === 0) {
    return null;
  }

  const vals = field.values;
  const arr = Array.from(vals) as any[];

  if (arr.length === 0) {
    return null;
  }

  // For string fields or last value, return directly
  if (agg === 'last') {
    return arr[arr.length - 1] ?? null;
  }

  // For numeric aggregations, filter to valid numbers
  const nums = arr.map((v) => Number(v)).filter((v) => Number.isFinite(v));

  if (nums.length === 0) {
    // If no valid numbers, return the last value as-is (might be string)
    return arr[arr.length - 1] ?? null;
  }

  switch (agg) {
    case 'avg':
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'max':
      return Math.max(...nums);
    case 'min':
      return Math.min(...nums);
    default:
      return nums[nums.length - 1];
  }
}

/**
 * Evaluate thresholds against a value and return the severity
 */
export function evalThreshold(value: unknown, thresholdConfig: ThresholdConfig | undefined): Severity {
  if (!thresholdConfig || !thresholdConfig.rules || thresholdConfig.rules.length === 0) {
    return 'ok';
  }

  const vStr = String(value ?? '').trim();
  const vNum = Number(value);

  for (const rule of thresholdConfig.rules) {
    switch (thresholdConfig.type) {
      case 'number':
        if (!Number.isFinite(vNum)) {
          break;
        }
        if (rule.op === '<' && rule.value !== undefined && vNum < Number(rule.value)) {
          return rule.severity;
        }
        if (rule.op === '<=' && rule.value !== undefined && vNum <= Number(rule.value)) {
          return rule.severity;
        }
        if (rule.op === '>' && rule.value !== undefined && vNum > Number(rule.value)) {
          return rule.severity;
        }
        if (rule.op === '>=' && rule.value !== undefined && vNum >= Number(rule.value)) {
          return rule.severity;
        }
        if (
          rule.op === 'between' &&
          rule.min !== undefined &&
          rule.max !== undefined &&
          vNum >= rule.min &&
          vNum <= rule.max
        ) {
          return rule.severity;
        }
        break;

      case 'text': {
        const ruleValueStr = String(rule.value ?? '').toLowerCase().trim();
        const vStrLower = vStr.toLowerCase();

        if (rule.op === '==' && vStrLower === ruleValueStr) {
          return rule.severity;
        }
        if (rule.op === 'contains' && vStrLower.includes(ruleValueStr)) {
          return rule.severity;
        }
        if (rule.op === 'regex') {
          try {
            const rx = new RegExp(String(rule.value), 'i');
            if (rx.test(vStr)) {
              return rule.severity;
            }
          } catch (e) {
            console.error('Invalid regex in threshold rule:', rule.value, e);
          }
        }
        break;
      }
    }
  }

  return thresholdConfig.defaultSeverity ?? 'ok';
}

/**
 * Get the threshold rule that matches the current value
 */
export function getMatchingRule(value: unknown, thresholdConfig: ThresholdConfig | undefined) {
  if (!thresholdConfig || !thresholdConfig.rules || thresholdConfig.rules.length === 0) {
    return null;
  }

  const vStr = String(value ?? '').trim();
  const vNum = Number(value);

  for (const rule of thresholdConfig.rules) {
    switch (thresholdConfig.type) {
      case 'number':
        if (!Number.isFinite(vNum)) {
          break;
        }
        if (rule.op === '<' && rule.value !== undefined && vNum < Number(rule.value)) {
          return rule;
        }
        if (rule.op === '<=' && rule.value !== undefined && vNum <= Number(rule.value)) {
          return rule;
        }
        if (rule.op === '>' && rule.value !== undefined && vNum > Number(rule.value)) {
          return rule;
        }
        if (rule.op === '>=' && rule.value !== undefined && vNum >= Number(rule.value)) {
          return rule;
        }
        if (
          rule.op === 'between' &&
          rule.min !== undefined &&
          rule.max !== undefined &&
          vNum >= rule.min &&
          vNum <= rule.max
        ) {
          return rule;
        }
        break;

      case 'text': {
        const ruleValueStr = String(rule.value ?? '').toLowerCase().trim();
        const vStrLower = vStr.toLowerCase();

        if (rule.op === '==' && vStrLower === ruleValueStr) {
          return rule;
        }
        if (rule.op === 'contains' && vStrLower.includes(ruleValueStr)) {
          return rule;
        }
        if (rule.op === 'regex') {
          try {
            const rx = new RegExp(String(rule.value), 'i');
            if (rx.test(vStr)) {
              return rule;
            }
          } catch (e) {
            console.error('Invalid regex in threshold rule:', rule.value, e);
          }
        }
        break;
      }
    }
  }

  return null;
}

/**
 * Format a value according to the cell format configuration
 */
export function formatValue(value: unknown, format: CellFormat | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }

  let formattedValue = String(value);

  // Handle numeric formatting
  if (typeof value === 'number' && format?.decimals !== undefined) {
    formattedValue = value.toFixed(format.decimals);
  }

  // Handle units
  if (format?.unit && format.unit !== 'none') {
    switch (format.unit) {
      case 'percent':
        formattedValue = `${formattedValue}%`;
        break;
      case 'bytes':
        formattedValue = formatBytes(Number(value));
        break;
      case 'custom':
        // Custom unit handled by prefix/suffix
        break;
      default:
        formattedValue = `${formattedValue} ${format.unit}`;
    }
  }

  // Add prefix and suffix
  const prefix = format?.prefix ?? '';
  const suffix = format?.suffix ?? '';

  return `${prefix}${formattedValue}${suffix}`;
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Replace variables in static text (e.g., ${var:name}, ${__from}, ${__to})
 */
export function replaceVariables(text: string, vars?: Record<string, string>): string {
  if (!text) {
    return '';
  }

  let result = text;

  // Replace Grafana time variables (these would come from timeRange in real implementation)
  // For now, just handle the pattern
  result = result.replace(/\$\{__from\}/g, () => {
    return vars?.['__from'] || '${__from}';
  });

  result = result.replace(/\$\{__to\}/g, () => {
    return vars?.['__to'] || '${__to}';
  });

  // Replace custom variables ${var:name}
  result = result.replace(/\$\{var:([^}]+)\}/g, (_, varName) => {
    return vars?.[varName] || `\${var:${varName}}`;
  });

  return result;
}

/**
 * Find DataFrame by refId
 */
export function findFrameByRefId(frames: DataFrame[], refId: string | undefined): DataFrame | undefined {
  if (!refId || !frames || frames.length === 0) {
    return undefined;
  }

  return frames.find((f) => f.refId === refId);
}
