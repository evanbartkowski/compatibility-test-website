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
  title: {
    default: `${brandConfig.name} | Personality, Intimacy & Compatibility Discovery`,
    template: `%s · ${brandConfig.name}`,
  },
  description: brandConfig.tagline,
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
