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
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "SoulFlame",
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE ||
    "The viral compatibility, love, kink, and personality tests for curious souls.",
  domain: process.env.NEXT_PUBLIC_APP_URL || "https://truth-desire.web.app",
  supportEmail: "hello@soulflame.app",
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
