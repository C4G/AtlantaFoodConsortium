---
title: Getting Started
description: Learn how to create your first feature documentation page using a markdown file.
group: Introduction
order: 1
---

## Overview

Every page in this docs section is powered by a plain `.md` file. Drop a file in `content/docs/` and you instantly get a fully rendered, navigable doc page with syntax highlighting, tables, and more - no code changes needed.

> **Where do files go?**
> All `.md` files live in `content/docs/` at the project root. Use sub-folders to group related pages - e.g. `content/docs/admin/users.md` → `/documentation/features/admin/users`.

## Creating your first page

1. **Create the file** - Add a new `.md` file inside `content/docs/`. The filename becomes the URL slug, e.g. `my-feature.md` → `/documentation/features/my-feature`.
2. **Add frontmatter** - At minimum you need `title`. Add `description`, `group`, and `order` to control sidebar placement.
3. **Write your content** - Use standard Markdown: headings, paragraphs, code blocks, tables, lists.
4. **Save and refresh** - The page appears in the sidebar automatically. No server restart needed in development.

## Minimal example

```markdown
---
title: My Feature
description: A short description shown under the title.
group: Core Features
order: 5
---

## Overview

Explain what this feature does here.

> **Tip:** Use blockquotes for callout-style notes.
```

## Frontmatter fields

| Field         | Type   | Required | Description                                                  |
| ------------- | ------ | -------- | ------------------------------------------------------------ |
| `title`       | string | Yes      | Page heading shown in the sidebar and at the top of the page |
| `description` | string | No       | Short subtitle shown below the title                         |
| `group`       | string | No       | Sidebar group/folder name. Omit for top-level pages          |
| `order`       | number | No       | Sort order within its group. Lower = higher. Default: 999    |
