import { Html } from '@react-email/components';
import * as React from 'react';

export interface NewThreadNotificationProps {
  recipientName: string;
  threadTitle: string;
  threadContent: string;
  authorName: string;
  groupType: string;
}

export default function NewThreadNotification({
  recipientName,
  threadTitle,
  threadContent,
  authorName,
  groupType,
}: NewThreadNotificationProps) {
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
          💬 New Discussion Thread
        </h1>

        <p>Hello {recipientName},</p>
        <p>
          A new discussion thread has been posted on the Metro Atlanta Food
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
          <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>
            {threadTitle}
          </h2>
          <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{threadContent}</p>
        </div>

        <p style={{ fontSize: '13px', color: '#718096' }}>
          Started by <strong>{authorName}</strong> in the{' '}
          <strong>{groupType}</strong> group
        </p>

        <p>
          Log in to the platform to join the conversation at{' '}
          <strong>/discussion</strong>.
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
