/**
 * Shared constants and state utilities for the E2E test suite.
 *
 * All test data is prefixed with E2E_PREFIX so globalTeardown can find
 * and delete it reliably without touching real data.
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Test constants ────────────────
export const E2E_PREFIX = 'e2e-test';

export const TEST_ADMIN_EMAIL = `${E2E_PREFIX}-admin@test.local`;
export const TEST_SUPPLIER_EMAIL = `${E2E_PREFIX}-supplier@test.local`;
export const TEST_NONPROFIT_EMAIL = `${E2E_PREFIX}-nonprofit@test.local`;

export const TEST_SUPPLIER_NAME = `${E2E_PREFIX} Supplier Co`;
export const TEST_NONPROFIT_NAME = `${E2E_PREFIX} Nonprofit Org`;

/** product name used across supplier -> nonprofit -> verification tests */
export const TEST_PRODUCT_NAME = 'E2E Test Fresh Vegetables';

/**
 * A second product seeded directly in the DB by globalSetup.
 * specifically for edge cases to assert on
 */
export const EDGE_CASE_PRODUCT_NAME = 'E2E Edge Case Product';

const STATE_DIR = path.join(process.cwd(), 'e2e', '.state');
const STATE_FILE = path.join(STATE_DIR, 'test-state.json');

/**
 * IDs written by globalSetup and supplemented by test specs.
 * postedProductId is set by the supplier spec after creating a product.
 */
export interface TestState {
  adminUserId: string;
  supplierUserId: string;
  supplierId: string;
  nonprofitUserId: string;
  nonprofitId: string;
  postedProductId?: string;
}

export function readState(): TestState {
  if (!fs.existsSync(STATE_FILE)) {
    throw new Error(
      `Test state file not found at ${STATE_FILE}. Did globalSetup run?`
    );
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as TestState;
}

export function writeState(patch: Partial<TestState>): void {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  const current: Partial<TestState> = fs.existsSync(STATE_FILE)
    ? (JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as TestState)
    : {};
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify({ ...current, ...patch }, null, 2)
  );
}

export function clearStateFile(): void {
  if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
}
