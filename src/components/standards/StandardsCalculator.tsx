"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Gender = "men" | "women";

const AGE_BANDS = [
  { min: 18, max: 24, share: 0.12 },
  { min: 25, max: 34, share: 0.18 },
  { min: 35, max: 44, share: 0.17 },
  { min: 45, max: 54, share: 0.16 },
  { min: 55, max: 64, share: 0.16 },
  { min: 65, max: 80, share: 0.21 },
];

const HEIGHT_MEN = [
  { min: 60, max: 65, share: 0.15 },
  { min: 66, max: 67, share: 0.18 },
  { min: 68, max: 69, share: 0.27 },
  { min: 70, max: 71, share: 0.22 },
  { min: 72, max: 73, share: 0.12 },
  { min: 74, max: 84, share: 0.06 },
];
const HEIGHT_WOMEN = [
  { min: 58, max: 61, share: 0.22 },
  { min: 62, max: 63, share: 0.28 },
  { min: 64, max: 65, share: 0.26 },
  { min: 66, max: 67, share: 0.16 },
  { min: 68, max: 78, share: 0.08 },
];

function bandShare(bands: { min: number; max: number; share: number }[], min: number, max: number) {
  const total = bands.reduce((sum, band) => sum + band.share, 0);
  const hit = bands.reduce((sum, band) => {
    const overlap = Math.max(0, Math.min(max, band.max) - Math.max(min, band.min) + 1);
    const width = band.max - band.min + 1;
    return sum + band.share * (overlap / width);
  }, 0);
  return Math.min(1, hit / total);
}

function inchesLabel(n: number) {
  return `${Math.floor(n / 12)}'${n % 12}"`;
}

export function StandardsCalculator() {
  const [gender, setGender] = useState<Gender>("men");
  const [ageMin, setAgeMin] = useState(22);
  const [ageMax, setAgeMax] = useState(42);
  const [heightMin, setHeightMin] = useState(68);
  const [income, setIncome] = useState(150000);
  const [eye, setEye] = useState("any");
  const [religion, setReligion] = useState("any");
  const [drinks, setDrinks] = useState("any");
  const [smokes, setSmokes] = useState("any");
  const [married, setMarried] = useState("no");
  const [body, setBody] = useState("any");
  const [kids, setKids] = useState("either");
  const [education, setEducation] = useState("any");
  const [ethnicity, setEthnicity] = useState("any");

  const result = useMemo(() => {
    const pool = gender === "men" ? 127_000_000 : 133_000_000;
    const factors: Array<[string, number]> = [
      ["Age", bandShare(AGE_BANDS, ageMin, ageMax)],
      ["Height", bandShare(gender === "men" ? HEIGHT_MEN : HEIGHT_WOMEN, heightMin, 84)],
      ["Income", income >= 150000 ? 0.08 : income >= 100000 ? 0.2 : income >= 75000 ? 0.32 : income >= 50000 ? 0.5 : 0.7],
      ["Eyes", eye === "any" ? 1 : eye === "blue" ? 0.27 : eye === "green" ? 0.09 : eye === "hazel" ? 0.18 : 0.45],
      ["Religion", religion === "any" ? 1 : religion === "christian" ? 0.63 : religion === "none" ? 0.29 : 0.08],
      ["Drinks", drinks === "any" ? 1 : drinks === "never" ? 0.3 : 0.55],
      ["Smokes", smokes === "any" ? 1 : smokes === "never" ? 0.8 : 0.12],
      ["Married", married === "any" ? 1 : married === "no" ? 0.48 : 0.5],
      ["Body", body === "any" ? 1 : body === "athletic" ? 0.15 : body === "slim" ? 0.2 : 0.25],
      ["Kids", kids === "either" ? 1 : 0.35],
      ["Education", education === "any" ? 1 : education === "college" ? 0.35 : 0.13],
      ["Ethnicity", ethnicity === "any" ? 1 : ethnicity === "white" ? 0.59 : ethnicity === "black" ? 0.13 : ethnicity === "hispanic" ? 0.19 : ethnicity === "asian" ? 0.06 : 0.03],
    ];
    const share = factors.reduce((p, [, n]) => p * n, 1);
    return { pool, share, count: Math.max(0, Math.round(pool * share)), factors };
  }, [gender, ageMin, ageMax, heightMin, income, eye, religion, drinks, smokes, married, body, kids, education, ethnicity]);

  const dots = 160;
  const lit = Math.max(1, Math.round(dots * Math.min(result.share, 1)));

  return (
    <div className="standards-page">
      <aside>
        <h1>What percent of {gender} meet your standards?</h1>
        <label>Looking for
          <span>
            <button type="button" data-on={gender === "women"} onClick={() => setGender("women")}>Women</button>
            <button type="button" data-on={gender === "men"} onClick={() => setGender("men")}>Men</button>
          </span>
        </label>
        <label>Age {ageMin}–{ageMax}
          <input type="range" min={18} max={80} value={ageMin} onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax))} />
          <input type="range" min={18} max={80} value={ageMax} onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin))} />
        </label>
        <label>Height {inchesLabel(heightMin)}+
          <input type="range" min={58} max={78} value={heightMin} onChange={(e) => setHeightMin(Number(e.target.value))} />
        </label>
        <label>Minimum income ${income.toLocaleString()}
          <input type="range" min={0} max={250000} step={10000} value={income} onChange={(e) => setIncome(Number(e.target.value))} />
        </label>
        <Select label="Eye color" value={eye} set={setEye} options={[["any", "Any"], ["brown", "Brown"], ["blue", "Blue"], ["hazel", "Hazel"], ["green", "Green"]]} />
        <Select label="Religion" value={religion} set={setReligion} options={[["any", "Any"], ["christian", "Christian"], ["none", "No religion"], ["other", "Another religion"]]} />
        <Select label="Drinks" value={drinks} set={setDrinks} options={[["any", "Any"], ["never", "Never"], ["sometimes", "Sometimes or more"]]} />
        <Select label="Smokes" value={smokes} set={setSmokes} options={[["any", "Any"], ["never", "Never"], ["yes", "Smokes"]]} />
        <Select label="Exclude married" value={married} set={setMarried} options={[["no", "Yes, exclude"], ["any", "Include married"], ["yes", "Married only"]]} />
        <Select label="Body type" value={body} set={setBody} options={[["any", "Any"], ["slim", "Slim"], ["athletic", "Athletic"], ["other", "A narrower type"]]} />
        <Select label="Wants kids" value={kids} set={setKids} options={[["either", "Either"], ["yes", "Yes"], ["no", "No"]]} />
        <Select label="Education" value={education} set={setEducation} options={[["any", "Any"], ["college", "College degree"], ["grad", "Graduate degree"]]} />
        <Select label="Ethnicity" value={ethnicity} set={setEthnicity} options={[["any", "Any"], ["white", "White"], ["black", "Black"], ["hispanic", "Hispanic"], ["asian", "Asian"], ["other", "Another group"]]} />
        <p>Adults 18+ only. Rough public estimates, not a live Census file. Traits are multiplied as if independent, so a narrow list looks rarer than real life.</p>
      </aside>
      <section>
        <p className="standards-percent">{(result.share * 100).toFixed(2)}%</p>
        <p>of adult American {gender} meet every filter you set.</p>
        <p>That is about {result.count.toLocaleString()} of {result.pool.toLocaleString()}.</p>
        <div className="standards-dots" aria-hidden="true">
          {Array.from({ length: dots }, (_, i) => (
            <span key={i} data-on={i < lit} />
          ))}
        </div>
        <p>{result.share < 0.01 ? "Your list is doing the rejecting. The person can exist and still be a bad plan." : "The pool is not the problem. Meeting them still is."}</p>
        <Link href="/explore">Back to the tests</Link>
      </section>
    </div>
  );
}

function Select({ label, value, set, options }: { label: string; value: string; set: (v: string) => void; options: string[][] }) {
  return (
    <label>{label}
      <select value={value} onChange={(e) => set(e.target.value)}>
        {options.map(([v, name]) => <option key={v} value={v}>{name}</option>)}
      </select>
    </label>
  );
}
