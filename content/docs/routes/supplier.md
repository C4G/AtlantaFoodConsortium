---
title: Supplier Route
description: Supplier dashboard for managing product listings. Restricted to users with the SUPPLIER role.
group: Routes
order: 2
---

## Overview

The Supplier route (`/supplier`) lets food suppliers manage their active product listings, view claim activity, and track metrics. Access is restricted to users with the `SUPPLIER` role.

**Source directory:** `src/app/supplier/`

## Access control

| Check               | Value      |
| ------------------- | ---------- |
| Required role       | `SUPPLIER` |
| Redirect on failure | `/`        |

## Tabs

| Tab             | Description                                                           |
| --------------- | --------------------------------------------------------------------- |
| **My Products** | Table of the supplier's current listings with edit and delete actions |
| **Analytics**   | KPI cards and charts showing claim rates and product performance      |

## Data hooks

| Hook                   | File                              | Returns                                                   |
| ---------------------- | --------------------------------- | --------------------------------------------------------- |
| `useSupplierData()`    | `src/hooks/useSupplierData.ts`    | Supplier's product listings and claim history             |
| `useSupplierMetrics()` | `src/hooks/useSupplierMetrics.ts` | Aggregate stats - total listed, total claimed, claim rate |
| `useSupplierForm()`    | `src/hooks/useSupplierForm.ts`    | Form state and `submit` handler for posting a new product |

## Posting a new product

```tsx
const { register, handleSubmit, errors, isSubmitting } = useSupplierForm();

// Posts to POST /api/products
<form onSubmit={handleSubmit}>
  <input {...register('name')} placeholder='Product name' />
  <input {...register('quantity')} type='number' />
  {errors.name && <p>{errors.name.message}</p>}
  <button type='submit' disabled={isSubmitting}>
    Post Product
  </button>
</form>;
```

## API routes used

| Endpoint                | Method   | Purpose                              |
| ----------------------- | -------- | ------------------------------------ |
| `/api/products`         | `GET`    | Fetch supplier's own products        |
| `/api/products`         | `POST`   | Create a new product listing         |
| `/api/products/[id]`    | `PUT`    | Update an existing listing           |
| `/api/products/[id]`    | `DELETE` | Remove a listing                     |
| `/api/supplier/metrics` | `GET`    | Fetch supplier-level aggregate stats |
