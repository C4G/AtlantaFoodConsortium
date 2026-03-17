---
title: Features Documentation
description: Developer documentation for all platform features. Drop a markdown file in content/docs/ to instantly create a new page.
order: 0
---

## Quick Start

- [Getting Started](/documentation/features/getting-started) - How to write your first feature doc.
- [Markdown Reference](/documentation/features/schema-reference) - Formatting guide and syntax cheatsheet.
- [Announcements](/documentation/features/announcements) - How the platform announcement system works.
- [Discussions](/documentation/features/discussions) - How threaded discussions work.

## How It Works

1. **Create a `.md` file** inside `content/docs/`. The filename becomes the URL slug - e.g. `my-feature.md` → `/documentation/features/my-feature`.
2. **Add frontmatter** at the top with `title`, and optionally `description`, `group`, and `order`.
3. **Write in Markdown** - headings, paragraphs, tables, code blocks, lists, blockquotes - all standard GFM.
4. **The page appears automatically** - the sidebar and navigation update immediately with no code changes.

## Frontmatter fields

| Field         | Type   | Required | Description                                                  |
| ------------- | ------ | -------- | ------------------------------------------------------------ |
| `title`       | string | Yes      | Page heading shown in the sidebar and at the top of the page |
| `description` | string | No       | Short subtitle shown below the title                         |
| `group`       | string | No       | Sidebar group/folder name. Omit for top-level pages          |
| `order`       | number | No       | Sort order within its group. Lower = higher. Default: 999    |
