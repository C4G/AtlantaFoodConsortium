import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NonprofitRegistrationStatusNotification from '@/emails/NonprofitRegistrationStatusNotification';
import { render } from '@react-email/render';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nonprofitId, approved } = await request.json();

    if (!nonprofitId || approved === undefined) {
      return NextResponse.json(
        { error: 'Nonprofit ID and approval status are required' },
        { status: 400 }
      );
    }

    const nonprofit = await prisma.nonprofit.findUnique({
      where: { id: nonprofitId },
      include: {
        users: true,
      },
    });

    if (!nonprofit) {
      return NextResponse.json(
        { error: 'Nonprofit not found' },
        { status: 404 }
      );
    }

    // Get admin user details
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    if (!approved) {
      // Send rejection email
      const emailHtml = await render(
        NonprofitRegistrationStatusNotification({
          nonprofitName: nonprofit.name,
          isApproved: false,
          adminEmail: adminUser.email,
          adminName: adminUser.name,
        })
      );

      await resend.emails.send({
        from: 'Atlanta Food Consortium <noreply@atlantafoodconsortium.org>',
        to: nonprofit.users.map((user) => user.email),
        subject: 'Nonprofit Registration Status Update',
        html: emailHtml,
      });

      return NextResponse.json({ success: true });
    } else {
      // Send approval email
      const emailHtml = await render(
        NonprofitRegistrationStatusNotification({
          nonprofitName: nonprofit.name,
          isApproved: true,
          adminEmail: adminUser.email,
          adminName: adminUser.name,
        })
      );

      await resend.emails.send({
        from: 'Metro Atlanta Food Consortium <mafc-no-reply@c4g.dev>',
        to: nonprofit.users.map((user) => user.email),
        subject: 'Nonprofit Registration Status Update',
        html: emailHtml,
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error in nonprofit approval:', error);
    return NextResponse.json(
      { error: 'Failed to process nonprofit approval' },
      { status: 500 }
    );
  }
}
