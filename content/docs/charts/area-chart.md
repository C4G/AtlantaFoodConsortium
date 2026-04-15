---
title: AreaChartComponent
description: A responsive area chart with smooth curves, a gradient fill, and a custom tooltip. Built on Recharts.
group: Charts
order: 1
---

## Overview

`AreaChartComponent` renders a filled area chart suitable for showing trends over time, such as monthly donation volumes or claim rates. The fill uses a gradient defined by a `fillColor` prop.

## Props

| Prop          | Type           | Required | Description                                                                            |
| ------------- | -------------- | -------- | -------------------------------------------------------------------------------------- |
| `data`        | `object[]`     | Yes      | Array of data points. Each object must have the key matching `dataKey` and `xAxisKey`. |
| `areas`       | `AreaConfig[]` | Yes      | Array of area definitions - each with `dataKey`, `label`, and `fillColor`.             |
| `xAxisKey`    | `string`       | Yes      | Key in each data object used for the X-axis labels.                                    |
| `title`       | `string`       | No       | Title rendered above the chart.                                                        |
| `description` | `string`       | No       | Subtitle rendered below the title.                                                     |
| `tooltipKey`  | `string`       | No       | Override for the tooltip label key.                                                    |

## Usage

```tsx
import AreaChartComponent from '@/components/charts/AreaChartComponent';

const data = [
  { month: 'Jan', donations: 40 },
  { month: 'Feb', donations: 65 },
  { month: 'Mar', donations: 52 },
];

<AreaChartComponent
  data={data}
  xAxisKey='month'
  title='Monthly Donations'
  areas={[{ dataKey: 'donations', label: 'Donations', fillColor: '#3b82f6' }]}
/>;
```

> **Tip:** `fillColor` controls both the stroke line colour and the gradient fill. Use a hex colour or a Tailwind CSS variable like `var(--color-primary)`.

**Source file:** `src/components/charts/AreaChartComponent.tsx`
