import NextAuth, { type NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { resend } from './resend';
import EmailProvider from 'next-auth/providers/nodemailer';
import Google from 'next-auth/providers/google';
import type { User } from '@prisma/client';
import { UserRole } from '../../types/types';

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    EmailProvider({
      name: 'Email',
      server: 'c4g.dev',
      from: 'Atlanta Food Consortium <no-reply@c4g.dev>',
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.role = (user as User).role;
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.OTHER },
      });
    },
  },
};

async function sendVerificationRequest(params: {
  identifier: string;
  url: string;
}) {
  const { identifier: to, url } = params;
  const { host } = new URL(url);

  const result = await resend.emails.send({
    to: to,
    from: 'Atlanta Food Consortium <no-reply@c4g.dev>',
    subject: `Sign in to ${host}`,
    text: 'Copy and paste this link to sign in:\n' + url,
    html: `Click this link to sign in:\n<br/>\n<a href="${url}">${url}</a>`,
  });

  if (result.error !== null) {
    console.log(result.error);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
