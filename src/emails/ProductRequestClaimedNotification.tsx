import { Html } from 'react-email';
import * as React from 'react';

export interface ProductRequestClaimedNotificationProps {
  supplierName: string;
  nonprofitName: string;
  productName: string;
  quantity: number;
  unit: string;
  description: string;
  nonprofitContactEmail: string;
  nonprofitContactNumber: string;
  // Nonprofit-provided pickup contact (collected at claim time)
  nonprofitPickupContactName?: string;
  nonprofitPickupContactPhone?: string;
  nonprofitPickupDate?: string;
  nonprofitPickupTimeframe?: string[];
}

export default function ProductRequestClaimedNotification({
  supplierName,
  nonprofitName,
  productName,
  quantity,
  unit,
  description,
  nonprofitContactEmail,
  nonprofitContactNumber,
  nonprofitPickupContactName,
  nonprofitPickupContactPhone,
  nonprofitPickupDate,
  nonprofitPickupTimeframe,
}: ProductRequestClaimedNotificationProps) {
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
          Product Claimed
        </h1>

        <p>Dear {supplierName},</p>

        <p>
          <strong>{nonprofitName}</strong> has claimed your product for pickup.
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
            Product Details:
          </h2>
          <p>
            <strong>Name:</strong> {productName}
          </p>
          <p>
            <strong>Quantity:</strong> {quantity} {unit}
          </p>
          <p>
            <strong>Description:</strong> {description}
          </p>
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
            Nonprofit Contact Information:
          </h2>
          <p>
            For any questions or coordination, please contact the nonprofit:
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a
              href={`mailto:${nonprofitContactEmail}`}
              style={{ color: '#3182ce' }}
            >
              {nonprofitContactEmail}
            </a>
          </p>
          <p>
            <strong>Phone:</strong> {nonprofitContactNumber}
          </p>
        </div>

        {nonprofitPickupContactName && (
          <div
            style={{
              backgroundColor: '#ebf8ff',
              padding: '20px',
              borderRadius: '8px',
              margin: '20px 0',
            }}
          >
            <h2 style={{ color: '#2b6cb0', marginBottom: '15px' }}>
              Nonprofit Pickup Contact:
            </h2>
            <p>
              <strong>Name:</strong> {nonprofitPickupContactName}
            </p>
            {nonprofitPickupContactPhone && (
              <p>
                <strong>Phone:</strong> {nonprofitPickupContactPhone}
              </p>
            )}
            {nonprofitPickupDate && (
              <p>
                <strong>Planned Pickup Date:</strong>{' '}
                {new Date(nonprofitPickupDate).toLocaleDateString()}
              </p>
            )}
            {nonprofitPickupTimeframe &&
              nonprofitPickupTimeframe.length > 0 && (
                <p>
                  <strong>Planned Pickup Time:</strong>{' '}
                  {nonprofitPickupTimeframe
                    .map((t) =>
                      t === 'MORNING'
                        ? '7 AM – 10 AM'
                        : t === 'MID_DAY'
                          ? '10 AM – 2 PM'
                          : t === 'AFTERNOON'
                            ? '2 PM – 5 PM'
                            : t
                    )
                    .join(', ')}
                </p>
              )}
          </div>
        )}

        <p>
          Please ensure the product is ready for pickup at the specified
          location and time.
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
