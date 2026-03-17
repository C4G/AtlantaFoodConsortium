---
title: DonutChartComponent
description: A donut (ring) chart for displaying proportional breakdowns. Built on Recharts.
group: Charts
order: 4
---

## Overview

`DonutChartComponent` renders a donut chart with a center label. Used in the Admin Dashboard to visualize product category distribution and other proportional data.

## Props

| Prop          | Type         | Required | Description                                                         |
| ------------- | ------------ | -------- | ------------------------------------------------------------------- |
| `data`        | `DataItem[]` | Yes      | Array of segments - each with `name`, `value`, and optional `fill`. |
| `title`       | `string`     | No       | Title above the chart.                                              |
| `description` | `string`     | No       | Subtitle below the title.                                           |
| `innerRadius` | `number`     | No       | Inner hole radius in pixels. Default: `60`.                         |
| `outerRadius` | `number`     | No       | Outer ring radius in pixels. Default: `100`.                        |

## Data shape

```ts
type DataItem = {
  name: string; // Segment label shown in the legend
  value: number; // Segment size
  fill?: string; // Optional hex color - falls back to default palette
};
```

## Usage

```tsx
import DonutChartComponent from '@/components/charts/DonutChartComponent';

const data = [
  { name: 'Produce', value: 34, fill: '#10b981' },
  { name: 'Protein', value: 22, fill: '#3b82f6' },
  { name: 'Dairy', value: 18, fill: '#f59e0b' },
  { name: 'Other', value: 26 },
];

<DonutChartComponent
  data={data}
  title='Products by Category'
  description='Distribution of active listings'
/>;
```

## Default color palette

If `fill` is omitted, segments cycle through the chart's internal default palette (`#3b82f6`, `#10b981`, `#f59e0b`, `#ef4444`, `#8b5cf6`, …).

## Mobile behavior

Slice labels are hidden on viewports narrower than `sm` (640 px) to prevent overlap. Only the legend is shown on small screens.

**Source file:** `src/components/charts/DonutChartComponent.tsx`
