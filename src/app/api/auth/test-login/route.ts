import { type NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

const TEST_EMAILS: Record<string, string> = {
  admin: 'test-admin@afc.dev',
  supplier: 'test-supplier@afc.dev',
  nonprofit: 'test-nonprofit@afc.dev',
  other: 'test-other@afc.dev',
};

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role')?.toLowerCase();
  const email = role ? TEST_EMAILS[role] : null;

  if (!email) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(
      { error: 'Test user not found. Run db:seed first.' },
      { status: 404 }
    );
  }

  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  });

  const cookieStore = await cookies();
  const isSecure = process.env.NODE_ENV === 'production';
  cookieStore.set(
    isSecure ? '__Secure-authjs.session-token' : 'authjs.session-token',
    sessionToken,
    {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires,
      secure: isSecure,
    }
  );

  redirect('/');
}
