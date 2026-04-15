---
title: Onboarding Route
description: Registration flows for new suppliers and nonprofits. Two multi-step wizards built with react-hook-form and Zod.
group: Routes
order: 7
---

## Overview

The Onboarding route provides two separate multi-step registration wizards:

- `/onboarding/supplier` - 3-step supplier registration
- `/onboarding/nonprofit` - 4-step nonprofit registration

Both flows use **react-hook-form** for form state and **Zod** for schema validation. On successful completion a `<SuccessPopup>` modal is shown before redirecting to the appropriate dashboard.

**Source directory:** `src/app/onboarding/`

## Access control

| Check                             | Value                                   |
| --------------------------------- | --------------------------------------- |
| Required                          | No session (public route)               |
| Redirect if already authenticated | Redirects to role-appropriate dashboard |

---

## Supplier onboarding (`/onboarding/supplier`)

### Steps

| Step             | Fields                                     |
| ---------------- | ------------------------------------------ |
| 1 - Account      | Email, password, confirm password          |
| 2 - Organization | Company name, contact name, phone, address |
| 3 - Review       | Summary of entered data with submit button |

### Form schema

```ts
// Defined in src/app/onboarding/supplier/schema.ts
const supplierSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    companyName: z.string().min(2),
    contactName: z.string().min(2),
    phone: z.string(),
    address: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

### API endpoint

`POST /api/onboarding/supplier` - Creates the user and supplier organization records in one transaction.

---

## Nonprofit onboarding (`/onboarding/nonprofit`)

### Steps

| Step             | Fields                                   |
| ---------------- | ---------------------------------------- |
| 1 - Account      | Email, password, confirm password        |
| 2 - Organization | Nonprofit name, EIN, contact name, phone |
| 3 - Address      | Street, city, state, zip                 |
| 4 - Review       | Summary with document upload and submit  |

### Document upload

Step 4 allows optional upload of a verification document (e.g. 501(c)(3) letter). Files are stored in `uploads/nonprofit-documents/`.

### Form schema

```ts
// Defined in src/app/onboarding/nonprofit/schema.ts
const nonprofitSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    nonprofitName: z.string().min(2),
    ein: z.string().regex(/^\d{2}-\d{7}$/, 'Must be in format XX-XXXXXXX'),
    contactName: z.string().min(2),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{5}$/, 'Must be a 5-digit ZIP code'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

### API endpoint

`POST /api/onboarding/nonprofit` - Creates the user and nonprofit records. Sets nonprofit `status` to `'PENDING'` awaiting admin approval.

---

## SuccessPopup

After a successful submission both flows show a `<SuccessPopup>` modal.

```tsx
import SuccessPopup from '@/components/Onboarding/SuccessPopup';

<SuccessPopup
  title='Registration submitted!'
  message='An admin will review your application shortly.'
  onClose={() => router.push('/')}
/>;
```

**Source file:** `src/components/Onboarding/SuccessPopup.tsx`
