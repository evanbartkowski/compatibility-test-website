import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Figtree } from "next/font/google";
import { brandConfig } from "@/config/brand";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://truth-desire.web.app"),
  title: {
    default: "SoulFlame | Viral Tests: BDSM, Kink, IQ, Love & Compatibility",
    template: `%s · ${brandConfig.name}`,
  },
  description:
    "Take the viral tests on SoulFlame: The BDSM Test, The Kink Test, The Sex Toy Test, The Love Compatibility Test, The IQ Test, The Friendship Test, Love Language, Sexual Desire, and 20 deep personality & relationship assessments. 100% free and private.",
  keywords: [
    "SoulFlame",
    "soulflame",
    "soulflame test",
    "BDSM test",
    "the kink test",
    "the sex toy test",
    "love compatibility test",
    "IQ test",
    "friendship test",
    "love language test",
    "sexual desire test",
    "husband wife test",
    "partner finding test",
    "icks test",
    "threesome test",
    "couples test",
    "compatibility test",
    "personality quiz",
    "relationship assessments",
    "erotic blueprint",
  ],
  authors: [{ name: "SoulFlame", url: "https://truth-desire.web.app" }],
  creator: "SoulFlame",
  publisher: "SoulFlame",
  applicationName: "SoulFlame",
  category: "lifestyle",
  classification: "Personality, Love & Compatibility Discovery",
  alternates: {
    canonical: "https://truth-desire.web.app",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://truth-desire.web.app",
    siteName: "SoulFlame",
    title: "SoulFlame | Viral Tests: BDSM, Kink, IQ, Love & Compatibility",
    description:
      "Take the viral tests on SoulFlame: BDSM, Kink, Love Compatibility, IQ, Friendship, Love Language, and 40 deep assessments.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SoulFlame - Viral Personality, Intimacy & Compatibility Tests",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoulFlame | Viral Tests: BDSM, Kink, IQ, Love & Compatibility",
    description:
      "Take the viral tests on SoulFlame: BDSM, Kink, Love Compatibility, IQ, Friendship, and 40 relationship assessments.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icon.svg", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

const SCHEMA_ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://truth-desire.web.app/#website",
      "url": "https://truth-desire.web.app/",
      "name": "SoulFlame",
      "alternateName": [
        "SoulFlame Tests",
        "SoulFlame Compatibility",
        "SoulFlame Quizzes",
      ],
      "description":
        "Viral personality, love compatibility, kink, BDSM, and intimacy assessments for couples and individuals.",
      "inLanguage": "en-US",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://truth-desire.web.app/explore?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://truth-desire.web.app/#organization",
      "name": "SoulFlame",
      "url": "https://truth-desire.web.app/",
      "logo": "https://truth-desire.web.app/icon.svg",
    },
    {
      "@type": "ItemList",
      "name": "Popular Viral Tests on SoulFlame",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "The BDSM Test",
          "url": "https://truth-desire.web.app/assess/bdsm-power-dynamics-test",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "The Kink Test",
          "url": "https://truth-desire.web.app/assess/kink-curiosity-catalog",
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "The Sex Toy Test",
          "url": "https://truth-desire.web.app/assess/toys-tools-gear-preferences",
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "The Love Compatibility Test",
          "url": "https://truth-desire.web.app/assess/attachment-style-discovery",
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "The IQ Test",
          "url": "https://truth-desire.web.app/assess/big-five-personality-profile",
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "The Friendship Test",
          "url": "https://truth-desire.web.app/assess/emotional-availability-reflection",
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "The Love Language Test",
          "url": "https://truth-desire.web.app/assess/communication-language-profile",
        },
        {
          "@type": "ListItem",
          "position": 7,
          "name": "The Sexual Desire Test",
          "url": "https://truth-desire.web.app/assess/desire-reality-map",
        },
        {
          "@type": "ListItem",
          "position": 8,
          "name": "The Husband / Wife Material Test",
          "url": "https://truth-desire.web.app/assess/intimacy-partner-preferences",
        },
        {
          "@type": "ListItem",
          "position": 9,
          "name": "The Partner Finding Test",
          "url": "https://truth-desire.web.app/assess/attachment-style-discovery",
        },
        {
          "@type": "ListItem",
          "position": 10,
          "name": "The Icks & Turn-Offs Test",
          "url": "https://truth-desire.web.app/assess/relationship-dealbreakers-boundaries",
        },
      ],
    },
  ],
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("between_us_theme");var next=(t==="light"||t==="dark")?t:"dark";var r=document.documentElement;r.setAttribute("data-theme",next);if(next==="dark"){r.classList.add("dark")}else{r.classList.remove("dark")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`dark ${figtree.variable} ${display.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SCHEMA_ORG_JSON_LD),
          }}
        />
        <Script id="between-us-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>
          <AuthProvider>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <SiteHeader />
            <main id="main-content" tabIndex={-1} className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
