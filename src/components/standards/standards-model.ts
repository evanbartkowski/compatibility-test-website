export type Gender = "men" | "women";

export type Filters = {
  gender: Gender;
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  incomeMin: number;
  incomeMax: number;
  weightMin: number;
  weightMax: number;
  eye: string;
  hair: string;
  religion: string;
  drinks: string;
  smokes: string;
  cannabis: string;
  married: string;
  body: string;
  kids: string;
  hasChildren: string;
  education: string;
  ethnicity: string;
  politics: string;
  region: string;
  urban: string;
  employed: string;
  exercise: string;
  tattoos: string;
  disability: string;
  veteran: string;
  language: string;
  marriageIntent: string;
};

export const defaultFilters: Filters = {
  gender: "men",
  ageMin: 25,
  ageMax: 40,
  heightMin: 66,
  heightMax: 78,
  incomeMin: 0,
  incomeMax: 400000,
  weightMin: 90,
  weightMax: 320,
  eye: "any",
  hair: "any",
  religion: "any",
  drinks: "any",
  smokes: "any",
  cannabis: "any",
  married: "not",
  body: "any",
  kids: "either",
  hasChildren: "any",
  education: "any",
  ethnicity: "any",
  politics: "any",
  region: "any",
  urban: "any",
  employed: "any",
  exercise: "any",
  tattoos: "any",
  disability: "any",
  veteran: "any",
  language: "any",
  marriageIntent: "any",
};

const AGE_BANDS = [
  { min: 18, max: 24, share: 0.116, married: 0.08, neverMarried: 0.86, bachelor: 0.14, parent: 0.12, wantsKids: 0.58, noKids: 0.22, zeroIncome: 0.38, employed: 0.62, tattoo: 0.38, cannabis: 0.28 },
  { min: 25, max: 34, share: 0.174, married: 0.4, neverMarried: 0.51, bachelor: 0.4, parent: 0.45, wantsKids: 0.42, noKids: 0.28, zeroIncome: 0.12, employed: 0.8, tattoo: 0.4, cannabis: 0.26 },
  { min: 35, max: 44, share: 0.167, married: 0.58, neverMarried: 0.27, bachelor: 0.42, parent: 0.72, wantsKids: 0.22, noKids: 0.34, zeroIncome: 0.12, employed: 0.81, tattoo: 0.36, cannabis: 0.18 },
  { min: 45, max: 54, share: 0.156, married: 0.62, neverMarried: 0.17, bachelor: 0.36, parent: 0.8, wantsKids: 0.08, noKids: 0.42, zeroIncome: 0.14, employed: 0.78, tattoo: 0.28, cannabis: 0.12 },
  { min: 55, max: 64, share: 0.161, married: 0.62, neverMarried: 0.12, bachelor: 0.34, parent: 0.82, wantsKids: 0.03, noKids: 0.5, zeroIncome: 0.18, employed: 0.64, tattoo: 0.2, cannabis: 0.09 },
  { min: 65, max: 74, share: 0.132, married: 0.6, neverMarried: 0.08, bachelor: 0.3, parent: 0.84, wantsKids: 0.01, noKids: 0.62, zeroIncome: 0.22, employed: 0.28, tattoo: 0.12, cannabis: 0.05 },
  { min: 75, max: 99, share: 0.094, married: 0.45, neverMarried: 0.06, bachelor: 0.26, parent: 0.86, wantsKids: 0.01, noKids: 0.7, zeroIncome: 0.28, employed: 0.08, tattoo: 0.08, cannabis: 0.02 },
];

const INCOME_CDF: Array<[number, number]> = [
  [0, 0],
  [1, 0.15],
  [15000, 0.32],
  [25000, 0.44],
  [35000, 0.55],
  [50000, 0.66],
  [75000, 0.79],
  [100000, 0.86],
  [150000, 0.935],
  [200000, 0.965],
  [250000, 0.982],
  [400000, 0.995],
  [1000000, 0.999],
];

const EYE: Record<string, Record<string, number>> = {
  any: { brown: 0.45, blue: 0.27, hazel: 0.18, green: 0.09, gray: 0.008, amber: 0.012, hetero: 0.006, other: 0.01 },
  white: { brown: 0.28, blue: 0.33, hazel: 0.21, green: 0.13, gray: 0.02, amber: 0.015, hetero: 0.008, other: 0.007 },
  black: { brown: 0.88, blue: 0.008, hazel: 0.07, green: 0.008, gray: 0.004, amber: 0.015, hetero: 0.005, other: 0.01 },
  hispanic: { brown: 0.7, blue: 0.05, hazel: 0.16, green: 0.06, gray: 0.006, amber: 0.012, hetero: 0.006, other: 0.006 },
  asian: { brown: 0.9, blue: 0.008, hazel: 0.04, green: 0.008, gray: 0.004, amber: 0.02, hetero: 0.005, other: 0.015 },
  native: { brown: 0.72, blue: 0.04, hazel: 0.14, green: 0.04, gray: 0.01, amber: 0.02, hetero: 0.01, other: 0.02 },
  pacific: { brown: 0.8, blue: 0.02, hazel: 0.1, green: 0.02, gray: 0.01, amber: 0.02, hetero: 0.01, other: 0.02 },
  mena: { brown: 0.62, blue: 0.06, hazel: 0.2, green: 0.08, gray: 0.01, amber: 0.02, hetero: 0.008, other: 0.012 },
  multi: { brown: 0.5, blue: 0.16, hazel: 0.18, green: 0.08, gray: 0.02, amber: 0.02, hetero: 0.02, other: 0.02 },
  other: { brown: 0.55, blue: 0.14, hazel: 0.16, green: 0.07, gray: 0.02, amber: 0.02, hetero: 0.02, other: 0.02 },
};

const HAIR: Record<string, Record<string, number>> = {
  any: { black: 0.26, brown: 0.4, blonde: 0.11, red: 0.02, gray: 0.15, auburn: 0.03, bald: 0.03 },
  white: { black: 0.12, brown: 0.48, blonde: 0.18, red: 0.04, gray: 0.18 },
  black: { black: 0.78, brown: 0.12, blonde: 0.01, red: 0.01, gray: 0.08 },
  hispanic: { black: 0.55, brown: 0.32, blonde: 0.04, red: 0.01, gray: 0.08 },
  asian: { black: 0.82, brown: 0.1, blonde: 0.01, red: 0.0, gray: 0.07 },
  other: { black: 0.4, brown: 0.35, blonde: 0.08, red: 0.02, gray: 0.15 },
};

function erf(x: number) {
  const sign = Math.sign(x);
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-a * a);
  return sign * y;
}

export function normalShare(min: number, max: number, mean: number, sd: number) {
  const cdf = (x: number) => 0.5 * (1 + erf((x - mean) / (sd * Math.SQRT2)));
  return Math.max(0, Math.min(1, cdf(max) - cdf(min)));
}

function incomeCdf(value: number) {
  if (value <= 0) return 0;
  for (let i = 1; i < INCOME_CDF.length; i++) {
    const [x0, y0] = INCOME_CDF[i - 1];
    const [x1, y1] = INCOME_CDF[i];
    if (value <= x1) {
      const t = Math.log(value) - Math.log(Math.max(x0, 1));
      const span = Math.log(x1) - Math.log(Math.max(x0, 1));
      return y0 + ((y1 - y0) * t) / span;
    }
  }
  return 0.999;
}

function ageSlice(min: number, max: number) {
  return AGE_BANDS.map((band) => {
    const overlap = Math.max(0, Math.min(max, band.max) - Math.max(min, band.min) + 1);
    const width = band.max - band.min + 1;
    return { ...band, weight: band.share * (overlap / width) };
  }).filter((band) => band.weight > 0);
}

function weighted(min: number, max: number, key: "married" | "neverMarried" | "bachelor" | "parent" | "wantsKids" | "noKids" | "zeroIncome" | "employed" | "tattoo" | "cannabis") {
  const bands = ageSlice(min, max);
  const total = bands.reduce((sum, band) => sum + band.weight, 0);
  if (!total) return 0;
  return bands.reduce((sum, band) => sum + band.weight * band[key], 0) / total;
}

export function ageShare(min: number, max: number) {
  return ageSlice(min, max).reduce((sum, band) => sum + band.weight, 0);
}

export type Factor = { label: string; share: number; note: string };

export function estimate(filters: Filters) {
  const pool = filters.gender === "men" ? 127_600_000 : 134_400_000;
  const factors: Factor[] = [];
  const age = ageShare(filters.ageMin, filters.ageMax);
  factors.push({ label: "Age", share: age, note: "Census-style adult age bands, uniform inside each band." });

  const height = filters.gender === "men"
    ? { mean: 69.1, sd: 2.92 }
    : { mean: 63.7, sd: 2.68 };
  factors.push({
    label: "Height",
    share: normalShare(filters.heightMin - 0.5, filters.heightMax + 0.5, height.mean, height.sd),
    note: "CDC/NCHS adult height, normal approximation.",
  });

  const incomeLo = incomeCdf(filters.incomeMin);
  const incomeHi = filters.incomeMax >= 400000 ? 1 : incomeCdf(filters.incomeMax);
  const zeros = weighted(filters.ageMin, filters.ageMax, "zeroIncome");
  const positive = Math.max(0, incomeHi - incomeLo);
  const incomeShare = filters.incomeMin <= 0 ? zeros + (1 - zeros) * positive : (1 - zeros) * positive;
  factors.push({
    label: "Income",
    share: Math.min(1, incomeShare),
    note: "ACS-style personal income brackets, with the no-income share adjusted for age.",
  });

  if (filters.eye !== "any") {
    factors.push({
      label: "Eyes",
      share: EYE[filters.ethnicity]?.[filters.eye] ?? EYE.any[filters.eye] ?? 1,
      note: "Eye color is adjusted when an ethnicity filter is set.",
    });
  }
  if (filters.hair !== "any") {
    factors.push({
      label: "Hair",
      share: filters.hair === "bald" && filters.gender === "men" ? 0.16 : filters.hair === "bald" ? 0.01 : HAIR[filters.ethnicity]?.[filters.hair] ?? HAIR.any[filters.hair] ?? 0.02,
      note: "Hair color is an ethnicity-adjusted estimate, not a census field.",
    });
  }
  if (filters.ethnicity !== "any") {
    const shares: Record<string, number> = { white: 0.584, hispanic: 0.195, black: 0.137, asian: 0.064, native: 0.013, pacific: 0.003, mena: 0.01, multi: 0.031, other: 0.02 };
    factors.push({ label: "Ethnicity", share: shares[filters.ethnicity] ?? 0.03, note: "Census 2023 race and Hispanic origin, adult-scale." });
  }
  if (filters.religion !== "any") {
    const shares: Record<string, number> = {
      christian: 0.63, protestant: 0.4, catholic: 0.2, evangelical: 0.24, mormon: 0.016, orthodox: 0.005, none: 0.28, atheist: 0.05, agnostic: 0.06, jewish: 0.02, muslim: 0.011, hindu: 0.007, buddhist: 0.007, sikh: 0.002, other: 0.03,
    };
    factors.push({ label: "Religion", share: shares[filters.religion] ?? 0.03, note: "Pew religious identification, adults." });
  }
  if (filters.drinks !== "any") {
    const shares: Record<string, number> = { never: 0.38, rarely: 0.16, sometimes: 0.28, weekly: 0.12, regularly: 0.12, daily: 0.06 };
    factors.push({ label: "Alcohol", share: shares[filters.drinks] ?? 1, note: "Gallup: about 38% of adults do not drink." });
  }
  if (filters.smokes !== "any") {
    const shares: Record<string, number> = { never: 0.67, former: 0.21, now: 0.115, occasional: 0.04, vape: 0.06 };
    factors.push({ label: "Cigarettes", share: shares[filters.smokes] ?? 1, note: "CDC adult cigarette smoking." });
  }
  if (filters.cannabis !== "any") {
    const past = weighted(filters.ageMin, filters.ageMax, "cannabis");
    factors.push({
      label: "Cannabis",
      share: filters.cannabis === "yes" ? past : 1 - past,
      note: "NSDUH past-year cannabis, higher under 35.",
    });
  }
  if (filters.married !== "any") {
    const married = weighted(filters.ageMin, filters.ageMax, "married");
    const never = weighted(filters.ageMin, filters.ageMax, "neverMarried");
    const divorced = Math.min(0.16, Math.max(0.02, (filters.ageMin - 18) / 220));
    const widowed = filters.ageMin >= 65 ? 0.14 : filters.ageMin >= 50 ? 0.04 : 0.008;
    const share = filters.married === "yes" ? married : filters.married === "never" ? never : filters.married === "divorced" ? divorced : filters.married === "widowed" ? widowed : filters.married === "separated" ? 0.02 : 1 - married;
    factors.push({ label: "Marriage", share, note: "Census marital status, conditioned on the age range." });
  }
  if (filters.body !== "any") {
    const bmi = filters.gender === "men" ? { mean: 29.0, sd: 5.8 } : { mean: 29.6, sd: 7.1 };
    const ranges: Record<string, [number, number]> = {
      slim: [17, 22],
      average: [22, 27.5],
      athletic: [21, 26],
      plus: [30, 45],
    };
    const [lo, hi] = ranges[filters.body] ?? [15, 50];
    factors.push({
      label: "Body",
      share: filters.body === "athletic" ? normalShare(lo, hi, bmi.mean, bmi.sd) * 0.35 : normalShare(lo, hi, bmi.mean, bmi.sd),
      note: "NHANES BMI. Athletic is a subset of that range, not a census category.",
    });
  }
  if (filters.weightMin > 90 || filters.weightMax < 320) {
    const midHeight = (filters.heightMin + filters.heightMax) / 2;
    const toBmi = (lb: number) => (lb * 703) / (midHeight * midHeight);
    const bmi = filters.gender === "men" ? { mean: 29.0, sd: 5.8 } : { mean: 29.6, sd: 7.1 };
    factors.push({
      label: "Weight",
      share: normalShare(toBmi(filters.weightMin), toBmi(filters.weightMax), bmi.mean, bmi.sd),
      note: "Converted to BMI at the middle of the height range, so it is not multiplied by height again.",
    });
  }
  if (filters.kids !== "either") {
    const share = filters.kids === "yes"
      ? weighted(filters.ageMin, filters.ageMax, "wantsKids")
      : weighted(filters.ageMin, filters.ageMax, "noKids");
    factors.push({ label: "Wants kids", share, note: "Stated fertility preference, conditioned on age. Not a birth record." });
  }
  if (filters.hasChildren !== "any") {
    const parent = weighted(filters.ageMin, filters.ageMax, "parent");
    factors.push({
      label: "Already a parent",
      share: filters.hasChildren === "yes" ? parent : 1 - parent,
      note: "Share who have had a child, conditioned on age.",
    });
  }
  if (filters.education !== "any") {
    const bachelor = weighted(filters.ageMin, filters.ageMax, "bachelor");
    const shares: Record<string, number> = {
      less: 0.09,
      hs: 0.28,
      some: 0.15,
      associate: 0.1,
      college: bachelor,
      grad: bachelor * 0.35,
      professional: bachelor * 0.08,
    };
    factors.push({ label: "Education", share: shares[filters.education] ?? bachelor, note: "Census attainment. A degree is much rarer under 25, so age changes this." });
  }
  if (filters.politics !== "any") {
    const shares: Record<string, number> = { liberal: 0.25, moderate: 0.36, conservative: 0.36, democrat: 0.28, republican: 0.28, independent: 0.41, libertarian: 0.04, socialist: 0.06, apolitical: 0.12 };
    factors.push({ label: "Politics", share: shares[filters.politics] ?? 0.25, note: "Gallup ideology, or party including leaners." });
  }
  if (filters.region !== "any") {
    const shares: Record<string, number> = { northeast: 0.17, midwest: 0.205, south: 0.389, west: 0.236 };
    factors.push({ label: "Region", share: shares[filters.region] ?? 0.2, note: "Census regional population." });
  }
  if (filters.urban !== "any") {
    factors.push({ label: "Urban or rural", share: filters.urban === "urban" ? 0.8 : 0.2, note: "2020 Census urban share." });
  }
  if (filters.employed !== "any") {
    const employed = weighted(filters.ageMin, filters.ageMax, "employed");
    factors.push({
      label: "Employment",
      share: filters.employed === "yes" ? employed : 1 - employed,
      note: "Employment-population ratio, conditioned on age.",
    });
  }
  if (filters.exercise !== "any") {
    factors.push({ label: "Exercise", share: filters.exercise === "regular" ? 0.24 : 0.47, note: "CDC: 24% meet both activity guidelines. Any leisure activity is about half." });
  }
  if (filters.tattoos !== "any") {
    const tattoo = weighted(filters.ageMin, filters.ageMax, "tattoo");
    factors.push({ label: "Tattoos", share: filters.tattoos === "yes" ? tattoo : 1 - tattoo, note: "Survey estimate, higher under 40." });
  }
  if (filters.disability !== "any") {
    factors.push({ label: "Disability", share: filters.disability === "yes" ? 0.287 : 0.713, note: "CDC: 28.7% of adults have a disability. The definition is broad." });
  }
  if (filters.veteran !== "any") {
    const veteran = filters.gender === "men"
      ? (filters.ageMin >= 55 ? 0.22 : filters.ageMax < 35 ? 0.03 : 0.09)
      : 0.015;
    factors.push({ label: "Veteran", share: filters.veteran === "yes" ? veteran : 1 - veteran, note: "VA/Census veteran share, much higher for older men." });
  }
  if (filters.language !== "any") {
    const shares: Record<string, number> = { english: 0.78, spanish: 0.135, chinese: 0.011, tagalog: 0.005, vietnamese: 0.004, arabic: 0.004, french: 0.003, korean: 0.003, other: 0.04 };
    factors.push({ label: "Language at home", share: shares[filters.language] ?? 0.08, note: "ACS language spoken at home." });
  }
  if (filters.marriageIntent !== "any") {
    factors.push({ label: "Wants marriage", share: filters.marriageIntent === "yes" ? 0.62 : 0.22, note: "Survey-style share of unmarried adults who want to marry. Not age-exact." });
  }

  const active = factors.filter((factor) => factor.share < 0.999);
  const share = active.reduce((product, factor) => product * factor.share, 1);
  return {
    pool,
    share,
    count: Math.max(0, Math.round(pool * share)),
    factors: active,
    oneIn: share > 0 ? Math.max(1, Math.round(1 / share)) : Infinity,
  };
}

export function inchesLabel(n: number) {
  return `${Math.floor(n / 12)}'${n % 12}"`;
}
