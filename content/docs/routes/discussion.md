---
title: Discussion Route
description: Community discussion threads. Available to any authenticated user.
group: Routes
order: 5
---

## Overview

The Discussion route (`/discussion`) provides a community forum where any authenticated user can start and participate in discussion threads. Thread detail pages are accessible at `/discussion/[id]`.

**Source directory:** `src/app/discussion/`

## Access control

| Check            | Value                         |
| ---------------- | ----------------------------- |
| Required         | Authenticated session         |
| Role restriction | None - any authenticated user |

## Thread list

The discussion index page renders all threads in an **AG Grid** table. Users can click any row to navigate to the thread detail page.

Column configuration: `src/app/discussion/columnDefs.ts`

Default columns:

| Column        | Field        |
| ------------- | ------------ |
| Title         | `title`      |
| Author        | `authorName` |
| Replies       | `replyCount` |
| Last activity | `updatedAt`  |

## Thread detail

`/discussion/[id]` - Renders the full thread with all replies in chronological order.

Users can post a reply directly from this page. Reply actions are handled by Next.js server actions defined in `src/app/discussion/actions.ts`.

```ts
// src/app/discussion/actions.ts
'use server';

export async function postReply(threadId: string, content: string) { ... }
export async function createThread(title: string, body: string) { ... }
export async function deleteThread(threadId: string) { ... }
```

## Creating a thread

```tsx
import { createThread } from './actions';

await createThread(
  'Question about claim process',
  'How do I cancel a pending claim?'
);
```

## API routes used

| Endpoint / Action            | Method | Purpose                                |
| ---------------------------- | ------ | -------------------------------------- |
| `/api/discussion`            | `GET`  | Fetch all threads                      |
| `createThread` server action | Server | Create a new thread                    |
| `postReply` server action    | Server | Add a reply to a thread                |
| `deleteThread` server action | Server | Delete a thread (author or ADMIN only) |
