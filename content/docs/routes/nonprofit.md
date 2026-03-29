---
title: Nonprofit Route
description: Product browsing and claiming dashboard. Requires an authenticated session with an associated nonprofit.
group: Routes
order: 3
---

## Overview

The Nonprofit route (`/nonprofit`) allows verified nonprofit organizations to browse available food products and submit claim requests. Access requires both an active session **and** a `nonprofitId` associated with the user's account.

**Source directory:** `src/app/nonprofit/`

## Access control

| Check               | Value                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| Required            | Authenticated session                                                   |
| Additional check    | User must have a `nonprofitId`                                          |
| Redirect on failure | `/onboarding/nonprofit` (if no nonprofitId) or `/` (if unauthenticated) |

## Tabs

| Tab                 | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| **Browse Products** | Grid of available product listings with claim button on each card |
| **My Claims**       | Table of the nonprofit's submitted and active claims              |
| **History**         | Completed and expired claim records                               |

## Claiming a product

```tsx
const { claim, unclaim, isClaiming } = useClaim(product.id);

<button onClick={claim} disabled={isClaiming}>
  Claim Product
</button>;
```

Unclaiming requires the `requestId` (the ID of the existing claim record):

```tsx
const { unclaim } = useClaim(product.id);

<button onClick={() => unclaim(requestId)}>Unclaim</button>;
```

## Data hooks

| Hook                  | File                            | Returns                                           |
| --------------------- | ------------------------------- | ------------------------------------------------- |
| `useNonprofitData()`  | `src/hooks/useNonprofitData.ts` | Available products and the nonprofit's own claims |
| `useClaim(productId)` | `src/hooks/useClaim.ts`         | `{ claim, unclaim, isClaiming }`                  |

## API routes used

| Endpoint                     | Method   | Purpose                               |
| ---------------------------- | -------- | ------------------------------------- |
| `/api/products/available`    | `GET`    | Fetch products available for claiming |
| `/api/product-requests`      | `POST`   | Submit a new claim                    |
| `/api/product-requests/[id]` | `DELETE` | Remove an existing claim              |
| `/api/nonprofit/claims`      | `GET`    | Fetch the nonprofit's claim history   |
