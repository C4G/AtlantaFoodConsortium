import { NonprofitDocument } from '../../../../types/types';

// Extends the existing NonprofitDocument type with nonprofit relation
export interface AdminNonprofitDocument extends NonprofitDocument {
  nonprofit?: { id: string; name: string; organizationType: string };
}

export interface AnalyticsData {
  distribution: {
    distribution: Record<string, number>;
    proteinTypes: Record<string, number>;
  };
  trends: {
    trends: Array<{
      date: string;
      AVAILABLE: number;
      RESERVED: number;
      PENDING: number;
    }>;
  };
  supplierActivity: {
    activity: Array<{
      supplierId: string;
      name: string;
      cadence: string;
      productCount: number;
    }>;
    cadenceBreakdown: Record<string, number>;
  };
  nonprofitEngagement: {
    engagement: Array<{
      nonprofitId: string;
      name: string;
      organizationType: string;
      claimedCount: number;
      approvalStatus: boolean | null;
    }>;
    orgTypeBreakdown: Record<string, number>;
    approvalBreakdown: { approved: number; pending: number; rejected: number };
  };
  systemHealth: {
    totalUsers: number;
    usersByRole: Record<string, number>;
    totalSuppliers: number;
    totalNonprofits: number;
    totalProducts: number;
    productsByStatus: { AVAILABLE: number; RESERVED: number; PENDING: number };
    avgClaimTimeHours: number;
    approvalRate: number;
  };
  claimsOverTime: {
    timeline: Array<{ month: string; count: number }>;
  };
}

export type ApprovalMode =
  | 'approve'
  | 'reject'
  | 'reverse-approve'
  | 'reverse-reject';
