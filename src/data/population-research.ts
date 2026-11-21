// Primary source: Herbenick et al., PLOS ONE 12(7), e0181198 (2017).
// Table 5: sum of weighted "very" and "somewhat" appealing percentages.
// Table 2: weighted lifetime participation, not a measure of current interest.
// Checked against the publisher's JATS XML on 2026-11-21.
export const populationStudy = {
  title: "Sexual diversity in the United States",
  citation: "Herbenick et al., PLOS ONE (2017)",
  url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0181198",
  population: "U.S. adults, ages 18+",
  sampleSize: 2021,
  fieldwork: "December 2014–January 2015",
  method: "Nationally representative probability survey; weighted estimates. Topic response counts vary because questions could be skipped.",
};

export const populationInterests = [
  { id: "bondage", label: "Bondage", detail: "Tying up a partner or being tied up", appealing: 29.3, respondents: 1968, lifetime: 21.1 },
  { id: "spanking", label: "Spanking", detail: "Spanking a partner or being spanked", appealing: 28.4, respondents: 1957, lifetime: 31.9 },
  { id: "role-play", label: "Role-play", detail: "Role-playing with a partner", appealing: 37.4, respondents: 1965 },
  { id: "blindfolds", label: "Blindfolds", detail: "Blindfolding a partner or being blindfolded", appealing: 34.9, respondents: 1960 },
  { id: "dirty-talk", label: "Dirty talk", detail: "Sexual talk with a partner", appealing: 56.2, respondents: 1965 },
  { id: "feet", label: "Foot play", detail: "Licking or sucking a partner’s feet or toes, or receiving it", appealing: 15.5, respondents: 1961 },
] as const;
