/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, requireRole } from '@/lib/api-auth';
import { auth } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the session when the user is authenticated', async () => {
    const mockSession = { user: { id: 'user-1', role: 'ADMIN' } };
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    const result = await requireAuth();

    expect(result.session).toEqual(mockSession);
    expect(result.error).toBeUndefined();
  });

  it('should return a 401 response when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await requireAuth();
    const response = result.error!;

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return a 401 response when the session has no user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: null } as any);

    const result = await requireAuth();
    const response = result.error!;

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });
});

describe('requireRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the session when the user has an allowed role', async () => {
    const mockSession = { user: { id: 'user-1', role: 'ADMIN' } };
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    const result = await requireRole('ADMIN', 'STAFF');

    expect(result.session).toEqual(mockSession);
    expect(result.error).toBeUndefined();
  });

  it('should return the session when one of multiple allowed roles matches', async () => {
    const mockSession = { user: { id: 'user-2', role: 'STAFF' } };
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    const result = await requireRole('ADMIN', 'STAFF');

    expect(result.session).toEqual(mockSession);
    expect(result.error).toBeUndefined();
  });

  it('should accept a SUPPLIER when SUPPLIER is in the allowed roles list', async () => {
    const mockSession = { user: { id: 'user-3', role: 'SUPPLIER' } };
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    const result = await requireRole('ADMIN', 'STAFF', 'SUPPLIER');

    expect(result.session).toEqual(mockSession);
    expect(result.error).toBeUndefined();
  });

  it('should accept a NONPROFIT when NONPROFIT is in the allowed roles list', async () => {
    const mockSession = { user: { id: 'user-4', role: 'NONPROFIT' } };
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    const result = await requireRole('ADMIN', 'NONPROFIT');

    expect(result.session).toEqual(mockSession);
    expect(result.error).toBeUndefined();
  });

  it('should return a 401 response when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await requireRole('ADMIN');
    const response = result.error!;

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return a 401 response when the session has no user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: null } as any);

    const result = await requireRole('ADMIN');
    const response = result.error!;

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return a 403 response when the user role is not in the allowed list', async () => {
    const mockSession = { user: { id: 'user-5', role: 'NONPROFIT' } };
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    const result = await requireRole('ADMIN', 'STAFF');
    const response = result.error!;

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toEqual({ error: 'Forbidden' });
  });

  it('should return a 403 response when a SUPPLIER tries to access an ADMIN-only route', async () => {
    const mockSession = { user: { id: 'user-6', role: 'SUPPLIER' } };
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    const result = await requireRole('ADMIN');
    const response = result.error!;

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toEqual({ error: 'Forbidden' });
  });

  it('should return a 403 response when a NONPROFIT tries to access a SUPPLIER route', async () => {
    const mockSession = { user: { id: 'user-7', role: 'NONPROFIT' } };
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    const result = await requireRole('ADMIN', 'STAFF', 'SUPPLIER');
    const response = result.error!;

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data).toEqual({ error: 'Forbidden' });
  });
});
