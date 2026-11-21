import type { AssessmentDefinition } from "@/lib/assessment/types";
import { mapsDiscoveryAssessments } from "./maps-discovery";
import { careConnectionAssessments } from "./care-connection";
import { communicationRoleAssessments } from "./communication-roles";
import { agreementBoundaryAssessments } from "./agreements-boundaries";
import { fantasyCatalog, personalBlueprint } from "./fantasy-blueprint";
import { wouldYouRather } from "./would-you-rather";
import { eroticBlueprintStyle } from "./erotic-blueprint";

export const intimacyAssessments: AssessmentDefinition[] = [
  ...mapsDiscoveryAssessments,
  fantasyCatalog,
  ...careConnectionAssessments,
  ...communicationRoleAssessments,
  ...agreementBoundaryAssessments,
  wouldYouRather,
  personalBlueprint,
  eroticBlueprintStyle,
];
