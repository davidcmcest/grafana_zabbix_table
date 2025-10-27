# Matrix Builder Panel for Grafana

**Author:** David Castro Moreno
**Version:** 1.0.0
**Compatible with:** Grafana 10.x

## Overview

Matrix Builder Panel is an advanced, highly configurable panel plugin for Grafana 10 that allows you to create custom matrix/grid layouts with dynamic data binding, thresholds, and visual customization. Perfect for monitoring dashboards, infrastructure status boards, and data visualization.

## Features

- ✅ **Configurable Grid Layout**: Create N×M grids with customizable rows, columns, gaps, and cell sizes
- ✅ **Multiple Cell Types**:
  - **StaticText**: Display static text with variable interpolation
  - **QueryValue**: Show aggregated values from queries (last, avg, max, min)
  - **QueryField**: Display specific fields from query results
- ✅ **Flexible Data Binding**: Bind cells to query results by refId with field selection by name, regex, or index
- ✅ **Threshold System**:
  - Numeric thresholds (<, <=, >, >=, between)
  - Text thresholds (equals, contains, regex)
  - Per-cell severity levels (ok, warn, critical)
- ✅ **Visual Customization**:
  - Custom severity colors
  - Icons (check, alert, info)
  - Alignment options (left, center, right)
  - Badge mode
  - Formatting (units, decimals, prefix/suffix)
- ✅ **Interactivity**: Click actions to open URLs or navigate to dashboards
- ✅ **Import/Export**: Save and load layouts as JSON
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Accessibility**: ARIA labels and keyboard navigation
- ✅ **No External Dependencies**: Only uses official Grafana libraries

## Installation

### Method 1: Manual Installation

1. Clone or download this repository
2. Build the plugin:
   ```bash
   npm install
   npm run build
   ```
3. Copy the `dist` folder to your Grafana plugins directory:
   ```bash
   cp -r dist /var/lib/grafana/plugins/matrix-builder-panel
   ```
4. Restart Grafana

### Method 2: Development Mode

```bash
npm install
npm run dev
```

Then symlink to your Grafana plugins directory.

## Usage

### Quick Start

1. Add a new panel to your dashboard
2. Select "Matrix Builder Panel" from the visualization list
3. Configure your queries (e.g., Zabbix, Prometheus, InfluxDB)
4. Open the panel options to configure the grid

### Grid Configuration

Select from quick templates or customize manually:

- **Templates**: 1×4, 2×2, 2×3, 2×4, 3×3, 4×4
- **Custom**: Set rows (1-50), columns (1-50)
- **Layout**: Gap, min width, min height

### Cell Configuration

Each cell can be configured with:

#### Basic Properties

- **Title**: Optional label displayed above the value
- **Position**: Row, column
- **Span**: Row span, column span (for merged cells)
- **Type**: StaticText, QueryValue, or QueryField

#### Cell Types

**StaticText**
```json
{
  "type": "StaticText",
  "staticText": "Farm: ${var:farm}"
}
```
Supports Grafana variables:
- `${var:name}` - Custom variables
- `${__from}` - Dashboard time range start
- `${__to}` - Dashboard time range end

**QueryValue**
```json
{
  "type": "QueryValue",
  "queryRefId": "A",
  "fieldSelector": { "mode": "name", "value": "Farm – Status" },
  "seriesAgg": "last"
}
```

**QueryField**
```json
{
  "type": "QueryField",
  "queryRefId": "B",
  "fieldSelector": { "mode": "regex", "value": "BuildVersion" },
  "seriesAgg": "last"
}
```

#### Field Selection Modes

- **By Name**: Exact match on field name or displayName
- **By Regex**: Regular expression match (case-insensitive)
- **By Index**: Select field by index (0, 1, 2, ...)

#### Series Aggregation

For time series data, choose aggregation:
- **Last**: Most recent value
- **Average**: Mean of all values
- **Maximum**: Highest value
- **Minimum**: Lowest value

#### Formatting

```json
{
  "format": {
    "unit": "percent",
    "decimals": 2,
    "prefix": "$",
    "suffix": " USD"
  }
}
```

Supported units:
- `none` - No unit
- `percent` - Adds % symbol
- `bytes` - Formats as KB, MB, GB, etc.
- `custom` - Use prefix/suffix

#### Thresholds

**Numeric Thresholds**
```json
{
  "thresholds": {
    "type": "number",
    "rules": [
      { "op": ">=", "value": 90, "severity": "critical", "icon": "alert" },
      { "op": ">=", "value": 70, "severity": "warn", "icon": "alert" },
      { "op": "<", "value": 70, "severity": "ok", "icon": "check" }
    ],
    "defaultSeverity": "ok"
  }
}
```

**Text Thresholds**
```json
{
  "thresholds": {
    "type": "text",
    "rules": [
      { "op": "==", "value": "Online", "severity": "ok", "icon": "check", "label": "Online" },
      { "op": "==", "value": "Offline", "severity": "critical", "icon": "alert", "label": "Offline" }
    ],
    "defaultSeverity": "warn"
  }
}
```

Operators:
- Numeric: `<`, `<=`, `>`, `>=`, `between`
- Text: `==`, `contains`, `regex`

#### Styling

```json
{
  "style": {
    "align": "center",
    "showIcon": true,
    "badge": false
  }
}
```

- **Align**: left, center, right
- **Show Icon**: Display severity icon
- **Badge**: Icon on left vs right side

#### Actions (Optional)

**URL Action**
```json
{
  "action": {
    "type": "url",
    "url": "https://example.com/farm/${var:farm}",
    "newTab": true
  }
}
```

**Dashboard Action**
```json
{
  "action": {
    "type": "dashboard",
    "dashboardUid": "abc123",
    "params": {
      "var-farm": "${var:farm}"
    },
    "newTab": false
  }
}
```

## Example Configurations

### Example 1: Farm Status Dashboard (2×2 Grid)

```json
{
  "grid": {
    "rows": 2,
    "cols": 2,
    "gap": 8,
    "cellMinWidth": 150,
    "cellMinHeight": 80
  },
  "cells": [
    {
      "id": "cell-1",
      "row": 1,
      "col": 1,
      "type": "StaticText",
      "title": "Farm",
      "staticText": "${var:farm}"
    },
    {
      "id": "cell-2",
      "row": 1,
      "col": 2,
      "type": "QueryField",
      "title": "Version",
      "queryRefId": "A",
      "fieldSelector": { "mode": "name", "value": "Farm – BuildVersion" },
      "seriesAgg": "last"
    },
    {
      "id": "cell-3",
      "row": 2,
      "col": 1,
      "type": "QueryField",
      "title": "Status",
      "queryRefId": "A",
      "fieldSelector": { "mode": "name", "value": "Farm – Status" },
      "thresholds": {
        "type": "text",
        "rules": [
          { "op": "==", "value": "Online", "severity": "ok", "icon": "check", "label": "Online" },
          { "op": "==", "value": "Offline", "severity": "critical", "icon": "alert", "label": "Offline" }
        ],
        "defaultSeverity": "warn"
      },
      "style": { "align": "center", "showIcon": true, "badge": true }
    },
    {
      "id": "cell-4",
      "row": 2,
      "col": 2,
      "type": "QueryField",
      "title": "Needs Upgrade",
      "queryRefId": "B",
      "fieldSelector": { "mode": "name", "value": "Farm – NeedsUpgrade" },
      "thresholds": {
        "type": "number",
        "rules": [
          { "op": "==", "value": 1, "severity": "critical", "icon": "alert", "label": "Update Required" },
          { "op": "==", "value": 0, "severity": "ok", "icon": "check", "label": "Up to Date" }
        ]
      },
      "style": { "align": "center", "showIcon": true }
    }
  ]
}
```

### Example 2: Server Metrics (3×3 Grid)

```json
{
  "grid": { "rows": 3, "cols": 3, "gap": 10 },
  "cells": [
    {
      "id": "cpu",
      "row": 1,
      "col": 1,
      "title": "CPU Usage",
      "type": "QueryValue",
      "queryRefId": "A",
      "fieldSelector": { "mode": "name", "value": "cpu" },
      "seriesAgg": "avg",
      "format": { "unit": "percent", "decimals": 1 },
      "thresholds": {
        "type": "number",
        "rules": [
          { "op": ">=", "value": 80, "severity": "critical" },
          { "op": ">=", "value": 60, "severity": "warn" }
        ]
      }
    },
    {
      "id": "memory",
      "row": 1,
      "col": 2,
      "title": "Memory",
      "type": "QueryValue",
      "queryRefId": "B",
      "fieldSelector": { "mode": "index", "value": 0 },
      "format": { "unit": "bytes" },
      "thresholds": {
        "type": "number",
        "rules": [
          { "op": ">=", "value": 8589934592, "severity": "critical" },
          { "op": ">=", "value": 4294967296, "severity": "warn" }
        ]
      }
    }
  ]
}
```

## Data Sources Compatibility

This plugin works with any Grafana data source that returns:
- **Time Series**: For aggregated values (last, avg, max, min)
- **Table**: For field values (first row by default)

Tested with:
- Zabbix
- Prometheus
- InfluxDB
- PostgreSQL
- MySQL

## Export/Import Layouts

1. **Export**: Click "Export Layout" to download configuration as JSON
2. **Import**: Click "Import Layout" and select a JSON file
3. **Share**: Save layouts in version control or share with team

## Development

### Build

```bash
npm install
npm run build
```

### Test

```bash
npm test
```

### Watch Mode

```bash
npm run watch
```

### Linting

```bash
npm run lint
```

## Architecture

```
src/
├── components/
│   ├── Cell.tsx           # Cell rendering component
│   ├── StatusBadge.tsx    # Severity badge component
│   └── Icon.tsx           # Icon component
├── utils/
│   └── data.ts            # Data processing utilities
├── __tests__/
│   └── data.test.ts       # Unit tests
├── MatrixPanel.tsx        # Main panel component
├── OptionsEditor.tsx      # Configuration UI
├── module.ts              # Plugin entry point
├── types.ts               # TypeScript types
├── styles.css             # Styles
└── plugin.json            # Plugin manifest
```

## Troubleshooting

### "No data" displayed

- Verify your query returns data
- Check the refId matches your query (A, B, C, etc.)
- Verify field selector matches actual field names

### Field not found

- Use "By Regex" mode for flexible matching
- Check field names in query inspector
- Try "By Index" mode (start from 0)

### Thresholds not working

- Verify threshold type matches data type (number vs text)
- Check operators (>= vs >)
- Review default severity setting

### Styling issues

- Check browser console for errors
- Clear Grafana cache
- Verify Grafana version compatibility

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- GitHub Issues: https://github.com/davidcmcest/grafana_zabbix_table/issues
- Email: david.castro.moreno@example.com

## Changelog

### v1.0.0 (2025-10-27)

- Initial release
- Grid layout with N×M configuration
- Three cell types: StaticText, QueryValue, QueryField
- Numeric and text thresholds
- Severity colors and icons
- Format options
- Import/Export layouts
- Click actions
- Full test coverage
- Documentation

## Credits

Developed by **David Castro Moreno**

Built with:
- [@grafana/data](https://www.npmjs.com/package/@grafana/data)
- [@grafana/ui](https://www.npmjs.com/package/@grafana/ui)
- [@grafana/runtime](https://www.npmjs.com/package/@grafana/runtime)
- TypeScript
- React
