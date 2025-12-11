import { Html } from '@react-email/components';
import * as React from 'react';

import { PickupTimeframe } from '../../types/types';

export interface ProductRequestAvailableNotificationProps {
  nonprofitName: string;
  supplierName: string;
  productName: string;
  quantity: number;
  unit: string;
  description: string;
  pickupDate: string;
  pickupLocation: string;
  pickupTimeframe: PickupTimeframe[];
  pickupInstructions: string;
  supplierContactEmail: string;
  supplierContactNumber?: string;
}

const formatTimeframe = (timeframe: PickupTimeframe): string => {
  switch (timeframe) {
    case 'MORNING':
      return '7 AM - 10 AM';
    case 'MID_DAY':
      return '10 AM - 2 PM';
    case 'AFTERNOON':
      return '2 PM - 5 PM';
    default:
      return timeframe;
  }
};

export default function ProductRequestAvailableNotification({
  nonprofitName,
  supplierName,
  productName,
  quantity,
  unit,
  description,
  pickupDate,
  pickupLocation,
  pickupTimeframe,
  pickupInstructions,
  supplierContactEmail,
  supplierContactNumber = 'Not provided',
}: ProductRequestAvailableNotificationProps) {
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
          New Product Available
        </h1>

        <p>Dear {nonprofitName},</p>

        <p>
          A new product has been made available by{' '}
          <strong>{supplierName}</strong> that matches your organization&apos;s
          interests.
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
            {pickupTimeframe.map(formatTimeframe).join(', ')}
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
            Contact Information:
          </h2>
          <p>For any questions or coordination, please contact the supplier:</p>
          <p>
            <strong>Email:</strong>{' '}
            <a
              href={`mailto:${supplierContactEmail}`}
              style={{ color: '#3182ce' }}
            >
              {supplierContactEmail}
            </a>
          </p>
          <p>
            <strong>Phone:</strong> {supplierContactNumber}
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
