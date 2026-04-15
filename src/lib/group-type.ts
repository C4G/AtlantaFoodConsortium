import type { GroupType as PrismaGroupType } from '../generated/prisma/client';

// Define a runtime constant object that satisfies the Prisma type
export const Group = {
  ALL: 'ALL',
  ADMIN: 'ADMIN',
  SUPPLIER: 'SUPPLIER',
  NONPROFIT: 'NONPROFIT',
} satisfies Record<PrismaGroupType, PrismaGroupType>;

// Export the type alias for convenience in client components
export type GroupType = (typeof Group)[keyof typeof Group];
