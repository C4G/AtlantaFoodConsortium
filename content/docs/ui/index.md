---
title: UI Components
description: Overview of the shared UI components available across the platform.
group: UI Components
order: 0
---

## Overview

The `src/components/ui/` directory contains shared, reusable UI primitives built on top of shadcn/ui. These components are used throughout every feature area of the platform.

## Available components

| Component | File                         | Description                                           |
| --------- | ---------------------------- | ----------------------------------------------------- |
| Toast     | `use-toast` hook + `Toaster` | Non-blocking notification system with three variants. |
| Button    | `button.tsx`                 | Primary action element with size and variant props.   |
| Badge     | `badge.tsx`                  | Inline status indicator.                              |
| Card      | `card.tsx`                   | Content container with optional header and footer.    |
| Dialog    | `dialog.tsx`                 | Modal overlay for confirmations and forms.            |
| Select    | `select.tsx`                 | Dropdown select with accessible keyboard navigation.  |
| Input     | `input.tsx`                  | Styled text input.                                    |
| Textarea  | `textarea.tsx`               | Multi-line text input.                                |
| Skeleton  | `skeleton.tsx`               | Animated loading placeholder.                         |

## Toast

The toast notification system is the most commonly used UI component. See the [Toast](toast) page for full API documentation.

## shadcn/ui

All components follow [shadcn/ui](https://ui.shadcn.com) conventions - unstyled Radix UI primitives styled with Tailwind. To add a new component run:

```bash
npx shadcn@latest add <component-name>
```
