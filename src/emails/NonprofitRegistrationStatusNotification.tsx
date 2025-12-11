import { Html } from '@react-email/components';
import * as React from 'react';

export interface NonprofitRegistrationStatusNotificationProps {
  nonprofitName: string;
  isApproved: boolean;
  adminEmail: string;
  adminName: string | null;
}

export default function NonprofitRegistrationStatusNotification({
  nonprofitName,
  isApproved,
  adminEmail,
  adminName,
}: NonprofitRegistrationStatusNotificationProps) {
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
          Registration Status Update
        </h1>

        <p>Dear {nonprofitName},</p>

        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0',
          }}
        >
          <h2 style={{ color: '#2d3748', marginBottom: '15px' }}>
            Registration Status
          </h2>
          {isApproved ? (
            <>
              <p style={{ color: '#2f855a' }}>
                <strong>Congratulations!</strong> Your nonprofit registration
                has been approved.
              </p>
              <p>
                You can now access all features of the Metro Atlanta Food
                Consortium platform, including:
              </p>
              <ul style={{ marginLeft: '20px' }}>
                <li>Viewing and claiming available products</li>
                <li>Managing your organization&apos;s profile</li>
              </ul>
            </>
          ) : (
            <>
              <p style={{ color: '#c53030' }}>
                <strong>Registration Update:</strong> Your nonprofit
                registration has not been approved at this time.
              </p>
              <p>This could be due to one or more of the following reasons:</p>
              <ul style={{ marginLeft: '20px' }}>
                <li>Incomplete or unclear documentation</li>
                <li>Missing required information</li>
                <li>Documentation does not meet our requirements</li>
              </ul>
              <p>
                Please review your submitted documentation and reupload your
                501(c)3 documentation on your nonprofit home page to request the
                administrator to re-review your registration.
              </p>
            </>
          )}
        </div>

        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0',
          }}
        >
          <h2 style={{ color: '#2d3748', marginBottom: '15px' }}>
            Contact Information
          </h2>
          <p>
            If you have any questions about this decision, please contact our
            admin team:
          </p>
          <p>
            <strong>Admin:</strong> {adminName || 'Admin Team'}
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${adminEmail}`} style={{ color: '#3182ce' }}>
              {adminEmail}
            </a>
          </p>
        </div>

        <p style={{ marginTop: '30px' }}>
          Best regards,
          <br />
          Metro Atlanta Food Consortium
        </p>
      </div>
    </Html>
  );
}
