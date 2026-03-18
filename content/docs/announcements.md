---
title: Announcements
description: Platform-wide announcements system - creation, visibility rules, and admin controls.
group: Platform Features
order: 1
---

## Overview

Announcements are platform-wide messages created by admins and visible to all authenticated users. They appear at the top of the dashboard and can be used to communicate downtime, policy changes, or important updates.

## Creating an announcement (Admin)

1. **Navigate to Admin → Announcements** - Only users with the `ADMIN` role can access this page.
2. **Click New Announcement** - Fill in the title, body, and optional expiration date.
3. **Publish** - The announcement becomes immediately visible to all logged-in users. No email is sent.

## Database schema

| Column      | Type        | Notes                                             |
| ----------- | ----------- | ------------------------------------------------- |
| `id`        | `String`    | CUID primary key                                  |
| `title`     | `String`    | Short headline                                    |
| `content`   | `String`    | Full message body                                 |
| `createdAt` | `DateTime`  | Auto-set on creation                              |
| `expiresAt` | `DateTime?` | Optional - hides the announcement after this date |
| `authorId`  | `String`    | FK to User - must be an admin                     |

> **Warning:** Expiration behaviour
> Expired announcements are **not** deleted from the database. They are simply filtered out on the client. Admins can still see them in the admin panel.

## Fetching active announcements

```typescript
// src/app/dashboard/page.tsx
import { prisma } from '@/lib/prisma';

const announcements = await prisma.announcement.findMany({
  where: {
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  },
  orderBy: { createdAt: 'desc' },
});
```
