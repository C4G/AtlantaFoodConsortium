import { MeasurementUnit, ProductRequest } from '../../../../types/types';

export interface ProductDetails {
  specifics: string;
  condition?: 'frozen' | 'fresh' | '';
  units: MeasurementUnit;
  quantity: string;
  name: string;
  description: string;
}

export interface FormData {
  productTypes: string[];
  productDetails: {
    [key: string]: ProductDetails;
  };
  pickupDate: string;
  pickupLocation: string;
  availabilityTimeframe: string;
  mainContactName: string;
  mainContactNumber: string;
  instructions: string;
}

export interface SupplierMetrics {
  statusBreakdown: { AVAILABLE: number; RESERVED: number; PENDING: number };
  claimSpeeds: {
    within24h: number;
    within48h: number;
    within1week: number;
    moreThan1week: number;
  };
  monthlyTimeline: Array<{ month: string; count: number; quantity: number }>;
  typeBreakdown: {
    protein: number;
    produce: number;
    shelfStable: number;
    shelfStableIndividualServing: number;
    alreadyPreparedFood: number;
    other: number;
  };
  totalProducts: number;
}

export interface SupplierRowData {
  foodName: string;
  foodType: string;
  foodStatus: string;
  foodClaimer: string;
  foodId: string;
  supplierId: string;
  prod: ProductRequest;
}

export const initialFormState: FormData = {
  productTypes: [],
  productDetails: {},
  pickupDate: '',
  pickupLocation: '',
  availabilityTimeframe: '',
  mainContactName: '',
  mainContactNumber: '',
  instructions: '',
};
