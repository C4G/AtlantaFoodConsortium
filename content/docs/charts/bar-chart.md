---
title: BarChartComponent
description: A paginated bar chart that supports both horizontal and vertical layouts. Built on Recharts.
group: Charts
order: 2
---

## Overview

`BarChartComponent` renders a bar chart with built-in pagination for long datasets. It supports both vertical (default) and horizontal layouts. Used in the Admin Dashboard to show top suppliers by donation volume.

## Props

| Prop           | Type                         | Required | Description                                   |
| -------------- | ---------------------------- | -------- | --------------------------------------------- |
| `data`         | `object[]`                   | Yes      | Array of data objects.                        |
| `dataKey`      | `string`                     | Yes      | Key in each object used for the bar value.    |
| `xAxisKey`     | `string`                     | Yes      | Key used for axis labels.                     |
| `title`        | `string`                     | No       | Title above the chart.                        |
| `description`  | `string`                     | No       | Subtitle below the title.                     |
| `layout`       | `'horizontal' \| 'vertical'` | No       | Bar orientation. Default: `'vertical'`.       |
| `itemsPerPage` | `number`                     | No       | How many bars to show per page. Default: `5`. |
| `barColor`     | `string`                     | No       | Fill colour for bars.                         |

## Usage

```tsx
import BarChartComponent from '@/components/charts/BarChartComponent';

const data = [
  { name: 'Whole Foods', donated: 320 },
  { name: 'Kroger', donated: 210 },
  { name: 'Publix', donated: 180 },
];

<BarChartComponent
  data={data}
  dataKey='donated'
  xAxisKey='name'
  title='Top Suppliers'
  itemsPerPage={5}
/>;
```

> **Info:** Pagination
> When `data.length > itemsPerPage`, Previous/Next buttons appear below the chart. The component manages page state internally - no external state needed.

**Source file:** `src/components/charts/BarChartComponent.tsx`
