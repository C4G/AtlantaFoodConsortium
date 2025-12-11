import { Html } from '@react-email/components';
import * as React from 'react';
import { PickupTimeframe } from '../../types/types';

export interface ProductRequestClaimedNotificationProps {
  supplierName: string;
  nonprofitName: string;
  productName: string;
  quantity: number;
  unit: string;
  description: string;
  pickupDate: string;
  pickupLocation: string;
  pickupTimeframe: string[];
  pickupInstructions: string;
  nonprofitContactEmail: string;
  nonprofitContactNumber: string;
}

const getTimeWindowDisplay = (timeframe: string): string => {
  switch (timeframe) {
    case PickupTimeframe.MORNING:
      return '7 AM - 10 AM';
    case PickupTimeframe.MID_DAY:
      return '10 AM - 2 PM';
    case PickupTimeframe.AFTERNOON:
      return '2 PM - 5 PM';
    default:
      return timeframe;
  }
};

export default function ProductRequestClaimedNotification({
  supplierName,
  nonprofitName,
  productName,
  quantity,
  unit,
  description,
  pickupDate,
  pickupLocation,
  pickupTimeframe,
  pickupInstructions,
  nonprofitContactEmail,
  nonprofitContactNumber,
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
            Pickup Information:
          </h2>
          <p>
            <strong>Date:</strong> {new Date(pickupDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Location:</strong> {pickupLocation}
          </p>
          <p>
            <strong>Time Window:</strong>{' '}
            {pickupTimeframe.map(getTimeWindowDisplay).join(', ')}
          </p>
          <p>
            <strong>Instructions:</strong> {pickupInstructions}
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
