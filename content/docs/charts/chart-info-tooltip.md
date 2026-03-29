---
title: ChartInfoTooltip
description: An info icon that shows a tooltip with descriptive text about a chart. Text is sourced centrally from chart-info-text.ts.
group: Charts
order: 6
---

## Overview

`ChartInfoTooltip` renders a small `info` info button that, when hovered or focused, displays descriptive text explaining what a particular chart shows. All tooltip strings live in a single file (`src/lib/chart-info-text.ts`) so they are easy to update without touching component code.

The tooltip uses viewport-aware positioning - it flips direction automatically when too close to the right or bottom edge of the screen.

## Props

| Prop       | Type     | Required | Description                                            |
| ---------- | -------- | -------- | ------------------------------------------------------ |
| `chartKey` | `string` | Yes      | Key that maps to a text entry in `chart-info-text.ts`. |

## Usage

Place the component next to a chart title:

```tsx
import ChartInfoTooltip from '@/components/charts/ChartInfoTooltip';

<div className='flex items-center gap-2'>
  <h3 className='font-semibold'>Claims Over Time</h3>
  <ChartInfoTooltip chartKey='claimsOverTime' />
</div>;
```

## Adding tooltip text

Open `src/lib/chart-info-text.ts` and add a new key-value pair:

```ts
export const chartInfoText: Record<string, string> = {
  claimsOverTime:
    'Shows the number of product claims made each month across all nonprofits.',
  productsByCategory:
    'Breakdown of active product listings grouped by food category.',
  // add your key here
  myNewChart: 'Description shown in the tooltip for this chart.',
};
```

> **Note:** If a key is not found in `chartInfoText`, the tooltip will render an empty string. Always add the key before using `ChartInfoTooltip` in a new chart.

## Viewport-aware positioning

The tooltip calculates available space on render and flips:

- **Horizontally:** opens left if within 220 px of the right viewport edge.
- **Vertically:** opens upward if within 120 px of the bottom viewport edge.

**Source file:** `src/components/charts/ChartInfoTooltip.tsx`
