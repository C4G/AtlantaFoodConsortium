import { Html } from '@react-email/components';
import * as React from 'react';

interface NonprofitRegistrationNotificationProps {
  nonprofitName: string;
  organizationType: string;
  nonprofitEmail: string;
  nonprofitPhone?: string;
  nonprofitWebsite?: string;
}

export default function NonprofitRegistrationNotification({
  nonprofitName,
  organizationType,
  nonprofitEmail,
  nonprofitPhone,
  nonprofitWebsite,
}: NonprofitRegistrationNotificationProps) {
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
          New Nonprofit Registration
        </h1>

        <p>
          A new nonprofit has registered on the Metro Atlanta Food Consortium
          platform.
        </p>

        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0',
          }}
        >
          <h2 style={{ color: '#2d3748', marginBottom: '15px' }}>
            Organization Details:
          </h2>
          <p>
            <strong>Name:</strong> {nonprofitName}
          </p>
          <p>
            <strong>Type:</strong> {organizationType}
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${nonprofitEmail}`} style={{ color: '#3182ce' }}>
              {nonprofitEmail}
            </a>
          </p>
          {nonprofitPhone && (
            <p>
              <strong>Phone:</strong> {nonprofitPhone}
            </p>
          )}
          {nonprofitWebsite && (
            <p>
              <strong>Website:</strong>{' '}
              <a href={nonprofitWebsite} style={{ color: '#3182ce' }}>
                {nonprofitWebsite}
              </a>
            </p>
          )}
        </div>

        <p>
          Please review their registration and take appropriate action using the
          admin page.
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
