---
title: Routes
description: Overview of all application routes and their access requirements.
group: Routes
order: 0
---

## Overview

The Atlanta Food Consortium platform is organized into role-specific routes. Each major feature area is protected by Next.js middleware that checks the active session role before rendering.

## Route map

| Route                   | Role required      | Description                                              |
| ----------------------- | ------------------ | -------------------------------------------------------- |
| `/admin`                | `ADMIN`            | Platform management - approve nonprofits, view analytics |
| `/supplier`             | `SUPPLIER`         | Manage product listings and supplier metrics             |
| `/nonprofit`            | Auth + nonprofitId | Browse and claim available food products                 |
| `/users`                | `ADMIN`            | User management table with delete capability             |
| `/discussion`           | Any authenticated  | Community discussion threads                             |
| `/announcements`        | Any authenticated  | Platform announcements - ADMIN can create                |
| `/onboarding/supplier`  | Unauthenticated    | Supplier registration flow (3 steps)                     |
| `/onboarding/nonprofit` | Unauthenticated    | Nonprofit registration flow (4 steps)                    |

## Authentication

All protected routes redirect to the sign-in page if no session exists. Role checks happen server-side in each route's `page.tsx` using `getServerSession`.

> **Middleware:** `src/middleware.ts` handles top-level redirects for unauthenticated users.

## Detailed documentation

Select a route below for full prop, hook, and component details:

- [Admin Route](admin)
- [Supplier Route](supplier)
- [Nonprofit Route](nonprofit)
- [Users Route](users)
- [Discussion Route](discussion)
- [Announcements Route](announcements)
- [Onboarding Route](onboarding)
