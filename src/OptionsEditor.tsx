/**
 * Options Editor Component
 * Author: David Castro Moreno
 */

import React, { useState } from 'react';
import { StandardEditorProps, SelectableValue } from '@grafana/data';
import {
  Button,
  Field,
  Input,
  Select,
  HorizontalGroup,
  VerticalGroup,
  useTheme2,
  Collapse,
  ColorPicker,
  Switch,
  TextArea,
} from '@grafana/ui';
import {
  MatrixBuilderOptions,
  MatrixCell,
  CellType,
  FieldSelectorMode,
  SeriesAggregation,
  ThresholdOperator,
  Severity,
  AlignMode,
  IconType,
  gridTemplates,
} from './types';

type EditorProps = StandardEditorProps<MatrixBuilderOptions>;

export const OptionsEditor: React.FC<EditorProps> = ({ value, onChange }) => {
  const theme = useTheme2();
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  const updateGrid = (updates: Partial<MatrixBuilderOptions['grid']>) => {
    onChange({
      ...value,
      grid: { ...value.grid, ...updates },
    });
  };

  const updateCell = (cellId: string, updates: Partial<MatrixCell>) => {
    const cells = value.cells.map((c) => (c.id === cellId ? { ...c, ...updates } : c));
    onChange({ ...value, cells });
  };

  const addCell = () => {
    const newCell: MatrixCell = {
      id: `cell-${Date.now()}`,
      row: 1,
      col: 1,
      rowSpan: 1,
      colSpan: 1,
      type: 'StaticText',
      staticText: 'New Cell',
      style: { align: 'center', showIcon: true, badge: false },
    };
    onChange({ ...value, cells: [...value.cells, newCell] });
    setSelectedCellId(newCell.id);
  };

  const removeCell = (cellId: string) => {
    onChange({ ...value, cells: value.cells.filter((c) => c.id !== cellId) });
    if (selectedCellId === cellId) {
      setSelectedCellId(null);
    }
  };

  const duplicateCell = (cellId: string) => {
    const cell = value.cells.find((c) => c.id === cellId);
    if (cell) {
      const newCell = { ...cell, id: `cell-${Date.now()}`, row: cell.row + 1 };
      onChange({ ...value, cells: [...value.cells, newCell] });
    }
  };

  const exportLayout = () => {
    const json = JSON.stringify(value, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matrix-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          onChange(imported);
        } catch (error) {
          console.error('Failed to import layout:', error);
          alert('Failed to import layout. Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const selectedCell = value.cells.find((c) => c.id === selectedCellId);

  return (
    <VerticalGroup spacing="md">
      <Collapse label="Grid Configuration" isOpen={true}>
        <VerticalGroup spacing="sm">
          <Field label="Template">
            <HorizontalGroup spacing="xs">
              {gridTemplates.map((template) => (
                <Button
                  key={template.name}
                  size="sm"
                  variant="secondary"
                  onClick={() => updateGrid({ rows: template.rows, cols: template.cols })}
                >
                  {template.name}
                </Button>
              ))}
            </HorizontalGroup>
          </Field>

          <HorizontalGroup spacing="sm">
            <Field label="Rows">
              <Input
                type="number"
                value={value.grid.rows}
                min={1}
                max={50}
                onChange={(e) => updateGrid({ rows: parseInt(e.currentTarget.value, 10) })}
                width={10}
              />
            </Field>
            <Field label="Columns">
              <Input
                type="number"
                value={value.grid.cols}
                min={1}
                max={50}
                onChange={(e) => updateGrid({ cols: parseInt(e.currentTarget.value, 10) })}
                width={10}
              />
            </Field>
          </HorizontalGroup>

          <HorizontalGroup spacing="sm">
            <Field label="Gap (px)">
              <Input
                type="number"
                value={value.grid.gap || 8}
                onChange={(e) => updateGrid({ gap: parseInt(e.currentTarget.value, 10) })}
                width={10}
              />
            </Field>
            <Field label="Min Width (px)">
              <Input
                type="number"
                value={value.grid.cellMinWidth || 150}
                onChange={(e) => updateGrid({ cellMinWidth: parseInt(e.currentTarget.value, 10) })}
                width={10}
              />
            </Field>
            <Field label="Min Height (px)">
              <Input
                type="number"
                value={value.grid.cellMinHeight || 80}
                onChange={(e) => updateGrid({ cellMinHeight: parseInt(e.currentTarget.value, 10) })}
                width={10}
              />
            </Field>
          </HorizontalGroup>
        </VerticalGroup>
      </Collapse>

      <Collapse label="Cells" isOpen={true}>
        <VerticalGroup spacing="sm">
          <HorizontalGroup spacing="sm">
            <Button icon="plus" onClick={addCell} size="sm">
              Add Cell
            </Button>
            <Button icon="import" onClick={exportLayout} size="sm" variant="secondary">
              Export Layout
            </Button>
            <Button icon="export" size="sm" variant="secondary">
              <label htmlFor="import-layout" style={{ cursor: 'pointer', margin: 0 }}>
                Import Layout
              </label>
              <input
                id="import-layout"
                type="file"
                accept=".json"
                onChange={importLayout}
                style={{ display: 'none' }}
              />
            </Button>
          </HorizontalGroup>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {value.cells.map((cell) => (
              <div
                key={cell.id}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  border: selectedCellId === cell.id ? '2px solid ' + theme.colors.primary.main : '1px solid ' + theme.colors.border.weak,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: selectedCellId === cell.id ? theme.colors.background.secondary : 'transparent',
                }}
                onClick={() => setSelectedCellId(cell.id)}
              >
                <HorizontalGroup spacing="sm" justify="space-between">
                  <span>
                    {cell.title || cell.staticText || `Cell ${cell.row},${cell.col}`} ({cell.type})
                  </span>
                  <HorizontalGroup spacing="xs">
                    <Button
                      icon="copy"
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateCell(cell.id);
                      }}
                    />
                    <Button
                      icon="trash-alt"
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCell(cell.id);
                      }}
                    />
                  </HorizontalGroup>
                </HorizontalGroup>
              </div>
            ))}
          </div>
        </VerticalGroup>
      </Collapse>

      {selectedCell && (
        <CellEditor cell={selectedCell} onUpdate={(updates) => updateCell(selectedCell.id, updates)} />
      )}

      <Collapse label="Severity Colors" isOpen={false}>
        <VerticalGroup spacing="sm">
          <Field label="OK Color">
            <ColorPicker
              color={value.severityColors?.ok || '#2e7d32'}
              onChange={(color) =>
                onChange({
                  ...value,
                  severityColors: { ...value.severityColors, ok: color },
                })
              }
            />
          </Field>
          <Field label="Warning Color">
            <ColorPicker
              color={value.severityColors?.warn || '#f9a825'}
              onChange={(color) =>
                onChange({
                  ...value,
                  severityColors: { ...value.severityColors, warn: color },
                })
              }
            />
          </Field>
          <Field label="Critical Color">
            <ColorPicker
              color={value.severityColors?.critical || '#c62828'}
              onChange={(color) =>
                onChange({
                  ...value,
                  severityColors: { ...value.severityColors, critical: color },
                })
              }
            />
          </Field>
        </VerticalGroup>
      </Collapse>
    </VerticalGroup>
  );
};

interface CellEditorProps {
  cell: MatrixCell;
  onUpdate: (updates: Partial<MatrixCell>) => void;
}

const CellEditor: React.FC<CellEditorProps> = ({ cell, onUpdate }) => {
  const cellTypeOptions: Array<SelectableValue<CellType>> = [
    { label: 'Static Text', value: 'StaticText' },
    { label: 'Query Value', value: 'QueryValue' },
    { label: 'Query Field', value: 'QueryField' },
  ];

  const fieldSelectorModeOptions: Array<SelectableValue<FieldSelectorMode>> = [
    { label: 'By Name', value: 'name' },
    { label: 'By Regex', value: 'regex' },
    { label: 'By Index', value: 'index' },
  ];

  const seriesAggOptions: Array<SelectableValue<SeriesAggregation>> = [
    { label: 'Last', value: 'last' },
    { label: 'Average', value: 'avg' },
    { label: 'Maximum', value: 'max' },
    { label: 'Minimum', value: 'min' },
  ];

  const alignOptions: Array<SelectableValue<AlignMode>> = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ];

  return (
    <Collapse label={`Edit Cell: ${cell.title || cell.staticText || cell.id}`} isOpen={true}>
      <VerticalGroup spacing="sm">
        <Field label="Title">
          <Input value={cell.title || ''} onChange={(e) => onUpdate({ title: e.currentTarget.value })} />
        </Field>

        <HorizontalGroup spacing="sm">
          <Field label="Row">
            <Input
              type="number"
              value={cell.row}
              min={1}
              onChange={(e) => onUpdate({ row: parseInt(e.currentTarget.value, 10) })}
              width={10}
            />
          </Field>
          <Field label="Col">
            <Input
              type="number"
              value={cell.col}
              min={1}
              onChange={(e) => onUpdate({ col: parseInt(e.currentTarget.value, 10) })}
              width={10}
            />
          </Field>
          <Field label="Row Span">
            <Input
              type="number"
              value={cell.rowSpan || 1}
              min={1}
              onChange={(e) => onUpdate({ rowSpan: parseInt(e.currentTarget.value, 10) })}
              width={10}
            />
          </Field>
          <Field label="Col Span">
            <Input
              type="number"
              value={cell.colSpan || 1}
              min={1}
              onChange={(e) => onUpdate({ colSpan: parseInt(e.currentTarget.value, 10) })}
              width={10}
            />
          </Field>
        </HorizontalGroup>

        <Field label="Type">
          <Select
            options={cellTypeOptions}
            value={cell.type}
            onChange={(v) => onUpdate({ type: v.value! })}
          />
        </Field>

        {cell.type === 'StaticText' && (
          <Field label="Text (supports variables like ${var:name})">
            <TextArea
              value={cell.staticText || ''}
              onChange={(e) => onUpdate({ staticText: e.currentTarget.value })}
              rows={3}
            />
          </Field>
        )}

        {(cell.type === 'QueryValue' || cell.type === 'QueryField') && (
          <>
            <Field label="Query RefId (A, B, C, ...)">
              <Input
                value={cell.queryRefId || ''}
                onChange={(e) => onUpdate({ queryRefId: e.currentTarget.value })}
                placeholder="A"
              />
            </Field>

            <Field label="Field Selector Mode">
              <Select
                options={fieldSelectorModeOptions}
                value={cell.fieldSelector?.mode || 'name'}
                onChange={(v) =>
                  onUpdate({
                    fieldSelector: {
                      ...cell.fieldSelector,
                      mode: v.value!,
                      value: cell.fieldSelector?.value || '',
                    },
                  })
                }
              />
            </Field>

            <Field label="Field Value">
              <Input
                value={String(cell.fieldSelector?.value || '')}
                onChange={(e) =>
                  onUpdate({
                    fieldSelector: {
                      ...cell.fieldSelector!,
                      value: cell.fieldSelector?.mode === 'index' ? parseInt(e.currentTarget.value, 10) : e.currentTarget.value,
                    },
                  })
                }
                placeholder={cell.fieldSelector?.mode === 'index' ? '0' : 'Field Name'}
              />
            </Field>

            <Field label="Series Aggregation">
              <Select
                options={seriesAggOptions}
                value={cell.seriesAgg || 'last'}
                onChange={(v) => onUpdate({ seriesAgg: v.value! })}
              />
            </Field>
          </>
        )}

        <Collapse label="Format" isOpen={false}>
          <VerticalGroup spacing="sm">
            <Field label="Unit">
              <Input
                value={cell.format?.unit || 'none'}
                onChange={(e) => onUpdate({ format: { ...cell.format, unit: e.currentTarget.value } })}
                placeholder="none, percent, bytes, custom"
              />
            </Field>
            <Field label="Decimals">
              <Input
                type="number"
                value={cell.format?.decimals ?? ''}
                onChange={(e) =>
                  onUpdate({ format: { ...cell.format, decimals: parseInt(e.currentTarget.value, 10) } })
                }
                placeholder="Auto"
              />
            </Field>
            <HorizontalGroup spacing="sm">
              <Field label="Prefix">
                <Input
                  value={cell.format?.prefix || ''}
                  onChange={(e) => onUpdate({ format: { ...cell.format, prefix: e.currentTarget.value } })}
                />
              </Field>
              <Field label="Suffix">
                <Input
                  value={cell.format?.suffix || ''}
                  onChange={(e) => onUpdate({ format: { ...cell.format, suffix: e.currentTarget.value } })}
                />
              </Field>
            </HorizontalGroup>
          </VerticalGroup>
        </Collapse>

        <Collapse label="Style" isOpen={false}>
          <VerticalGroup spacing="sm">
            <Field label="Align">
              <Select
                options={alignOptions}
                value={cell.style?.align || 'left'}
                onChange={(v) => onUpdate({ style: { ...cell.style, align: v.value! } })}
              />
            </Field>
            <Field label="Show Icon">
              <Switch
                value={cell.style?.showIcon ?? true}
                onChange={(e) => onUpdate({ style: { ...cell.style, showIcon: e.currentTarget.checked } })}
              />
            </Field>
            <Field label="Badge Mode">
              <Switch
                value={cell.style?.badge ?? false}
                onChange={(e) => onUpdate({ style: { ...cell.style, badge: e.currentTarget.checked } })}
              />
            </Field>
          </VerticalGroup>
        </Collapse>

        <Collapse label="Thresholds" isOpen={false}>
          <ThresholdEditor
            thresholds={cell.thresholds}
            onChange={(thresholds) => onUpdate({ thresholds })}
          />
        </Collapse>
      </VerticalGroup>
    </Collapse>
  );
};

interface ThresholdEditorProps {
  thresholds?: any;
  onChange: (thresholds: any) => void;
}

const ThresholdEditor: React.FC<ThresholdEditorProps> = ({ thresholds, onChange }) => {
  const thresholdTypeOptions: Array<SelectableValue<'number' | 'text'>> = [
    { label: 'Number', value: 'number' },
    { label: 'Text', value: 'text' },
  ];

  const operatorOptions: Array<SelectableValue<ThresholdOperator>> = [
    { label: '<', value: '<' },
    { label: '<=', value: '<=' },
    { label: '>', value: '>' },
    { label: '>=', value: '>=' },
    { label: 'Between', value: 'between' },
    { label: 'Equals', value: '==' },
    { label: 'Contains', value: 'contains' },
    { label: 'Regex', value: 'regex' },
  ];

  const severityOptions: Array<SelectableValue<Severity>> = [
    { label: 'OK', value: 'ok' },
    { label: 'Warning', value: 'warn' },
    { label: 'Critical', value: 'critical' },
  ];

  const iconOptions: Array<SelectableValue<IconType>> = [
    { label: 'None', value: null },
    { label: 'Check', value: 'check' },
    { label: 'Alert', value: 'alert' },
    { label: 'Info', value: 'info' },
  ];

  const config = thresholds || { type: 'number', rules: [], defaultSeverity: 'ok' };

  const addRule = () => {
    const newRule = {
      op: config.type === 'number' ? '>=' : '==',
      value: config.type === 'number' ? 0 : '',
      severity: 'ok',
    };
    onChange({ ...config, rules: [...(config.rules || []), newRule] });
  };

  const updateRule = (index: number, updates: any) => {
    const rules = [...(config.rules || [])];
    rules[index] = { ...rules[index], ...updates };
    onChange({ ...config, rules });
  };

  const removeRule = (index: number) => {
    const rules = [...(config.rules || [])];
    rules.splice(index, 1);
    onChange({ ...config, rules });
  };

  return (
    <VerticalGroup spacing="sm">
      <Field label="Threshold Type">
        <Select
          options={thresholdTypeOptions}
          value={config.type || 'number'}
          onChange={(v) => onChange({ ...config, type: v.value!, rules: [] })}
        />
      </Field>

      <Field label="Default Severity">
        <Select
          options={severityOptions}
          value={config.defaultSeverity || 'ok'}
          onChange={(v) => onChange({ ...config, defaultSeverity: v.value! })}
        />
      </Field>

      <Button icon="plus" onClick={addRule} size="sm" variant="secondary">
        Add Rule
      </Button>

      {(config.rules || []).map((rule: any, index: number) => (
        <div
          key={index}
          style={{
            padding: '8px',
            border: '1px solid #444',
            borderRadius: '4px',
          }}
        >
          <VerticalGroup spacing="xs">
            <HorizontalGroup spacing="sm">
              <Field label="Operator">
                <Select
                  options={operatorOptions.filter((op) =>
                    config.type === 'number'
                      ? ['<', '<=', '>', '>=', 'between'].includes(op.value!)
                      : ['==', 'contains', 'regex'].includes(op.value!)
                  )}
                  value={rule.op}
                  onChange={(v) => updateRule(index, { op: v.value })}
                  width={15}
                />
              </Field>

              {rule.op !== 'between' && (
                <Field label="Value">
                  <Input
                    value={rule.value ?? ''}
                    onChange={(e) =>
                      updateRule(index, {
                        value: config.type === 'number' ? parseFloat(e.currentTarget.value) : e.currentTarget.value,
                      })
                    }
                    width={15}
                  />
                </Field>
              )}

              {rule.op === 'between' && (
                <>
                  <Field label="Min">
                    <Input
                      type="number"
                      value={rule.min ?? ''}
                      onChange={(e) => updateRule(index, { min: parseFloat(e.currentTarget.value) })}
                      width={10}
                    />
                  </Field>
                  <Field label="Max">
                    <Input
                      type="number"
                      value={rule.max ?? ''}
                      onChange={(e) => updateRule(index, { max: parseFloat(e.currentTarget.value) })}
                      width={10}
                    />
                  </Field>
                </>
              )}
            </HorizontalGroup>

            <HorizontalGroup spacing="sm">
              <Field label="Severity">
                <Select
                  options={severityOptions}
                  value={rule.severity}
                  onChange={(v) => updateRule(index, { severity: v.value })}
                  width={15}
                />
              </Field>

              <Field label="Icon">
                <Select
                  options={iconOptions}
                  value={rule.icon ?? null}
                  onChange={(v) => updateRule(index, { icon: v.value })}
                  width={15}
                />
              </Field>

              <Field label="Label">
                <Input
                  value={rule.label || ''}
                  onChange={(e) => updateRule(index, { label: e.currentTarget.value })}
                  width={15}
                  placeholder="Optional"
                />
              </Field>
            </HorizontalGroup>

            <Button icon="trash-alt" onClick={() => removeRule(index)} size="sm" variant="destructive" fill="text">
              Remove Rule
            </Button>
          </VerticalGroup>
        </div>
      ))}
    </VerticalGroup>
  );
};
