"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { defaultFilters, estimate, inchesLabel, type Filters } from "./standards-model";

export function StandardsCalculator() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [advanced, setAdvanced] = useState(false);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const result = useMemo(() => estimate(filters), [filters]);
  const lit = Math.max(1, Math.round(180 * Math.min(result.share, 1)));
  const shown = formatPercent(result.share);

  return (
    <div className="standards-screen">
      <header className="standards-heading">
        <p className="standards-kicker">The Delusional Standards Test</p>
        <h1>How rare is the person you are filtering for?</h1>
      </header>
      <aside className="standards-panel" aria-label="Your filters">
        <div className="standards-toggle" role="group" aria-label="Looking for">
          <button type="button" data-on={filters.gender === "women"} onClick={() => set("gender", "women")}>Women</button>
          <button type="button" data-on={filters.gender === "men"} onClick={() => set("gender", "men")}>Men</button>
        </div>
        <DualRange label="Age" min={18} max={80} lo={filters.ageMin} hi={filters.ageMax} format={(n) => String(n)} onChange={(lo, hi) => setFilters((f) => ({ ...f, ageMin: lo, ageMax: hi }))} />
        <DualRange label="Height" min={58} max={80} lo={filters.heightMin} hi={filters.heightMax} format={inchesLabel} onChange={(lo, hi) => setFilters((f) => ({ ...f, heightMin: lo, heightMax: hi }))} />
        <DualRange label="Income" min={0} max={400000} step={5000} lo={filters.incomeMin} hi={filters.incomeMax} format={(n) => (n >= 400000 ? "$400k+" : `$${Math.round(n / 1000)}k`)} onChange={(lo, hi) => setFilters((f) => ({ ...f, incomeMin: lo, incomeMax: hi }))} />
        <div className="standards-grid">
          <Select label="Eyes" value={filters.eye} set={(v) => set("eye", v)} options={[["any", "Any"], ["brown", "Brown"], ["blue", "Blue"], ["hazel", "Hazel"], ["green", "Green"], ["gray", "Gray"], ["amber", "Amber"], ["hetero", "Heterochromia"], ["other", "Other"]]} />
          <Select label="Body" value={filters.body} set={(v) => set("body", v)} options={[["any", "Any"], ["slim", "Slim"], ["average", "Average"], ["athletic", "Athletic"], ["plus", "Plus"]]} />
          <Select label="Kids" value={filters.kids} set={(v) => set("kids", v)} options={[["either", "Either"], ["yes", "Wants kids"], ["no", "Does not want kids"]]} />
          <Select label="Married now" value={filters.married} set={(v) => set("married", v)} options={[["any", "Any"], ["not", "Not married"], ["never", "Never married"], ["yes", "Married"], ["divorced", "Divorced"], ["separated", "Separated"], ["widowed", "Widowed"]]} />
          <Select label="Education" value={filters.education} set={(v) => set("education", v)} options={[["any", "Any"], ["less", "No high school diploma"], ["hs", "High school"], ["some", "Some college"], ["associate", "Associate degree"], ["college", "Bachelor's"], ["grad", "Master's"], ["professional", "Professional or doctorate"]]} />
          <Select label="Ethnicity" value={filters.ethnicity} set={(v) => set("ethnicity", v)} options={[["any", "Any"], ["white", "White"], ["black", "Black"], ["hispanic", "Hispanic"], ["asian", "Asian"], ["native", "American Indian"], ["pacific", "Pacific Islander"], ["mena", "Middle Eastern"], ["multi", "Two or more races"], ["other", "Another group"]]} />
          <Select label="Religion" value={filters.religion} set={(v) => set("religion", v)} options={[["any", "Any"], ["christian", "Christian"], ["protestant", "Protestant"], ["evangelical", "Evangelical"], ["catholic", "Catholic"], ["mormon", "Mormon"], ["orthodox", "Orthodox"], ["none", "No religion"], ["atheist", "Atheist"], ["agnostic", "Agnostic"], ["jewish", "Jewish"], ["muslim", "Muslim"], ["hindu", "Hindu"], ["buddhist", "Buddhist"], ["sikh", "Sikh"], ["other", "Another faith"]]} />
          <Select label="Drinks" value={filters.drinks} set={(v) => set("drinks", v)} options={[["any", "Any"], ["never", "Does not drink"], ["rarely", "Rarely"], ["sometimes", "Sometimes"], ["weekly", "Weekly"], ["regularly", "Regularly"], ["daily", "Daily"]]} />
        </div>
        <button type="button" className="standards-advanced" aria-expanded={advanced} onClick={() => setAdvanced((v) => !v)}>
          {advanced ? "Hide advanced options" : "Advanced options"}
        </button>
        {advanced && (
          <div className="standards-grid">
            <DualRange label="Weight, lb" min={90} max={320} lo={filters.weightMin} hi={filters.weightMax} format={(n) => String(n)} onChange={(lo, hi) => setFilters((f) => ({ ...f, weightMin: lo, weightMax: hi }))} />
            <Select label="Hair" value={filters.hair} set={(v) => set("hair", v)} options={[["any", "Any"], ["black", "Black"], ["brown", "Brown"], ["blonde", "Blonde"], ["red", "Red"], ["gray", "Gray"], ["auburn", "Auburn"], ["bald", "Bald or shaved"]]} />
            <Select label="Cigarettes" value={filters.smokes} set={(v) => set("smokes", v)} options={[["any", "Any"], ["never", "Never smoked"], ["former", "Former smoker"], ["occasional", "Occasional"], ["now", "Smokes now"], ["vape", "Vapes"]]} />
            <Select label="Cannabis" value={filters.cannabis} set={(v) => set("cannabis", v)} options={[["any", "Any"], ["no", "Not in the past year"], ["yes", "Past-year use"]]} />
            <Select label="Already a parent" value={filters.hasChildren} set={(v) => set("hasChildren", v)} options={[["any", "Any"], ["no", "No"], ["yes", "Yes"]]} />
            <Select label="Wants marriage" value={filters.marriageIntent} set={(v) => set("marriageIntent", v)} options={[["any", "Any"], ["yes", "Yes"], ["no", "No"]]} />
            <Select label="Politics" value={filters.politics} set={(v) => set("politics", v)} options={[["any", "Any"], ["liberal", "Liberal"], ["moderate", "Moderate"], ["conservative", "Conservative"], ["democrat", "Democrat"], ["republican", "Republican"], ["independent", "Independent"], ["libertarian", "Libertarian"], ["socialist", "Socialist"], ["apolitical", "Apolitical"]]} />
            <Select label="Region" value={filters.region} set={(v) => set("region", v)} options={[["any", "Any"], ["northeast", "Northeast"], ["midwest", "Midwest"], ["south", "South"], ["west", "West"]]} />
            <Select label="City or country" value={filters.urban} set={(v) => set("urban", v)} options={[["any", "Any"], ["urban", "Urban"], ["rural", "Rural"]]} />
            <Select label="Employed" value={filters.employed} set={(v) => set("employed", v)} options={[["any", "Any"], ["yes", "Employed"], ["no", "Not employed"]]} />
            <Select label="Exercise" value={filters.exercise} set={(v) => set("exercise", v)} options={[["any", "Any"], ["some", "Some leisure activity"], ["regular", "Meets both guidelines"]]} />
            <Select label="Tattoos" value={filters.tattoos} set={(v) => set("tattoos", v)} options={[["any", "Any"], ["yes", "Has one"], ["no", "None"]]} />
            <Select label="Disability" value={filters.disability} set={(v) => set("disability", v)} options={[["any", "Any"], ["no", "No disability"], ["yes", "Has a disability"]]} />
            <Select label="Veteran" value={filters.veteran} set={(v) => set("veteran", v)} options={[["any", "Any"], ["yes", "Veteran"], ["no", "Not a veteran"]]} />
            <Select label="Language at home" value={filters.language} set={(v) => set("language", v)} options={[["any", "Any"], ["english", "English only"], ["spanish", "Spanish"], ["chinese", "Chinese"], ["tagalog", "Tagalog"], ["vietnamese", "Vietnamese"], ["arabic", "Arabic"], ["french", "French"], ["korean", "Korean"], ["other", "Another language"]]} />
          </div>
        )}
        <p className="standards-note">Adults 18 and older only. Marriage, work, degrees, and parenthood change with the age range. The combined number multiplies the separate shares, so a long list looks rarer than a real dating pool.</p>
      </aside>
      <section className="standards-result" aria-label="Your estimate">
        <p className="standards-result-label">Your estimated match</p>
        <output className="standards-percent" aria-label="Estimated share matching your filters" aria-live="polite">{shown}</output>
        <p className="standards-lead">of adult American {filters.gender} land inside every filter.</p>
        <p className="standards-count">About {result.count.toLocaleString()} of {result.pool.toLocaleString()}. Roughly 1 in {result.oneIn.toLocaleString()}.</p>
        <div className="standards-dots" aria-hidden="true">
          {Array.from({ length: 180 }, (_, i) => <span key={i} data-on={i < lit} />)}
        </div>
        <details className="standards-breakdown">
        <summary>How this estimate is calculated</summary>
        <ul className="standards-factors">
          {result.factors.map((factor) => (
            <li key={factor.label}>
              <span>{factor.label}</span>
              <strong>{formatPercent(factor.share)}</strong>
              <i>{factor.note}</i>
            </li>
          ))}
        </ul>
        </details>
        <Link href="/explore" className="text-link">Back to the tests</Link>
      </section>
    </div>
  );
}

function formatPercent(share: number) {
  if (!Number.isFinite(share) || share <= 0) return "0%";
  const percent = share * 100;
  if (percent >= 10) return `${percent.toFixed(1)}%`;
  if (percent >= 1) return `${percent.toFixed(2)}%`;
  const places = Math.min(8, Math.max(2, Math.ceil(-Math.log10(percent)) + 1));
  return `${percent.toFixed(places)}%`;
}

function DualRange({
  label, min, max, step = 1, lo, hi, format, onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  lo: number;
  hi: number;
  format: (n: number) => string;
  onChange: (lo: number, hi: number) => void;
}) {
  return (
    <fieldset className="dual-range">
      <legend>{label}</legend>
      <label className="range-control">
      <span>Minimum <output>{format(lo)}</output></span>
      <input aria-label={`${label} minimum`} type="range" min={min} max={max} step={step} value={lo} onChange={(e) => onChange(Math.min(Number(e.target.value), hi), hi)} />
      </label>
      <label className="range-control">
      <span>Maximum <output>{format(hi)}</output></span>
      <input aria-label={`${label} maximum`} type="range" min={min} max={max} step={step} value={hi} onChange={(e) => onChange(lo, Math.max(Number(e.target.value), lo))} />
      </label>
    </fieldset>
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
