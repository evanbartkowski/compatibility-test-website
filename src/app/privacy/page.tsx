import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Privacy & how your information is used",
  description:
    "Understand private results, optional statistics, sharing and deletion.",
};
export default function PrivacyPage() {
  return (
    <article className="site-shell py-12 sm:py-16 max-w-3xl">
      <span className="intro-pill">Your choices come first</span>
      <h1 className="font-display text-4xl sm:text-5xl mt-6">
        Privacy, in plain language.
      </h1>
      <p className="text-[var(--ink-muted)] mt-5 leading-relaxed">
        Truth Desire is for adults 18 or older. These reflections describe your
        answers in context. They are not diagnoses or predictions of
        relationship success.
      </p>
      <div className="privacy-copy">
        <section>
          <h2>What gets saved</h2>
          <p>
            Completed attempts include your answers, consent choices, scores,
            test version, scoring version and completion date. The server stores
            these privately on this deployment. Unfinished drafts stay in your
            browser’s local storage, including on a shared device, until you
            remove them. No account is required.
          </p>
        </section>
        <section>
          <h2>Guest access and optional accounts</h2>
          <p>
            A private browser cookie gives guests access to their saved
            attempts. It lasts up to 180 days. Clearing it loses guest access;
            it does not itself erase the saved records. Saved records remain
            until you delete them. An optional Firebase account adds your
            sign-in identity and profile. Claimed results require that account,
            including after signing out on the original device. Account sessions
            expire after five days and reconnect on sign-in.
          </p>
        </section>
        <section>
          <h2>Community participation is optional</h2>
          <p>
            Only results with your explicit opt-in enter aggregate statistics.
            We use the latest eligible result for each person in a matching test
            version, scoring version and form. Cohorts and categories require at
            least 50 participants before statistics are displayed. Demographic
            questions are optional and filtered cohorts need the same minimum.
            Percentiles describe participating website users, rather than the
            general population. You can withdraw a result’s participation from
            its community tab.
          </p>
        </section>
        <section>
          <h2>Comparisons and sharing</h2>
          <p>
            Partner invitations use unpredictable, expiring links. Both people
            choose which categories and highlights to show. Raw answer maps are
            never sent to a partner. Prediction or voting game answer details
            require both people to opt in. Private answer locks and firm
            boundaries are respected. A comparison score never establishes
            consent.
          </p>
          <p>
            A shared profile copies only the summary fields you select, for up
            to 30 days. Anyone with that link can see those selected fields. You
            can revoke it from My profile. Deleting a source result invalidates
            dependent comparisons and shared profiles.
          </p>
        </section>
        <section>
          <h2>Downloads and email</h2>
          <p>
            Result downloads omit individual answers by default. Sensitive
            scores and private answer details have separate export choices.
            Result cards start with no selected fields. A full private data
            export is available in account settings. Downloads and screenshots
            remain with their recipients after a link is revoked.
          </p>
          <p>
            Email requires address verification and a configured delivery
            provider. Secure email links expire; PDF attachments persist in the
            recipient’s inbox. Delivery services receive the address and content
            you choose to send.
          </p>
        </section>
        <section>
          <h2>Erasing your information</h2>
          <p>
            History lets you delete one attempt. Account settings can erase
            saved app data and drafts on this browser. Deleting an optional
            account requires a recent sign-in, erases its cloud profile and
            sign-in identity, removes its saved app data and revokes existing
            app sessions. The app does not erase downloads, inbox attachments or
            drafts saved on other devices. It does not create application
            backups; any separately configured infrastructure backup follows the
            deployment operator’s retention settings.
          </p>
          <Link href="/settings" className="button button-primary mt-5">
            Open privacy settings
          </Link>
        </section>
      </div>
    </article>
  );
}
