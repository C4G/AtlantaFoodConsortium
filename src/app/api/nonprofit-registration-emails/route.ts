import { NextResponse } from 'next/server';
import React from 'react';
import NonprofitRegistrationNotification from '@/emails/NonprofitRegistrationNotification';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      nonprofitName,
      organizationType,
      nonprofitEmail,
      nonprofitPhone,
      nonprofitWebsite,
    } = await req.json();

    // Validate required fields
    if (!nonprofitName || !organizationType || !nonprofitEmail) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: nonprofitName, organizationType, and nonprofitEmail are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nonprofitEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    if (adminUsers.length === 0) {
      return NextResponse.json(
        { error: 'No admin users found in the system' },
        { status: 404 }
      );
    }

    const emailHtml = React.createElement(NonprofitRegistrationNotification, {
      nonprofitName,
      organizationType,
      nonprofitEmail,
      nonprofitPhone,
      nonprofitWebsite,
    });

    // Send email to all admin users

    const emailRequests = adminUsers.map((adminUser) => {
      return {
        from: 'Metro Atlanta Food Consortium <mafc-no-reply@c4g.dev>',
        to: adminUser.email,
        subject: `New Nonprofit Registration: ${nonprofitName}`,
        react: emailHtml,
      };
    });

    const response = await resend.batch.send(
      emailRequests,
      {
        batchValidation: 'permissive',
      }
    );

    return NextResponse.json({
      success: true,
      data: response,
      message: `Notification sent to ${adminUsers.length} admin users`,
    });
  } catch (error) {
    console.error('Error sending nonprofit registration email:', error);
    return NextResponse.json(
      { error: 'Failed to send nonprofit registration email' },
      { status: 500 }
    );
  }
}
