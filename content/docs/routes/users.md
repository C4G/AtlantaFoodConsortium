---
title: Users Route
description: User management table for platform administrators. Restricted to the ADMIN role.
group: Routes
order: 4
---

## Overview

The Users route (`/users`) provides admins with a full table of all registered platform users. Admins can view user details and delete accounts. Deletion uses a cascade strategy - all data associated with a deleted user is also removed.

**Source directory:** `src/app/users/`

## Access control

| Check               | Value   |
| ------------------- | ------- |
| Required role       | `ADMIN` |
| Redirect on failure | `/`     |

## Data grid

The users table is built with **AG Grid** (`ag-grid-react`). Column configuration is defined in `src/app/users/columnDefs.ts`.

Default columns:

| Column       | Field              |
| ------------ | ------------------ |
| Name         | `name`             |
| Email        | `email`            |
| Role         | `role`             |
| Organization | `organizationName` |
| Status       | `status`           |
| Joined       | `createdAt`        |
| Actions      | Delete button      |

## Deleting a user

Clicking the delete button opens a confirmation dialog that warns the admin about the cascade effect:

> **Warning:** Deleting a user is permanent and will also delete all associated data including product listings (suppliers) or claim records (nonprofits).

```tsx
// Calls DELETE /api/users/[id]
const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
```

## API routes used

| Endpoint          | Method   | Purpose                                |
| ----------------- | -------- | -------------------------------------- |
| `/api/users`      | `GET`    | Fetch all users                        |
| `/api/users/[id]` | `DELETE` | Delete a user and all cascaded records |
