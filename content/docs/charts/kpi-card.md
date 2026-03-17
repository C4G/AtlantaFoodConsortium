---
title: KpiCard
description: A stat card showing a numeric value with an optional trend indicator and icon.
group: Charts
order: 5
---

## Overview

`KpiCard` displays a single key metric with an optional icon, trend arrow, and trend label. Used across the Admin, Supplier, and Nonprofit dashboards to surface summary stats at a glance.

## Props

| Prop         | Type               | Required | Description                                                       |
| ------------ | ------------------ | -------- | ----------------------------------------------------------------- |
| `value`      | `string \| number` | Yes      | The primary metric to display.                                    |
| `label`      | `string`           | Yes      | Short descriptor shown below the value.                           |
| `icon`       | `LucideIcon`       | No       | Lucide icon component rendered top-right.                         |
| `trend`      | `number`           | No       | Percentage change. Positive = green, negative = red.              |
| `trendLabel` | `string`           | No       | Contextual text next to the trend arrow (e.g. `"vs last month"`). |
| `prefix`     | `string`           | No       | String prepended to `value` (e.g. `"$"`).                         |

## Usage

```tsx
import KpiCard from '@/components/charts/KpiCard';
import { Package } from 'lucide-react';

<KpiCard
  value={142}
  label='Active Listings'
  icon={Package}
  trend={12.5}
  trendLabel='vs last month'
/>;
```

## Currency example

```tsx
<KpiCard
  value={3820}
  label='Total Value Claimed'
  prefix='$'
  trend={-3.2}
  trendLabel='vs last month'
/>
```

## Trend coloring

| `trend` value  | Color              | Icon   |
| -------------- | ------------------ | ------ |
| `> 0`          | `text-emerald-600` | up     |
| `< 0`          | `text-red-500`     | down   |
| `0` or omitted | Neutral            | Hidden |

> **Tip:** Pass `trend={0}` to explicitly hide the trend indicator without omitting the prop entirely.

**Source file:** `src/components/charts/KpiCard.tsx`
