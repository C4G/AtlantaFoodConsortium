export interface ClaimedProduct {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  status: string;
  productType: {
    id: string;
    protein: boolean;
    produce: boolean;
    shelfStable: boolean;
  };
  pickupInfo: {
    pickupDate: string;
    pickupLocation: string;
    contactName?: string;
    contactPhone?: string;
    pickupTimeframe?: string[];
    pickupInstructions?: string;
  };
}

export interface Nonprofit {
  id: string;
  name: string;
  organizationType: string;
  productsClaimed: ClaimedProduct[];
  nonprofitDocumentApproval?: boolean | null;
}

export interface ExtendedUser {
  nonprofitId?: string;
  productSurveyId?: string;
  role?: string;
}

export interface NonprofitMetrics {
  monthlyTimeline: Array<{ month: string; count: number }>;
  typeBreakdown: {
    protein: number;
    produce: number;
    shelfStable: number;
    shelfStableIndividualServing: number;
    alreadyPreparedFood: number;
    other: number;
  };
  upcomingPickups: Array<{ id: string; name: string; pickupDate: string }>;
  matchScore: {
    protein: number;
    produce: number;
    shelfStable: number;
    shelfStableIndividualServing: number;
    alreadyPreparedFood: number;
    other: number;
  };
  availabilityTrends: Array<{ date: string; count: number }>;
  totalClaimed: number;
}

export interface ProductInterest {
  id: string;
  protein: boolean;
  proteinTypes: string[];
  produce: boolean;
  produceType: string;
  shelfStable: boolean;
  shelfStableType: string;
  shelfStableIndividualServing: boolean;
  shelfStableIndividualServingType: string;
  alreadyPreparedFood: boolean;
  alreadyPreparedFoodType: string;
  other: boolean;
  otherType: string;
}

export interface ProductRequest {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  description: string;
  status: string;
  perishable: boolean;
  expirationDate?: string;
  createdAt: string;
  productType: {
    id: string;
    protein: boolean;
    proteinTypes: string[];
    produce: boolean;
    produceType: string;
    shelfStable: boolean;
    shelfStableType: string;
  };
  supplier: {
    id: string;
    name: string;
  };
  pickupInfo: {
    pickupDate: string;
    pickupLocation: string;
    pickupTimeframe: string[];
    contactName: string;
    contactPhone: string;
    pickupInstructions: string;
  };
}
