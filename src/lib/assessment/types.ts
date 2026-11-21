export type AssessmentCategorySlug =
  | "personality"
  | "romance"
  | "sexuality-intimacy"
  | "compatibility";

export type BuiltInIntimacySectionId =
  | "communication"
  | "foreplay-pacing"
  | "initiative-dynamics"
  | "exploration-novelty"
  | "physical-pleasure"
  | "boundaries-comfort";

export type QuestionSectionId = BuiltInIntimacySectionId | (string & {});

export type QuestionInputType =
  | "intimacy_profile"
  | "enjoyment_scale"
  | "curiosity_map"
  | "multiple_choice"
  | "rating_scale"
  | "slider"
  | "forced_choice"
  | "ranking"
  | "multi_select"
  | "situational"
  | "partner_prediction"
  | "would_rather_vote";

export type Directionality =
  | "reciprocal"
  | "receive_give"
  | "give_receive"
  | "shared_value"
  | "boundary_sensitivity";

export type RadarDimensionKey =
  | "communication"
  | "sensuality"
  | "exploration"
  | "assertiveness"
  | "emotionalConnection"
  | "playfulness"
  | "mutualAttentiveness";

export type EnjoymentRatingValue = 1 | 2 | 3 | 4 | 5;
export type EnjoymentSpecialState =
  | "haven_t_experienced"
  | "curious"
  | "depends"
  | "prefer_not_to_answer";

export type EnjoymentResponse = EnjoymentRatingValue | EnjoymentSpecialState;

export type DesireDeltaResponse = "want_more" | "about_right" | "want_less";

export type CuriosityLevel =
  | "very_interested"
  | "interested"
  | "curious_uncertain"
  | "not_interested"
  | "firm_boundary"
  | "havent_considered";

export type FantasyRevealRule =
  | "mutual_only"
  | "always_share_with_partner"
  | "private_never_share";

export type ExperienceFrequencyResponse =
  | 1 // Never
  | 2 // Rarely
  | 3 // Sometimes
  | 4 // Often
  | 5 // Very often
  | "prefer_not_to_answer";

export type ImportanceLevel =
  | "essential"
  | "important"
  | "nice_to_have"
  | "not_important";

export type PartnerWillingnessState =
  | "enthusiastically_enjoy"
  | "willing_if_partner_enjoys"
  | "curious_to_explore"
  | "depends_on_context"
  | "prefer_not_to"
  | "firm_boundary";

export type ScoringStrategy =
  | "intimacy_profile"
  | "intimacy_weighted"
  | "dimension_average"
  | "attachment_quadrant"
  | "give_receive_dual"
  | "curiosity_map"
  | "forced_choice_priorities"
  | "fantasy_mutual"
  | "bucket_list"
  | "prediction_accuracy"
  | "would_rather"
  | "multi_rater_perception";

export type CompatibilityStrategy =
  | "consent_complementary"
  | "intimacy_complementary"
  | "affection_give_receive"
  | "trait_similarity_complement"
  | "values_alignment"
  | "fantasy_mutual_reveal"
  | "bucket_list_matcher"
  | "prediction_game"
  | "voting_game"
  | "none";

export type ExportFormat = "pdf" | "json" | "csv" | "share_card";

export interface BranchCondition {
  dependsOnQuestionId: string;
  operator: "equals" | "not_equals" | "gte" | "in";
  value: string | number | Array<string | number>;
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  dimensionWeights?: Record<string, number>;
  priorityTag?: string;
  channelSide?: "receive" | "express";
}

export interface DimensionDefinition {
  blueprintAxis?:
    | "connection"
    | "pacing"
    | "sensory"
    | "imagination"
    | "roles"
    | "autonomy";
  key: string;
  label: string;
  shortLabel?: string;
  description: string;
  lowLabel?: string;
  highLabel?: string;
  channelPairKey?: string;
  channelRole?: "receive" | "express";
  interpretations?: {
    low: CategoryInterpretation;
    balanced: CategoryInterpretation;
    high: CategoryInterpretation;
  };
}

export interface CategoryInterpretation {
  meaning: string;
  possibleTradeoff: string;
  experiment: string;
  reflection: string;
}

export interface ArchetypeRule {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  weights: Record<string, number>;
  conditions?: Array<{ dimension: string; min?: number; max?: number }>;
}

export interface QuestionDefinition {
  defaultRevealRule?: "mutual_only";
  intimacyRole?: "receive" | "offer" | "shared";
  topicTags?: string[];
  id: string;
  order: number;
  sectionId: QuestionSectionId;
  sectionTitle: string;
  inputType: QuestionInputType;
  prompt: string;
  partnerPrompt: string;
  observerPrompt?: string;
  helperText: string;
  quickDiscovery: boolean;
  directionality: Directionality;
  complementaryPartnerId?: string;
  supportsExperienceFrequency: boolean;
  supportsImportance?: boolean;
  supportsDesireDelta?: boolean;
  supportsBoundaryFlag: boolean;
  partnerSupportsWillingness: boolean;
  supportsRevealRule?: boolean;
  safetySensitive?: boolean;
  eligibleForMatching: boolean;
  dimensionWeights: Record<string, number>;
  reverseScored?: boolean;
  priorityId?: string;
  priorityLabel?: string;
  referenceChartIds?: string[];
  editorialStatus: "verified" | "needs_reference_review";
  editorialNote?: string;
  options?: QuestionOption[];
  scaleConfig?: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
    midLabel?: string;
    allowNotSure?: boolean;
  };
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    minLabel: string;
    maxLabel: string;
    unit?: string;
  };
  branchingCondition?: BranchCondition;
}

export interface AssessmentSection {
  id: QuestionSectionId;
  title: string;
  subtitle: string;
  description: string;
}

export interface AssessmentDefinition {
  editorialRevision?: string;
  adviceProfile?: AssessmentAdviceProfile;
  styleRankingEnabled?: boolean;
  collection?: "intimacy-suite";
  marketingBlurb?: string;
  matchingNotes?: string[];
  contentNote?: string;
  purpose?: string;
  quickDescription?: string;
  deepDescription?: string;
  scoringNotes?: string[];
  id: string;
  slug: string;
  version: string;
  title: string;
  shortTitle: string;
  category: AssessmentCategorySlug;
  status: "published" | "coming_soon" | "draft";
  audienceNote: string;
  futureExtensibilityNote: string;
  scientificDisclaimer?: string;
  adultsOnly?: boolean;
  isCouplesFocused?: boolean;
  isFeatured?: boolean;
  estimatedMinutesQuick: number;
  estimatedMinutesComplete: number;
  supportsQuickMode?: boolean;
  supportsPartnerMatching: boolean;
  supportsCommunityComparison: boolean;
  supportsMultiRater?: boolean;
  minMultiRaterRespondents?: number;
  scoringStrategy?: ScoringStrategy;
  compatibilityStrategy?: CompatibilityStrategy;
  visualizationTypes?: string[];
  discoverPoints?: string[];
  recommendedNextSlugs?: string[];
  supportedExports?: ExportFormat[];
  dimensions?: DimensionDefinition[];
  archetypes?: ArchetypeRule[];
  sections: AssessmentSection[];
  questions: QuestionDefinition[];
}

export interface QuestionAnswer {
  questionId: string;
  enjoyment?: EnjoymentResponse;
  experienceFrequency?: ExperienceFrequencyResponse;
  desireDelta?: DesireDeltaResponse;
  importance?: ImportanceLevel;
  firmBoundary?: boolean;
  partnerWillingness?: PartnerWillingnessState;
  curiosityLevel?: CuriosityLevel;
  revealRule?: FantasyRevealRule;
  customValue?: string | number | string[];
  skipped?: boolean;
  updatedAt: string;
}

export type AssessmentMode = "quick" | "complete";

export interface ConsentSettings {
  confirmedAdult18Plus: boolean;
  acceptedPrivacyTerms: boolean;
  optInCommunityStats: boolean;
  cohortMetadata?: {
    ageGroup?: "18-24" | "25-34" | "35-44" | "45+" | "prefer_not";
    relationshipStatus?:
      | "single"
      | "dating"
      | "partnered"
      | "married"
      | "other"
      | "prefer_not";
    datingPreference?: "men" | "women" | "all_genders" | "prefer_not";
    genderIdentity?: "woman" | "man" | "nonbinary" | "prefer_not";
  };
  consentedAt: string;
}

export interface SharingPreferences {
  shareGameAnswerDetails?: boolean;
  shareCategoryScores: boolean;
  shareAlignedHighlights: boolean;
  shareComplementaryHighlights: boolean;
  shareSharedCuriosities: boolean;
  shareHighLevelBoundariesWithoutDetails: boolean;
  neverExposeRawPrivateAnswers: boolean;
}

export interface AssessmentDraft {
  draftId: string;
  assessmentSlug: string;
  assessmentVersion: string;
  mode: AssessmentMode;
  perspective: "primary" | "partner";
  inviteToken?: string;
  consent: ConsentSettings;
  answers: Record<string, QuestionAnswer>;
  currentQuestionIndex: number;
  startedAt: string;
  updatedAt: string;
  userId?: string;
}

export type IntoItemTag =
  | "turn_on"
  | "curious"
  | "want_more"
  | "limit"
  | "role_signal";

export interface IntoDimensionLink {
  dimension: string;
  label: string;
  direction: "positive" | "inverse";
}

export interface IntoEvidenceItem {
  questionId: string;
  shortLabel: string;
  prompt: string;
  sectionTitle: string;
  answerLabel: string;
  detail?: string;
  importance?: ImportanceLevel;
  score0to100?: number | null;
  desireDelta?: DesireDeltaResponse;
  tag: IntoItemTag;
  linkedDimensions: IntoDimensionLink[];
}

export interface WhatYouAreIntoSummary {
  headline: string;
  roleOrDynamicLean?: {
    label: string;
    detail: string;
    linkedQuestionIds: string[];
  };
  coreTurnOns: IntoEvidenceItem[];
  curiousExplorations: IntoEvidenceItem[];
  wantMoreOf: IntoEvidenceItem[];
  dealbreakersAndLimits: IntoEvidenceItem[];
  styleSummary: string[];
}

export interface DimensionInteractionInsight {
  id: string;
  title: string;
  summary: string;
  dimensions: Array<{ dimension: string; label: string; score: number }>;
  evidence: Array<{
    questionId: string;
    shortLabel: string;
    answerLabel: string;
    dimensionLabel: string;
  }>;
}

export interface RadarDimensionScore {
  dimension: string;
  label: string;
  score: number; // 0 to 100
  answeredCount: number;
  description?: string;
  lowLabel?: string;
  highLabel?: string;
  eligibleCount?: number;
  interpretation?: CategoryInterpretation & {
    band: "low" | "balanced" | "high";
  };
  contributors: Array<{
    questionId: string;
    prompt: string;
    normalizedContribution: number;
    enjoymentLabel: string;
    importance: ImportanceLevel;
    direction?: "positive" | "inverse";
    weightedImpact?: number;
    rawWeight?: number;
  }>;
}

export interface PersonalProfileSummary {
  archetypeName: string;
  archetypeTagline: string;
  disclaimer: string;
  summaryParagraph: string;
  strongestPreferences: string[];
  importantNeeds: string[];
  noveltyComfort: string;
  communicationStyle: string;
  paceAndEnergy: string;
  initiativeBalance: string;
  topBoundaries: string[];
}

export interface ScatterPoint {
  questionId: string;
  shortLabel: string;
  prompt: string;
  sectionId: QuestionSectionId;
  sectionTitle: string;
  enjoymentScore: number; // 1..5
  experienceScore: number; // 1..5
  desireDelta?: DesireDeltaResponse;
  importance: ImportanceLevel;
  quadrant:
    | "high_desire_low_experience"
    | "high_desire_high_experience"
    | "low_desire_high_experience"
    | "low_desire_low_experience"
    | "neutral";
}

export interface UnmetPreferenceInsight {
  questionId: string;
  prompt: string;
  sectionTitle: string;
  enjoymentScore: number;
  experienceScore: number;
  desireDelta?: DesireDeltaResponse;
  importance: ImportanceLevel;
  message: string;
}

export interface IdealPartnerReport {
  characteristics: string[];
  whatMattersMost: Array<{
    title: string;
    detail: string;
    weight: ImportanceLevel;
  }>;
  earlyDatingSignals: Array<{ signal: string; conversationPrompt: string }>;
  potentialMismatches: Array<{ area: string; note: string }>;
  explorationOpportunities: Array<{ topic: string; framing: string }>;
  communicationNeeds: string[];
}

export interface DualChannelScore {
  channelKey: string;
  label: string;
  receiveOrNeedScore: number;
  expressOrOfferScore: number;
  gap: number;
}

export interface PriorityRankItem {
  id: string;
  label: string;
  score: number;
  rank: number;
  tier: "essential" | "strong" | "flexible" | "boundary";
}

export interface CuriosityGroupSummary {
  level: CuriosityLevel;
  label: string;
  items: Array<{
    questionId: string;
    prompt: string;
    sectionTitle: string;
  }>;
}

export interface QaSummaryEntry {
  questionId: string;
  sectionId?: QuestionSectionId;
  sectionTitle: string;
  prompt: string;
  answerLabel: string;
  importance: ImportanceLevel;
  experienceFrequency?: ExperienceFrequencyResponse;
  desireDelta?: DesireDeltaResponse;
  firmBoundary: boolean;
  score0to100?: number | null;
  linkedDimensions?: IntoDimensionLink[];
  intoTag?: IntoItemTag;
}

export interface AdviceEvidence {
  dimension: string;
  label: string;
  score?: number;
  answeredCount: number;
  questionId?: string;
  prompt?: string;
}
export interface AdviceInsight {
  id: string;
  title: string;
  body: string;
  evidence: AdviceEvidence[];
  script?: string;
}
export interface AdviceExperiment extends AdviceInsight {
  kind: "solo" | "partnered" | "curiosity";
  effort: 1 | 2 | 3;
  scope: string;
  steps: string[];
  stopRule: string;
  aftercare?: string;
}
export interface AssessmentAdviceProfile {
  wording?: string;
  dimensionCoaching?: Record<
    string,
    {
      wording?: string;
      seek: string;
      friction: string;
      optimize: string;
      solo?: [string, string];
      together?: [string, string];
      curiosity?: [string, string];
    }
  >;
  theme: string;
  seek: string;
  friction: string;
  optimize: string;
  solo: [title: string, step: string];
  together: [title: string, step: string];
  curiosity: [title: string, step: string];
  ask: string;
}
export interface PersonalizedAdvice {
  version: string;
  status: "ready" | "needs-more-answers";
  focusDimension?: string;
  headline: string;
  context: string;
  partnerTraits: AdviceInsight[];
  frictionPoints: AdviceInsight[];
  partnerSearchLine: string;
  optimizations: AdviceInsight[];
  experiments: AdviceExperiment[];
  gaps: Array<{
    questionId: string;
    label: string;
    desire: number;
    experience: number | null;
    gap: number | null;
    path:
      | "discuss-first"
      | "keep-as-fantasy"
      | "respect-limit"
      | "keep-private"
      | "needs-context";
    explanation: string;
  }>;
  gapNote: string;
  synthesisNote?: string;
}

export interface ScoredAssessmentResult {
  advice?: PersonalizedAdvice;
  styleRanking?: {
    primary?: { key: string; label: string; score: number };
    secondary?: { key: string; label: string; score: number };
    ranked: Array<{
      key: string;
      label: string;
      score: number;
      answeredCount: number;
    }>;
    tied: boolean;
    provisional: boolean;
    note: string;
  };
  intimacyProfile?: {
    channels: Array<{
      dimension: string;
      label: string;
      desireScore: number | null;
      willingnessScore: number | null;
      experienceScore: number | null;
      desireCount: number;
      experienceCount: number;
      receiveScore: number | null;
      offerScore: number | null;
    }>;
    hardLimits: Array<{ questionId: string; label: string }>;
    privateCount: number;
    contextOnlyCount: number;
  };
  intimacyBlueprint?: {
    sources: Array<{ title: string; createdAt: string }>;
    axes: Array<{
      key: string;
      label: string;
      score: number;
      sourceCount: number;
    }>;
    note: string;
  };
  adultsOnly?: boolean;
  resultId: string;
  assessmentSlug: string;
  assessmentTitle?: string;
  assessmentCategory?: AssessmentCategorySlug;
  assessmentVersion: string;
  scoringEngineVersion: string;
  scoringStrategy?: ScoringStrategy;
  mode: AssessmentMode;
  perspective: "primary" | "partner";
  createdAt: string;
  answeredCount: number;
  totalEligibleInMode: number;
  coveragePercent: number;
  provisional: boolean;
  profile: PersonalProfileSummary;
  radar: RadarDimensionScore[];
  buckets: {
    stronglyDesired: QuestionAnswerSummary[];
    importantQualities: QuestionAnswerSummary[];
    curiousAbout: QuestionAnswerSummary[];
    situational: QuestionAnswerSummary[];
    preferToAvoid: QuestionAnswerSummary[];
    firmBoundaries: QuestionAnswerSummary[];
  };
  scatterPoints: ScatterPoint[];
  experienceUnratedCount: number;
  unmetPreferences: UnmetPreferenceInsight[];
  groundedInsights: string[];
  growthReflections?: string[];
  whatYouAreInto?: WhatYouAreIntoSummary;
  roleRankings?: Array<{
    key: string;
    label: string;
    group: string;
    percent: number;
    answeredCount: number;
    you: string;
    try: string[];
  }>;
  dimensionInteractions?: DimensionInteractionInsight[];
  idealPartner: IdealPartnerReport;
  dualChannelScores?: DualChannelScore[];
  priorityRanking?: PriorityRankItem[];
  curiosityGroups?: CuriosityGroupSummary[];
  blendedArchetype?: {
    primary: string;
    secondary?: string;
    blendScores: Array<{ id: string; name: string; score: number }>;
  };
  attachmentCoordinates?: {
    anxiety: number; // 0..100
    avoidance: number; // 0..100
    quadrantLabel: string;
  };
  recommendedNextSlugs?: string[];
  qaSummary?: QaSummaryEntry[];
}

export interface QuestionAnswerSummary {
  questionId: string;
  prompt: string;
  sectionId: QuestionSectionId;
  sectionTitle: string;
  enjoyment?: EnjoymentResponse;
  experienceFrequency?: ExperienceFrequencyResponse;
  desireDelta?: DesireDeltaResponse;
  importance: ImportanceLevel;
  firmBoundary: boolean;
  partnerWillingness?: PartnerWillingnessState;
  curiosityLevel?: CuriosityLevel;
  answerLabel?: string;
}

export interface CommunityQuestionAggregate {
  questionId: string;
  respondentCount: number;
  meanEnjoyment: number | null; // null when < threshold
  stdDevEnjoyment: number | null;
  distribution: Record<1 | 2 | 3 | 4 | 5, number> | null;
  available: boolean;
  isSyntheticDemo?: boolean;
}

export interface CommunityComparisonItem {
  questionId: string;
  prompt: string;
  sectionTitle: string;
  userRating: number | null;
  communityMean: number | null;
  communityStdDev: number | null;
  respondentCount: number;
  difference: number | null;
  percentile: number | null;
  available: boolean;
  isSyntheticDemo?: boolean;
}

export interface PartnerInvitation {
  inviteId: string;
  token: string;
  creatorDisplayName: string;
  assessmentSlug: string;
  assessmentVersion: string;
  mode: AssessmentMode;
  creatorResultId: string;
  creatorSharing: SharingPreferences;
  status: "pending" | "completed" | "revoked" | "expired";
  createdAt: string;
  expiresAt: string;
  partnerResultId?: string;
  compatibilityId?: string;
}

export interface CompatibilityDimensionBreakdown {
  dimension: string;
  score: number | null;
  pairCount: number;
  note: string;
}

export interface CompatibilityPairItem {
  questionId: string;
  sectionTitle: string;
  promptSummary: string;
  classification:
    | "strong_align"
    | "complementary"
    | "shared_curiosity"
    | "needs_discussion"
    | "boundary_protected"
    | "potential_mismatch";
  explanation: string;
  safetySensitive?: boolean;
}

export interface CompatibilityReport {
  pairAdvice?: {
    version: string;
    status: "shared-topics" | "no-shared-topics";
    strengths: AdviceInsight[];
    frictionPoints: AdviceInsight[];
    conversationStarters: string[];
    experiments: AdviceExperiment[];
    privacyNote: string;
  };
  compatibilityId: string;
  inviteId: string;
  assessmentSlug: string;
  assessmentTitle?: string;
  assessmentVersion: string;
  scoringEngineVersion: string;
  compatibilityStrategy?: CompatibilityStrategy;
  createdAt: string;
  overallScore: number; // 0..100 Assessment-specific alignment metric
  label: string;
  coveragePercent: number;
  bothAnsweredCount: number;
  totalEligibleCount: number;
  provisional: boolean;
  disclaimer: string;
  methodologyNotes: string[];
  dimensionScores: CompatibilityDimensionBreakdown[];
  radarOverlay: Array<{
    dimension: string;
    label: string;
    primaryScore: number;
    partnerScore: number;
  }>;
  whereYouAlign: CompatibilityPairItem[];
  whereYouComplement: CompatibilityPairItem[];
  whereYouDiffer: CompatibilityPairItem[];
  sharedCuriosities: CompatibilityPairItem[];
  boundaryConsiderations: CompatibilityPairItem[];
  coupleInsights: string[];
  conversationStarters: string[];
  fantasyReveals?: {
    mutuallySelected: Array<{
      questionId: string;
      label: string;
      category: string;
    }>;
    openlySharedByCreatorOnly: Array<{
      questionId: string;
      label: string;
      category: string;
    }>;
    openlySharedByPartnerOnly: Array<{
      questionId: string;
      label: string;
      category: string;
    }>;
    sharedCategoryHighlights: string[];
    privateProtectedCount: number;
    privacyNotice: string;
  };
  bucketListMatches?: {
    sharedItems: Array<{
      id: string;
      label: string;
      category: string;
      completed: boolean;
      addedCustom?: boolean;
    }>;
    onePartnerOpenCount: number;
  };
  predictionSummary?: {
    accuracyPercent: number;
    correctCount: number;
    totalCompared: number;
    categoryAccuracy: Array<{
      category: string;
      correct: number;
      total: number;
    }>;
    surprises: Array<{
      prompt: string;
      primaryActual: string;
      partnerGuess: string;
    }>;
    nailedIt: Array<{ prompt: string; answer: string }>;
  };
  voteGameSummary?: {
    agreementPercent: number;
    items: Array<{
      questionId: string;
      prompt: string;
      primaryVote: string;
      partnerVote: string;
      agreed: boolean;
    }>;
  };
  giveReceivePairings?: Array<{
    channel: string;
    aReceivesFromB: number;
    bReceivesFromA: number;
    summary: string;
  }>;
  revoked?: boolean;
}

export interface EmailVerificationRecord {
  emailHash: string;
  codeHash: string;
  expiresAt: string;
  verifiedAt?: string;
  attempts: number;
}

export interface EmailDeliveryRecord {
  deliveryId: string;
  resultId?: string;
  compatibilityId?: string;
  recipientHash: string;
  mode: "secure_link" | "summary" | "pdf_attachment";
  status: "sent" | "failed" | "not_configured";
  provider: "resend" | "smtp" | "none";
  createdAt: string;
  errorSummary?: string;
}

export interface ResultAccessGrant {
  tokenHash: string;
  targetType: "result" | "compatibility";
  targetId: string;
  createdAt: string;
  expiresAt: string;
}

export interface MultiRaterInviteRecord {
  feedbackInviteId: string;
  tokenHash: string;
  submissionId: string;
  ownerSessionKey: string;
  ownerUid?: string;
  ownerDisplayName: string;
  assessmentSlug: string;
  minRespondents: number;
  createdAt: string;
  expiresAt: string;
  revoked?: boolean;
}

export interface MultiRaterSubmissionRecord {
  responseId: string;
  feedbackInviteId: string;
  relationshipType: "partner" | "close_friend" | "friend" | "colleague";
  answers: Record<string, QuestionAnswer>;
  createdAt: string;
}

export interface SharedBucketListState {
  compatibilityId: string;
  completedIds: string[];
  customItems: Array<{
    id: string;
    label: string;
    category: string;
    completed: boolean;
    createdAt: string;
  }>;
  updatedAt: string;
}

export interface UserPrivacyPreferences {
  sessionKey: string;
  uid?: string;
  displayName?: string;
  verifiedEmail?: string;
  defaultCommunityOptIn: boolean;
  notifyNewTests: boolean;
  notifyPartnerReports: boolean;
  updatedAt: string;
}

export interface AuditEventRecord {
  eventId: string;
  eventType:
    | "submission_created"
    | "invitation_created"
    | "compatibility_generated"
    | "export_generated"
    | "email_requested"
    | "email_failed"
    | "admin_update"
    | "data_deleted";
  assessmentSlug?: string;
  status: "ok" | "error";
  detail?: string;
  createdAt: string;
}
