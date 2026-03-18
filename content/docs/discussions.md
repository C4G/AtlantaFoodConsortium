---
title: Discussions
description: Threaded discussion boards scoped to users, products, and organizations.
group: Platform Features
order: 2
---

## Overview

The discussions feature provides threaded message boards throughout the platform. Threads can be scoped to a specific context (e.g. a product, an organization, or a general topic) and support nested replies.

## Thread types

| Type      | Scope                      | Who can post                                        |
| --------- | -------------------------- | --------------------------------------------------- |
| `GENERAL` | Platform-wide              | All authenticated users                             |
| `PRODUCT` | Tied to a specific product | Suppliers and nonprofits involved with that product |
| `ORG`     | Tied to an organization    | Members of that organization + admins               |

> **Info:** Moderation
> Admins can delete any message or thread. Suppliers and nonprofits can only delete their own posts.

## Starting a new thread

1. **Navigate to the Discussions page** - Found at `/discussion` in the main navigation.
2. **Click New Thread** - Choose a thread type and optionally link it to a product or organization.
3. **Write your message** - The first message in the thread becomes the root post. Others can reply to it.

## Creating a thread via server action

```tsx
// src/app/discussion/actions.ts
'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function createThread(title: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  return prisma.discussionThread.create({
    data: {
      title,
      posts: {
        create: { content: body, authorId: session.user.id },
      },
    },
  });
}
```

> **Warning:** Cascade deletes
> Deleting a thread removes all posts within it. This is enforced at the database level via `onDelete: Cascade` in the Prisma schema.
