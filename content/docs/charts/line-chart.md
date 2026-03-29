---
title: LineChartComponent
description: A single or multi-line chart for comparing metrics over time. Built on Recharts.
group: Charts
order: 3
---

## Overview

`LineChartComponent` renders a line chart that supports multiple lines. Each line is defined by a `lines` config array with its own `dataKey`, `label`, and `color`. Used in the Admin Dashboard to show monthly platform trends.

## Props

| Prop          | Type           | Required | Description                                                            |
| ------------- | -------------- | -------- | ---------------------------------------------------------------------- |
| `data`        | `object[]`     | Yes      | Array of data points.                                                  |
| `lines`       | `LineConfig[]` | Yes      | Array of line definitions - each with `dataKey`, `label`, and `color`. |
| `xAxisKey`    | `string`       | Yes      | Key used for X-axis labels.                                            |
| `title`       | `string`       | No       | Title above the chart.                                                 |
| `description` | `string`       | No       | Subtitle below the title.                                              |

## Single-line usage

```tsx
import LineChartComponent from '@/components/charts/LineChartComponent';

const data = [
  { month: 'Jan', claims: 12 },
  { month: 'Feb', claims: 19 },
  { month: 'Mar', claims: 15 },
];

<LineChartComponent
  data={data}
  xAxisKey='month'
  title='Claims Over Time'
  lines={[{ dataKey: 'claims', label: 'Claims', color: '#3b82f6' }]}
/>;
```

## Multi-line usage

```tsx
<LineChartComponent
  data={data}
  xAxisKey='month'
  title='Platform Activity'
  lines={[
    { dataKey: 'claims', label: 'Claims', color: '#3b82f6' },
    { dataKey: 'products', label: 'Products Posted', color: '#10b981' },
  ]}
/>
```

**Source file:** `src/components/charts/LineChartComponent.tsx`
