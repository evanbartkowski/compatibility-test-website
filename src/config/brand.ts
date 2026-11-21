export interface BrandConfig {
  name: string;
  tagline: string;
  domain: string;
  supportEmail: string;
  minimumAge: number;
  scoringEngineVersion: string;
  communityMinimumThreshold: number;
  cohortSuppressionThreshold: number;
  defaultInviteExpirationHours: number;
  features: {
    enableCommunityComparisons: boolean;
    enablePartnerInvitations: boolean;
    enableStudioAdmin: boolean;
    allowGuestAssessments: boolean;
  };
}

export const brandConfig: BrandConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "Truth Desire",
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE ||
    "Romantic, candid, and boundary-first self-discovery, desire mapping, and couples compatibility for curious adults.",
  domain: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supportEmail: "privacy@truthdesire.app",
  minimumAge: 18,
  scoringEngineVersion: "1.2.0",
  communityMinimumThreshold: 50,
  cohortSuppressionThreshold: 50,
  defaultInviteExpirationHours: 24 * 7,
  features: {
    enableCommunityComparisons: true,
    enablePartnerInvitations: true,
    enableStudioAdmin: true,
    allowGuestAssessments: true,
  },
};
