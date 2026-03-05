import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

type UserRole = 'ADMIN' | 'STAFF' | 'SUPPLIER' | 'NONPROFIT';

interface AuthResult {
  session: Session;
  error?: never;
}

interface AuthError {
  session?: never;
  error: NextResponse;
}

/**
 * Verifies the request has a valid session. Returns the session or a 401 response.
 */
export async function requireAuth(): Promise<AuthResult | AuthError> {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session };
}

/**
 * Verifies the request has a valid session AND the user's role is in the allowed list.
 * Returns the session or a 401/403 response.
 */
export async function requireRole(
  ...roles: UserRole[]
): Promise<AuthResult | AuthError> {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  if (!roles.includes(session.user.role as UserRole)) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { session };
}
