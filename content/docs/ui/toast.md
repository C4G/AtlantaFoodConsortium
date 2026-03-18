---
title: Toast
description: Non-blocking notification system. Provides useToast() hook and Toaster renderer.
group: UI Components
order: 1
---

## Overview

The toast system provides non-blocking notifications via a `useToast()` hook. A single `<Toaster>` component is already mounted in `src/app/layout.tsx` - **do not add it again** in individual pages or components.

## Basic usage

```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  return (
    <button
      onClick={() =>
        toast({ title: 'Saved!', description: 'Your changes have been saved.' })
      }
    >
      Save
    </button>
  );
}
```

## Variants

| Variant       | Use case                      | Visual           |
| ------------- | ----------------------------- | ---------------- |
| `default`     | Neutral information           | White / bordered |
| `destructive` | Errors, failed actions        | Red background   |
| `success`     | Confirmations, success states | Green background |

```tsx
// Destructive
toast({
  title: 'Error',
  description: 'Failed to post product.',
  variant: 'destructive',
});

// Success
toast({
  title: 'Approved!',
  description: 'The nonprofit has been approved.',
  variant: 'success',
});
```

## All options

```ts
toast({
  title: string;           // Bold heading
  description?: string;    // Supporting text
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;       // ms - default uses TOAST_REMOVE_DELAY
  action?: <ToastAction>;  // Optional action button
});
```

## With an action button

```tsx
import { ToastAction } from '@/components/ui/toast';

toast({
  title: 'Product deleted',
  description: 'The listing has been removed.',
  action: (
    <ToastAction altText='Undo' onClick={handleUndo}>
      Undo
    </ToastAction>
  ),
});
```

## Constants

| Constant             | Value     | Description                                                            |
| -------------------- | --------- | ---------------------------------------------------------------------- |
| `TOAST_LIMIT`        | `1`       | Only one toast is shown at a time. New toasts replace the current one. |
| `TOAST_REMOVE_DELAY` | `3500` ms | How long a toast stays visible before auto-dismissing.                 |

> **Note:** `TOAST_LIMIT = 1` means calling `toast()` while a toast is already visible will immediately replace it.

## Files

| File                          | Purpose                                      |
| ----------------------------- | -------------------------------------------- |
| `src/hooks/use-toast.ts`      | `useToast()` hook and toast state management |
| `src/components/ui/toast.tsx` | `Toast`, `ToastAction`, `Toaster` components |
