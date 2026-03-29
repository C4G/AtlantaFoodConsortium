---
title: Markdown Reference
description: Everything you can use when writing documentation pages - syntax guide and examples.
group: Introduction
order: 2
---

## Text and headings

Use `#` through `####` for headings. A `##` heading renders with a bottom border as a section divider.

Regular paragraphs are just plain text. Leave a blank line between paragraphs.

**Bold** text uses `**double asterisks**`. _Italic_ uses `*single asterisks*`. Inline `code` uses backticks.

## Code blocks

Fenced code blocks with a language identifier get syntax highlighting:

```typescript
const greeting = (name: string) => `Hello, ${name}!`;
```

```bash
npm install my-package
```

```json
{ "key": "value", "count": 42 }
```

## Callouts (blockquotes)

Use `>` blockquotes for callout-style notes:

> **Info:** General information or context the reader should know.

> **Tip:** A suggestion or best practice.

> **Warning:** Something the reader should be cautious about.

> **Danger:** Destructive actions, breaking changes, or security risks.

## Tables

Use GFM pipe tables:

| Column A | Column B | Column C |
| -------- | -------- | -------- |
| Row 1, A | Row 1, B | Row 1, C |
| Row 2, A | Row 2, B | Row 2, C |

Inline `code` works inside table cells.

## Lists

Unordered list with `-` or `*`:

- Item one
- Item two
  - Nested item
- Item three

Ordered list with numbers:

1. First step
2. Second step
3. Third step

## Links

- Internal: `[Getting Started](/documentation/features/getting-started)`
- External: `[Recharts](https://recharts.org)` - opens in a new tab automatically

## Horizontal rule

Use `---` on its own line to add a divider between major sections.

---

That's everything above the line.
