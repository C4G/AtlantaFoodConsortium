import { Html } from '@react-email/components';
import * as React from 'react';

export interface AnnouncementNotificationProps {
  recipientName: string;
  title: string;
  content: string;
  authorName: string;
}

export default function AnnouncementNotification({
  recipientName,
  title,
  content,
  authorName,
}: AnnouncementNotificationProps) {
  return (
    <Html>
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h1 style={{ color: '#1a365d', marginBottom: '20px' }}>
          📢 New Announcement
        </h1>

        <p>Hello {recipientName},</p>
        <p>
          A new announcement has been posted on the Metro Atlanta Food
          Consortium platform.
        </p>

        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0',
          }}
        >
          <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>{title}</h2>
          <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{content}</p>
        </div>

        <p style={{ fontSize: '13px', color: '#718096' }}>
          Posted by <strong>{authorName}</strong>
        </p>

        <p style={{ marginTop: '30px' }}>
          Best regards,
          <br />
          Metro Atlanta Food Consortium
        </p>
      </div>
    </Html>
  );
}
