---
title: Announcements Route
description: Platform-wide announcements. Any authenticated user can read; only ADMINs can create or delete.
group: Routes
order: 6
---

## Overview

The Announcements route (`/announcements`) displays a list of platform-wide announcements. Any authenticated user can read announcements. Only users with the `ADMIN` role can create or delete them.

A dismissible banner for the most recent unread announcement also appears on the home page (`/`).

**Source directory:** `src/app/announcements/`

## Access control

| Action              | Required role          |
| ------------------- | ---------------------- |
| View announcements  | Any authenticated user |
| Create announcement | `ADMIN`                |
| Delete announcement | `ADMIN`                |

## Home page banner

A banner component at the top of the home page (`src/app/page.tsx`) shows the latest announcement if the user has not yet dismissed it. Dismissal state is stored in `localStorage`.

```tsx
// Shown if unread announcement exists
<AnnouncementBanner announcement={latestAnnouncement} />
```

## Creating an announcement (Admin only)

The create form on `/announcements` posts to `/api/announcements`:

```tsx
await fetch('/api/announcements', {
  method: 'POST',
  body: JSON.stringify({ title, body }),
});
```

Fields:

| Field   | Type     | Required |
| ------- | -------- | -------- |
| `title` | `string` | Yes      |
| `body`  | `string` | Yes      |

## API routes used

| Endpoint                  | Method   | Purpose                                |
| ------------------------- | -------- | -------------------------------------- |
| `/api/announcements`      | `GET`    | Fetch all announcements                |
| `/api/announcements`      | `POST`   | Create a new announcement (ADMIN only) |
| `/api/announcements/[id]` | `DELETE` | Delete an announcement (ADMIN only)    |
