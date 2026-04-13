---
title: Debugging with Playwright
description: How to use the Playwright UI and debug modes to inspect and step through end-to-end tests.
group: Testing
order: 1
---

## Overview

The project ships two Playwright modes beyond a plain `test:e2e` run that make it much easier to develop and debug end-to-end tests: **UI mode** and **Debug mode**.

---

## UI Mode — `npm run test:e2e:ui`

UI mode opens a visual browser interface where you can browse all test files, run individual tests, and watch each step execute in real time.

```bash
npm run test:e2e:ui
```

### What you get

- **Test explorer** — sidebar lists every spec file and test; click any to run just that one.
- **Timeline scrubber** — replay every action step-by-step after a run, with before/after DOM snapshots.
- **Live browser** — watch the actual browser execute the test in the right-hand panel.
- **Trace viewer built in** — no need to open a separate trace file; it's all inline.
- **Watch mode** — tests re-run automatically when you save a spec file.

### Typical workflow

1. Start UI mode:
   ```bash
   npm run test:e2e:ui
   ```
2. Click a test in the left panel to run it.
3. If it fails, click the failing step in the timeline to see the DOM snapshot at that exact moment.
4. Edit your spec or source code — the test re-runs automatically.

---

## Debug Mode — `npm run test:e2e:debug`

Debug mode runs tests headed (visible browser) and pauses execution at the start so you can step through actions one at a time using the **Playwright Inspector**.

```bash
npm run test:e2e:debug
```

### What you get

- **Playwright Inspector** — a floating control panel that shows the current action, lets you step forward, and highlights the targeted element in the browser.
- **`page.pause()` breakpoints** — add `await page.pause()` anywhere in a spec to halt execution at that exact line.
- **Live locator picker** — click the crosshair icon in the Inspector to point at any element and get its recommended locator string.
- **Console output** — browser console logs stream in real time alongside the Inspector.

### Typical workflow

1. Add a `page.pause()` where you want to break:
   ```ts
   await page.click('button[type="submit"]');
   await page.pause(); // execution stops here
   await page.waitForURL('/dashboard');
   ```
2. Start debug mode:
   ```bash
   npm run test:e2e:debug
   ```
3. The browser opens and the Inspector appears. Click **Resume** to run until the next `page.pause()`, or **Step over** to advance one action at a time.
4. Remove `page.pause()` calls before committing.

### Run a single test in debug mode

```bash
npx playwright test e2e/tests/01-admin-approve-nonprofit.spec.ts --debug
```

---

## Running a specific test file

Both modes accept a file path or test title filter:

```bash
# UI mode, scoped to one file
npx playwright test e2e/tests/03-nonprofit-claim-product.spec.ts --ui

# Debug mode, scoped by test name
npx playwright test --debug -g "admin approves nonprofit"
```

---

## Viewing traces after a failed CI run

When tests run in CI (`test:e2e`), traces are saved on failure. Download the artifact and open it locally:

```bash
npx playwright show-trace path/to/trace.zip
```

---

## Quick reference

| Command                              | What it does                                   |
| ------------------------------------ | ---------------------------------------------- |
| `npm run test:e2e`                   | Headless run, all tests                        |
| `npm run test:e2e:ui`                | Visual UI mode with timeline scrubber          |
| `npm run test:e2e:debug`             | Headed + Playwright Inspector, pauses at start |
| `npx playwright test <file> --debug` | Debug a single spec file                       |
| `npx playwright show-trace <file>`   | Open a saved trace zip                         |
