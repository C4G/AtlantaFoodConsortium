---
title: Admin Route
description: Platform management dashboard. Restricted to users with the ADMIN role.
group: Routes
order: 1
---

## Overview

The Admin route (`/admin`) is the central management hub. It is strictly gated to users with the `ADMIN` role. Admins can approve or reject nonprofit registrations, monitor platform-wide analytics, and view all users and products.

**Source directory:** `src/app/admin/`

## Access control

| Check               | Value   |
| ------------------- | ------- |
| Required role       | `ADMIN` |
| Redirect on failure | `/`     |

## Tabs

The dashboard is divided into four tabs:

| Tab                   | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| **Overview**          | KPI cards and charts showing platform health (claims, products, nonprofits) |
| **Pending Approvals** | List of nonprofits awaiting admin approval with approve/reject actions      |
| **Products**          | Read-only view of all product listings across all suppliers                 |
| **Analytics**         | Detailed time-series charts for platform activity                           |

## Data hooks

| Hook                               | File                             | Returns                                                  |
| ---------------------------------- | -------------------------------- | -------------------------------------------------------- |
| `useAdminData()`                   | `src/hooks/useAdminData.ts`      | Nonprofits, products, pending approvals list             |
| `useAdminAnalytics()`              | `src/hooks/useAdminAnalytics.ts` | Monthly chart data for Overview and Analytics tabs       |
| `useApproval(nonprofitId, action)` | `src/hooks/useApproval.ts`       | `{ approve, isPending }` - posts to `/api/admin/approve` |

## Approval flow

```tsx
const { approve, isPending } = useApproval(nonprofit.id, 'APPROVE');
const { approve: reject, isPending: isRejecting } = useApproval(nonprofit.id, 'REJECT');

<button onClick={approve} disabled={isPending}>Approve</button>
<button onClick={reject} disabled={isRejecting}>Reject</button>
```

> **Note:** Approving a nonprofit sets `status = 'APPROVED'` and triggers a Resend email notification to the nonprofit contact.

## API routes used

| Endpoint                | Method | Purpose                          |
| ----------------------- | ------ | -------------------------------- |
| `/api/admin/nonprofits` | `GET`  | Fetch all nonprofits with status |
| `/api/admin/approve`    | `POST` | Approve or reject a nonprofit    |
| `/api/products`         | `GET`  | Fetch all product listings       |
| `/api/analytics`        | `GET`  | Fetch monthly platform metrics   |
