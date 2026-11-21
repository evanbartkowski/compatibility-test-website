import Link from "next/link";
import type { Metadata } from "next";
import { brandConfig } from "@/config/brand";

export const metadata: Metadata = { title: "Terms of use", description: "Adult access, result limitations, respectful use, and sharing choices." };

export default function TermsPage() {
  return <article className="site-shell py-12 sm:py-16 max-w-3xl">
    <h1 className="font-display text-4xl">Terms of use</h1>
    <p className="mt-5 text-[var(--ink-secondary)]">{brandConfig.name} offers optional self-reflection and conversation tools for adults 18 and older.</p>
    <div className="privacy-copy">
      <section><h2>What results mean</h2><p>Scores summarize your answers using this site’s own scoring system. They are not clinical diagnoses, validated IQ scores, professional advice, or predictions of compatibility or relationship success. Population research describes the study and date shown alongside it; website community statistics describe participating users.</p></section>
      <section><h2>Your choices and boundaries</h2><p>You may skip questions, keep results private, or stop at any time. A preference, fantasy, comparison, or suggestion is not consent to an activity. Advice is optional; respect everyone’s current boundaries and freely given consent.</p></section>
      <section><h2>Respectful use</h2><p>Use your own account and information. Do not access another person’s private results without authorization, upload another person’s private information without permission, abuse invitations or email features, or interfere with the service. Share only information you are entitled to share.</p></section>
      <section><h2>Privacy and sharing</h2><p>Read the <Link href="/privacy" className="text-link">privacy notice</Link> before answering. Shared links may expire or be revoked. A person who receives an image, download, email attachment, or screenshot can keep a copy outside this site’s control. Review your selections before sharing.</p></section>
      <section><h2>Availability and your rights</h2><p>Features can be unavailable while offline or when an optional service is not configured. Keep your own copy of results you want to retain. Nothing on this page removes rights or protections that applicable law gives you.</p></section>
    </div>
  </article>;
}
