/**
 * Centralised tooltip descriptions for every chart and KPI card info icon.
 * Edit text here and it will update everywhere it is displayed.
 */

export const ADMIN_CHART_INFO = {
  // KPI Cards
  totalUsers:
    'Total number of registered accounts across all roles (Admin, Staff, Supplier, Nonprofit).',
  avgClaimTime:
    'Average hours between when a product is posted and when it is claimed by a nonprofit.',
  approvalRate:
    'Percentage of nonprofit registration applications that have been approved out of all decisions made.',
  availableProducts:
    'Number of products currently posted by suppliers that have not yet been claimed by any nonprofit.',

  // Charts
  productTypeDistribution:
    'Breakdown of all posted products by food category. Helps identify which food types suppliers are contributing most.',
  productStatusTrends:
    'How the count of available, reserved, and pending products has changed over time.',
  topSuppliers:
    'Suppliers ranked by the total number of product listings they have posted to the platform.',
  topNonprofits:
    'Nonprofits ranked by how many products they have claimed, showing which organizations are most active.',
  nonprofitOrgTypes:
    'Distribution of registered nonprofits by organization type (e.g. food bank, pantry, food rescue).',
  supplierCadence:
    'How frequently suppliers have committed to posting new products — daily, weekly, biweekly, monthly, or TBD.',
  claimsOverTime:
    'Total number of products claimed by nonprofits each month, reflecting overall platform impact over time.',
} as const;

export const NONPROFIT_CHART_INFO = {
  // KPI Cards
  productsClaimed:
    'Total number of products your organization has claimed from suppliers on this platform.',
  upcomingPickups:
    'Number of claimed products with a scheduled pickup date within the next 30 days.',
  availableProducts:
    'Number of products currently posted by suppliers that your organization can claim right now.',

  // Charts
  productAvailabilityTrend:
    'How many products were available each day over the past month, showing supply trends from local suppliers.',
  monthlyClaimsTimeline:
    'Number of products your organization has claimed each month, tracking your food acquisition over time.',
  interestMatchScore:
    'How well the current available supply matches the food categories your organization indicated as needs in your profile.',
  claimedProductTypes:
    'Breakdown of food categories your organization has claimed, helping track nutritional diversity.',
} as const;

export const SUPPLIER_CHART_INFO = {
  // KPI Cards
  totalProducts:
    'Total number of product listings you have posted to the platform since joining.',
  available:
    'Number of your product listings currently awaiting a claim from a nonprofit.',
  claimed:
    'Number of your product listings claimed by nonprofits (Reserved + Pending pickup).',
  fastClaims:
    'Number of your products claimed within 24 hours of posting — a sign of strong demand.',

  // Charts
  productStatusBreakdown:
    'Current status of all your posted products: available (unclaimed), reserved (claimed), or pending (pickup scheduled).',
  claimSpeed:
    'How quickly nonprofits claim your products after posting. Faster claims mean food is reaching families sooner.',
  productTypeDistribution:
    'Breakdown of the different food categories across your posted products.',
  monthlyTimeline:
    'Number of products you have posted each month, reflecting your contribution to the food network over time.',
} as const;
