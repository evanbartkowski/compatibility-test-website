import type {
  AssessmentSection,
  BranchCondition,
  QuestionDefinition,
  QuestionInputType,
  QuestionOption,
} from "@/lib/assessment/types";

export function makeSection(
  id: string,
  title: string,
  subtitle: string,
  description: string
): AssessmentSection {
  return { id, title, subtitle, description };
}

export function qEnjoy(params: {
  id: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  partnerPrompt: string;
  helperText: string;
  quick?: boolean;
  directionality?: QuestionDefinition["directionality"];
  dimensionWeights: Record<string, number>;
  priorityId?: string;
  priorityLabel?: string;
  supportsExperienceFrequency?: boolean;
  supportsDesireDelta?: boolean;
  supportsRevealRule?: boolean;
  safetySensitive?: boolean;
}): QuestionDefinition {
  return {
    id: params.id,
    order: params.order,
    sectionId: params.sectionId,
    sectionTitle: params.sectionTitle,
    inputType: "enjoyment_scale",
    prompt: params.prompt,
    partnerPrompt: params.partnerPrompt,
    helperText: params.helperText,
    quickDiscovery: params.quick ?? params.order <= 6,
    directionality: params.directionality ?? "reciprocal",
    supportsExperienceFrequency: params.supportsExperienceFrequency ?? false,
    supportsDesireDelta: params.supportsDesireDelta ?? false,
    supportsBoundaryFlag: true,
    partnerSupportsWillingness: true,
    supportsRevealRule: params.supportsRevealRule,
    safetySensitive: params.safetySensitive,
    eligibleForMatching: true,
    dimensionWeights: params.dimensionWeights,
    priorityId: params.priorityId,
    priorityLabel: params.priorityLabel,
    editorialStatus: "verified",
  };
}

export function qCuriosity(params: {
  id: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  partnerPrompt?: string;
  helperText: string;
  quick?: boolean;
  dimensionWeights: Record<string, number>;
  supportsRevealRule?: boolean;
  safetySensitive?: boolean;
  branchingCondition?: BranchCondition;
}): QuestionDefinition {
  return {
    id: params.id,
    order: params.order,
    sectionId: params.sectionId,
    sectionTitle: params.sectionTitle,
    inputType: "curiosity_map",
    prompt: params.prompt,
    partnerPrompt: params.partnerPrompt || params.prompt,
    helperText: params.helperText,
    quickDiscovery: params.quick ?? true,
    directionality: "reciprocal",
    supportsExperienceFrequency: false,
    supportsBoundaryFlag: true,
    partnerSupportsWillingness: false,
    supportsRevealRule: params.supportsRevealRule,
    safetySensitive: params.safetySensitive,
    eligibleForMatching: true,
    dimensionWeights: params.dimensionWeights,
    branchingCondition: params.branchingCondition,
    editorialStatus: "verified",
  };
}

export function qScale(params: {
  id: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  partnerPrompt?: string;
  observerPrompt?: string;
  helperText: string;
  quick?: boolean;
  dimensionWeights: Record<string, number>;
  reverseScored?: boolean;
  priorityId?: string;
  priorityLabel?: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  supportsBoundaryFlag?: boolean;
  safetySensitive?: boolean;
  branchingCondition?: BranchCondition;
}): QuestionDefinition {
  const min = params.min ?? 1;
  const max = params.max ?? 5;
  return {
    id: params.id,
    order: params.order,
    sectionId: params.sectionId,
    sectionTitle: params.sectionTitle,
    inputType: "rating_scale",
    prompt: params.prompt,
    partnerPrompt: params.partnerPrompt || params.prompt,
    observerPrompt: params.observerPrompt,
    helperText: params.helperText,
    quickDiscovery: params.quick ?? true,
    directionality: "reciprocal",
    supportsExperienceFrequency: false,
    supportsBoundaryFlag: params.supportsBoundaryFlag ?? false,
    safetySensitive: params.safetySensitive,
    partnerSupportsWillingness: false,
    eligibleForMatching: true,
    dimensionWeights: params.dimensionWeights,
    reverseScored: params.reverseScored,
    priorityId: params.priorityId,
    priorityLabel: params.priorityLabel,
    scaleConfig: {
      min,
      max,
      minLabel: params.minLabel ?? "Not at all / Strongly disagree",
      maxLabel: params.maxLabel ?? "Strongly agree / Very much",
      midLabel: "Balanced / Neutral",
    },
    branchingCondition: params.branchingCondition,
    editorialStatus: "verified",
  };
}

export function qSlider(params: {
  id: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  partnerPrompt?: string;
  helperText: string;
  quick?: boolean;
  dimensionWeights: Record<string, number>;
  minLabel: string;
  maxLabel: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  reverseScored?: boolean;
}): QuestionDefinition {
  return {
    id: params.id,
    order: params.order,
    sectionId: params.sectionId,
    sectionTitle: params.sectionTitle,
    inputType: "slider",
    prompt: params.prompt,
    partnerPrompt: params.partnerPrompt || params.prompt,
    helperText: params.helperText,
    quickDiscovery: params.quick ?? true,
    directionality: "reciprocal",
    supportsExperienceFrequency: false,
    supportsBoundaryFlag: false,
    partnerSupportsWillingness: false,
    eligibleForMatching: true,
    dimensionWeights: params.dimensionWeights,
    reverseScored: params.reverseScored,
    sliderConfig: {
      min: params.min ?? 0,
      max: params.max ?? 100,
      step: params.step ?? 5,
      minLabel: params.minLabel,
      maxLabel: params.maxLabel,
      unit: params.unit,
    },
    editorialStatus: "verified",
  };
}

export function qChoice(params: {
  id: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  inputType?: Extract<
    QuestionInputType,
    "multiple_choice" | "situational" | "forced_choice" | "partner_prediction" | "would_rather_vote"
  >;
  prompt: string;
  partnerPrompt?: string;
  helperText: string;
  quick?: boolean;
  dimensionWeights: Record<string, number>;
  options: QuestionOption[];
  supportsBoundaryFlag?: boolean;
  safetySensitive?: boolean;
}): QuestionDefinition {
  return {
    id: params.id,
    order: params.order,
    sectionId: params.sectionId,
    sectionTitle: params.sectionTitle,
    inputType: params.inputType ?? "multiple_choice",
    prompt: params.prompt,
    partnerPrompt: params.partnerPrompt || params.prompt,
    helperText: params.helperText,
    quickDiscovery: params.quick ?? true,
    directionality: "shared_value",
    supportsExperienceFrequency: false,
    supportsBoundaryFlag: params.supportsBoundaryFlag ?? false,
    safetySensitive: params.safetySensitive,
    partnerSupportsWillingness: false,
    eligibleForMatching: true,
    dimensionWeights: params.dimensionWeights,
    options: params.options,
    editorialStatus: "verified",
  };
}

export function qRanking(params: {
  id: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  helperText: string;
  quick?: boolean;
  dimensionWeights: Record<string, number>;
  options: QuestionOption[];
}): QuestionDefinition {
  return {
    id: params.id,
    order: params.order,
    sectionId: params.sectionId,
    sectionTitle: params.sectionTitle,
    inputType: "ranking",
    prompt: params.prompt,
    partnerPrompt: params.prompt,
    helperText: params.helperText,
    quickDiscovery: params.quick ?? true,
    directionality: "shared_value",
    supportsExperienceFrequency: false,
    supportsBoundaryFlag: false,
    partnerSupportsWillingness: false,
    eligibleForMatching: true,
    dimensionWeights: params.dimensionWeights,
    options: params.options,
    editorialStatus: "verified",
  };
}

export function qMulti(params: {
  id: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  partnerPrompt?: string;
  helperText: string;
  quick?: boolean;
  dimensionWeights: Record<string, number>;
  options: QuestionOption[];
  supportsRevealRule?: boolean;
}): QuestionDefinition {
  return {
    id: params.id,
    order: params.order,
    sectionId: params.sectionId,
    sectionTitle: params.sectionTitle,
    inputType: "multi_select",
    prompt: params.prompt,
    partnerPrompt: params.partnerPrompt || params.prompt,
    helperText: params.helperText,
    quickDiscovery: params.quick ?? true,
    directionality: "reciprocal",
    supportsExperienceFrequency: false,
    supportsBoundaryFlag: false,
    partnerSupportsWillingness: false,
    supportsRevealRule: params.supportsRevealRule,
    eligibleForMatching: true,
    dimensionWeights: params.dimensionWeights,
    options: params.options,
    editorialStatus: "verified",
  };
}
