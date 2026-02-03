/**
 * Shared footer component.
 * variant="full"  — dark 3-column footer (landing page)
 * variant="compact" — single-line footer (inner pages, auth pages)
 */

import { Link } from 'react-router-dom'
import { APP_VERSION } from '@/lib/constants'

interface FooterProps {
  variant?: 'full' | 'compact'
}

export default function Footer({ variant = 'compact' }: FooterProps) {
  if (variant === 'full') {
    return (
      <footer className="bg-sidebar text-sidebar-foreground/60 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand + tagline */}
            <div>
              <img
                src="/natnlab-logo+name-svg.svg"
                alt="NATN Lab"
                className="h-10 brightness-0 invert opacity-80 mb-3"
              />
              <p className="text-sm text-sidebar-foreground/40">
                Your Trading Strategy Laboratory.
                <br />
                Learn, test, and trade smarter.
              </p>
              <p className="text-xs text-sidebar-foreground/30 mt-2">v{APP_VERSION}</p>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-sm font-semibold text-sidebar-foreground/80 uppercase tracking-wide mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="hover:text-sidebar-foreground transition-colors">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-sidebar-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/guidelines" className="hover:text-sidebar-foreground transition-colors">
                    Agreements &amp; Guidelines
                  </Link>
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div>
              <h4 className="text-sm font-semibold text-sidebar-foreground/80 uppercase tracking-wide mb-3">
                Disclaimer
              </h4>
              <p className="text-sm text-sidebar-foreground/40">
                Educational trading platform. Paper trading only.
                This is not financial advice. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sidebar-border">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <p className="text-sm text-sidebar-foreground/40 text-center">
              &copy; 2026{' '}
              <a
                href="https://ai-focus.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                ai-focus.org
              </a>
              {' '}&middot; Sujit Gangadharan &middot; All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    )
  }

  // Compact footer for inner pages
  return (
    <footer className="border-t border-border bg-card/60 px-6 py-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          &copy; 2026{' '}
          <a
            href="https://ai-focus.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            ai-focus.org
          </a>
          {' '}&middot; Sujit Gangadharan
        </p>
        <div className="flex items-center gap-3">
          <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="/guidelines" className="hover:text-primary transition-colors">Guidelines</Link>
        </div>
      </div>
    </footer>
  )
}
