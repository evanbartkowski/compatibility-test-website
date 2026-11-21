import Link from "next/link";
import { Heart } from "lucide-react";
import { brandConfig } from "@/config/brand";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand-link">
              <Heart size={23} className="text-[var(--accent-plum)]" />
              {brandConfig.name}
            </Link>
            <p>
              A little more self-awareness.
              <br />A whole new way to connect.
            </p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/explore">Discover tests</Link>
            <Link href="/couples">Compatibility</Link>
            <Link href="/community">Community</Link>
            <Link href="/settings">Privacy & account</Link>
            <Link href="/privacy">Privacy notice</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {brandConfig.name}. For curious adults
            18+.
          </p>
          <p>
            Made for reflection and conversation. Your answers stay private.
          </p>
        </div>
      </div>
    </footer>
  );
}
