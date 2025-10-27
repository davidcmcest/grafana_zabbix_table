/**
 * Data Utilities Tests
 * Author: David Castro Moreno
 */

import { DataFrame, FieldType } from '@grafana/data';
import {
  pickField,
  getSeriesValue,
  evalThreshold,
  formatValue,
  replaceVariables,
  findFrameByRefId,
} from '../utils/data';

describe('pickField', () => {
  const mockFrame: DataFrame = {
    name: 'TestFrame',
    refId: 'A',
    fields: [
      {
        name: 'time',
        type: FieldType.time,
        config: { displayName: 'Time' },
        values: [1, 2, 3],
      } as any,
      {
        name: 'value',
        type: FieldType.number,
        config: { displayName: 'Farm – Status' },
        values: [10, 20, 30],
      } as any,
      {
        name: 'version',
        type: FieldType.string,
        config: { displayName: 'Farm – BuildVersion' },
        values: ['1.0', '1.1', '1.2'],
      } as any,
    ],
    length: 3,
  };

  test('should pick field by name', () => {
    const field = pickField(mockFrame, { mode: 'name', value: 'Farm – Status' });
    expect(field).toBeDefined();
    expect(field?.config?.displayName).toBe('Farm – Status');
  });

  test('should pick field by regex', () => {
    const field = pickField(mockFrame, { mode: 'regex', value: 'BuildVersion' });
    expect(field).toBeDefined();
    expect(field?.config?.displayName).toBe('Farm – BuildVersion');
  });

  test('should pick field by index', () => {
    const field = pickField(mockFrame, { mode: 'index', value: 1 });
    expect(field).toBeDefined();
    expect(field?.config?.displayName).toBe('Farm – Status');
  });

  test('should return undefined for non-existent field', () => {
    const field = pickField(mockFrame, { mode: 'name', value: 'NonExistent' });
    expect(field).toBeUndefined();
  });
});

describe('getSeriesValue', () => {
  const mockField = {
    name: 'value',
    type: FieldType.number,
    config: {},
    values: [10, 20, 30, 40, 50],
  } as any;

  test('should get last value', () => {
    const value = getSeriesValue(mockField, 'last');
    expect(value).toBe(50);
  });

  test('should get average value', () => {
    const value = getSeriesValue(mockField, 'avg');
    expect(value).toBe(30);
  });

  test('should get max value', () => {
    const value = getSeriesValue(mockField, 'max');
    expect(value).toBe(50);
  });

  test('should get min value', () => {
    const value = getSeriesValue(mockField, 'min');
    expect(value).toBe(10);
  });

  test('should return null for empty field', () => {
    const emptyField = { ...mockField, values: [] };
    const value = getSeriesValue(emptyField, 'last');
    expect(value).toBeNull();
  });
});

describe('evalThreshold', () => {
  test('should evaluate numeric threshold with greater than', () => {
    const threshold = {
      type: 'number' as const,
      rules: [
        { op: '>=' as const, value: 50, severity: 'critical' as const },
        { op: '>=' as const, value: 30, severity: 'warn' as const },
      ],
      defaultSeverity: 'ok' as const,
    };

    expect(evalThreshold(60, threshold)).toBe('critical');
    expect(evalThreshold(40, threshold)).toBe('warn');
    expect(evalThreshold(20, threshold)).toBe('ok');
  });

  test('should evaluate numeric threshold with between', () => {
    const threshold = {
      type: 'number' as const,
      rules: [{ op: 'between' as const, min: 10, max: 20, severity: 'warn' as const }],
      defaultSeverity: 'ok' as const,
    };

    expect(evalThreshold(15, threshold)).toBe('warn');
    expect(evalThreshold(5, threshold)).toBe('ok');
    expect(evalThreshold(25, threshold)).toBe('ok');
  });

  test('should evaluate text threshold with equals', () => {
    const threshold = {
      type: 'text' as const,
      rules: [
        { op: '==' as const, value: 'Online', severity: 'ok' as const },
        { op: '==' as const, value: 'Offline', severity: 'critical' as const },
      ],
      defaultSeverity: 'warn' as const,
    };

    expect(evalThreshold('Online', threshold)).toBe('ok');
    expect(evalThreshold('Offline', threshold)).toBe('critical');
    expect(evalThreshold('Unknown', threshold)).toBe('warn');
  });

  test('should evaluate text threshold with contains', () => {
    const threshold = {
      type: 'text' as const,
      rules: [{ op: 'contains' as const, value: 'error', severity: 'critical' as const }],
      defaultSeverity: 'ok' as const,
    };

    expect(evalThreshold('Error occurred', threshold)).toBe('critical');
    expect(evalThreshold('All good', threshold)).toBe('ok');
  });

  test('should evaluate text threshold with regex', () => {
    const threshold = {
      type: 'text' as const,
      rules: [{ op: 'regex' as const, value: '^(On|Off)line$', severity: 'ok' as const }],
      defaultSeverity: 'warn' as const,
    };

    expect(evalThreshold('Online', threshold)).toBe('ok');
    expect(evalThreshold('Offline', threshold)).toBe('ok');
    expect(evalThreshold('Unknown', threshold)).toBe('warn');
  });
});

describe('formatValue', () => {
  test('should format value with decimals', () => {
    const formatted = formatValue(3.14159, { unit: 'none', decimals: 2 });
    expect(formatted).toBe('3.14');
  });

  test('should format value with percent unit', () => {
    const formatted = formatValue(85.5, { unit: 'percent', decimals: 1 });
    expect(formatted).toBe('85.5%');
  });

  test('should format value with prefix and suffix', () => {
    const formatted = formatValue(100, { unit: 'none', prefix: '$', suffix: ' USD' });
    expect(formatted).toBe('$100 USD');
  });

  test('should format bytes', () => {
    const formatted = formatValue(1024, { unit: 'bytes' });
    expect(formatted).toBe('1 KB');
  });

  test('should return placeholder for null', () => {
    const formatted = formatValue(null, { unit: 'none' });
    expect(formatted).toBe('—');
  });
});

describe('replaceVariables', () => {
  test('should replace custom variables', () => {
    const result = replaceVariables('Farm: ${var:farm}', { farm: 'Farm01' });
    expect(result).toBe('Farm: Farm01');
  });

  test('should replace time variables', () => {
    const result = replaceVariables('From ${__from} to ${__to}', {
      __from: '2025-01-01',
      __to: '2025-01-31',
    });
    expect(result).toBe('From 2025-01-01 to 2025-01-31');
  });

  test('should keep unreplaced variables as-is', () => {
    const result = replaceVariables('Farm: ${var:farm}', {});
    expect(result).toBe('Farm: ${var:farm}');
  });
});

describe('findFrameByRefId', () => {
  const frames: DataFrame[] = [
    { refId: 'A', name: 'Query A', fields: [], length: 0 },
    { refId: 'B', name: 'Query B', fields: [], length: 0 },
  ];

  test('should find frame by refId', () => {
    const frame = findFrameByRefId(frames, 'B');
    expect(frame).toBeDefined();
    expect(frame?.name).toBe('Query B');
  });

  test('should return undefined for non-existent refId', () => {
    const frame = findFrameByRefId(frames, 'C');
    expect(frame).toBeUndefined();
  });
});
