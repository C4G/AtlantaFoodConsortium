---
title: Application Flow
description: End-to-end flow diagram covering every role — sign-in, onboarding, admin approvals, supplier product lifecycle, and nonprofit claiming.
group: Platform
order: 0
---

## Full Platform Flow Diagram

The diagram below traces every path through the application from initial sign-in through all role-specific actions and cross-role interactions.

**Color legend:**

| Color         | Meaning                  |
| ------------- | ------------------------ |
| 🔵 Dark blue  | Role actor / entry point |
| ⬜ Light grey | Action / UI page         |
| 🟡 Yellow     | Decision node            |
| 🟢 Green      | Email sent               |
| 🔵 Sky blue   | Status label             |
| 🔴 Red        | Gate / blocked state     |
| 🟣 Purple     | Database write           |

---

![Application Flow Diagram](/flow.svg)

---

## Flow Summary by Role

### Admin (`/admin`)

1. Reviews pending nonprofit registrations — downloads the uploaded 501c3 document
2. **Approves** → `nonprofitDocumentApproval = true` → approval email sent to all nonprofit users in that org
3. **Rejects** → `nonprofitDocumentApproval = false` → rejection email sent
4. Manages suppliers (create / edit / delete) and views all product requests
5. Posts announcements targeted at All / Supplier / Nonprofit users

### Supplier (`/supplier`)

1. Completes onboarding (company name, donation cadence) → lands on dashboard immediately (no approval gate)
2. Creates pickup requests — each item becomes a `ProductRequest` with `status = AVAILABLE`
3. A batch email fires to all **approved** nonprofits whose `productInterests` match the product category
4. Monitors the pickup request table as statuses change from `AVAILABLE → RESERVED`

### Nonprofit (`/nonprofit`)

1. Completes onboarding (org details, storage capacity, product interests, 501c3 upload)
2. Lands on an **approval gate** — claim button is disabled until admin approves
3. If rejected, can re-upload the document (resets approval to `null` and re-notifies admins)
4. Once approved — browses available products and clicks **Claim This Product**
5. `status` changes to `RESERVED`, supplier receives an email with the nonprofit's pickup info and contact details

### All Authenticated Users

- Access `/discussion` for threaded community discussions
- Access `/announcements` for platform-wide notices
