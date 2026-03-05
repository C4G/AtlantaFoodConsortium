/* eslint-disable */

export type DateTime = string; // ISO 8601 string

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  SUPPLIER = 'SUPPLIER',
  NONPROFIT = 'NONPROFIT',
}

export enum ItemType {
  PROTEIN = 'PROTEIN',
  PRODUCE = 'PRODUCE',
  SHELF_STABLE = 'SHELF_STABLE',
  SHELF_STABLE_INDIVIDUAL_SERVING = 'SHELF_STABLE_INDIVIDUAL_SERVING',
  ALREADY_PREPARED_FOOD = 'ALREADY_PREPARED_FOOD',
  OTHER = 'OTHER',
}

export enum SupplierCadence {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  TBD = 'TBD',
}

export enum MeasurementUnit {
  POUNDS = 'POUNDS',
  OUNCES = 'OUNCES',
  GALLONS = 'GALLONS',
  QUARTS = 'QUARTS',
  PINTS = 'PINTS',
  LITERS = 'LITERS',
  KILOGRAMS = 'KILOGRAMS',
  COUNT = 'COUNT',
  CASES = 'CASES',
  BAGS = 'BAGS',
  BOXES = 'BOXES',
  BOTTLES = 'BOTTLES',
  JARS = 'JARS',
  CANS = 'CANS',
  SERVINGS = 'SERVINGS',
}

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  PENDING = 'PENDING',
}

export enum PickupTimeframe {
  MORNING = 'MORNING', // 7 AM - 10 AM
  MID_DAY = 'MID_DAY', // 10 AM - 2 PM
  AFTERNOON = 'AFTERNOON', // 2 PM - 5 PM
}

export enum NonprofitOrganizationType {
  FOOD_BANK = 'FOOD_BANK',
  PANTRY = 'PANTRY',
  STUDENT_PANTRY = 'STUDENT_PANTRY',
  FOOD_RESCUE = 'FOOD_RESCUE',
  AGRICULTURE = 'AGRICULTURE',
  OTHER = 'OTHER',
  PLACEHOLDER = 'Select Organization Type',
}

export enum ProteinType {
  FRESH = 'FRESH',
  FROZEN = 'FROZEN',
  BEEF = 'BEEF',
  SEAFOOD = 'SEAFOOD',
  POULTRY = 'POULTRY',
  OTHER = 'OTHER',
}

export enum DonateOrPurchase {
  DONATIONS = 'DONATIONS',
  BUDGET_TO_PURCHASE = 'BUDGET_TO_PURCHASE',
}

export interface User {
  id: string;
  name: string | null;
  title: string | null;
  email: string;
  emailVerified: Date | null;
  phoneNumber: string | null;
  supplierId: string | null;
  nonprofitId: string | null;
  website: string | null;
  image: string | null;
  productSurveyId: string | null;
  role: UserRole | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  users: User[];
  cadence: SupplierCadence;
  createdAt: Date;
  updatedAt: Date;
}

export interface Nonprofit {
  id: string;
  name: string;
  users: User[];
  organizationType: NonprofitOrganizationType;
  nonprofitDocumentId: string;
  nonprofitDocumentApproval: boolean;
  coldStorageSpace: boolean;
  shelfSpace: boolean;
  donationsOrPurchases: DonateOrPurchase[];
  transportationAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductType {
  id: string;
  protein: boolean | null;
  proteinTypes: ProteinType[];
  otherProteinType: string | null;
  produce: boolean | null;
  produceType: string | null;
  shelfStable: boolean | null;
  shelfStableType: string | null;
  shelfStableIndividualServing: boolean | null;
  shelfStableIndividualServingType: string | null;
  alreadyPreparedFood: boolean | null;
  alreadyPreparedFoodType: string | null;
  other: boolean | null;
  otherType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRequest {
  id: string;
  name: string;
  unit: MeasurementUnit;
  quantity: number;
  description: string;
  status: ProductStatus;
  supplierId: string;
  claimedById: string | null;
  productTypeId: string;
  productType: ProductType;
  pickupInfoId: string | null;
  pickupInfo: PickupInfo | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductTypeInfo {
  id: string;
  protein: boolean | null;
  proteinTypes: ProteinType[];
  otherProteinType: string | null;
  produce: boolean | null;
  produceType: string | null;
  shelfStable: boolean | null;
  shelfStableType: string | null;
  shelfStableIndividualServing: boolean | null;
  shelfStableIndividualServingType: string | null;
  alreadyPreparedFood: boolean | null;
  alreadyPreparedFoodType: string | null;
  other: boolean | null;
  otherType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PickupInfo {
  id: string;
  pickupDate: Date;
  pickupTimeframe: PickupTimeframe[];
  pickupLocation: string;
  pickupInstructions: string;
  contactName: string;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NonprofitDocument {
  id: string;
  fileName: string;
  fileData?: Buffer | null; // present only for legacy records
  filePath?: string | null; // present for all new uploads
  fileType: string;
  uploadedAt: Date;
  nonprofitId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInterests {
  id: string;
  protein: boolean | null;
  proteinTypes: ProteinType[];
  otherProteinType: string | null;
  produce: boolean | null;
  produceType: string | null;
  shelfStable: boolean | null;
  shelfStableType: string | null;
  shelfStableIndividualServing: boolean | null;
  shelfStableIndividualServingType: string | null;
  alreadyPreparedFood: boolean | null;
  alreadyPreparedFoodType: string | null;
  other: boolean | null;
  otherType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Form Types
export interface NonprofitRegistrationForm {
  name: string;
  organizationType: NonprofitOrganizationType;
  coldStorageSpace: boolean;
  shelfSpace: boolean;
  donationsOrPurchases: DonateOrPurchase[];
  transportationAvailable: boolean;
}

export interface ProductRequestForm {
  name: string;
  unit: MeasurementUnit;
  quantity: number;
  description: string;
  productType: ProductTypeInfo;
  pickupInfo: PickupInfo;
}

// Email Types
export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}
