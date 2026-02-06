/**
 * Shared footer component.
 * variant="full"  — dark 3-column footer (landing page)
 * variant="compact" — single-line footer (inner pages, auth pages)
 */

import { Link } from 'react-router-dom'
import { getVersionString, getEnvironment } from '@/lib/version'

interface FooterProps {
  variant?: 'full' | 'compact'
}

function VersionBadge({ className = '' }: { className?: string }) {
  const env = getEnvironment()
  const version = getVersionString()

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="bg-gradient-to-r from-primary/60 to-cyan-500/60 bg-clip-text text-transparent font-medium">
        {version}
      </span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
        env === 'Dev'
          ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 shadow-sm shadow-amber-500/20'
          : 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 shadow-sm shadow-emerald-500/20'
      }`}>
        {env}
      </span>
    </span>
  )
}

export default function Footer({ variant = 'compact' }: FooterProps) {
  if (variant === 'full') {
    return (
      <footer className="bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground/60 mt-auto relative overflow-hidden">
        {/* Subtle gradient accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-500 to-primary opacity-50" />

        <div className="max-w-7xl mx-auto px-6 py-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand + tagline */}
            <div>
              <img
                src="/natnlab-logo+name.png"
                alt="NATN Lab"
                className="h-14 mb-3"
              />
              <p className="text-sm bg-gradient-to-r from-sidebar-foreground/60 to-sidebar-foreground/40 bg-clip-text text-transparent">
                Your Trading Strategy Laboratory.
                <br />
                Learn, test, and trade smarter.
              </p>
              <div className="text-xs mt-3">
                <VersionBadge />
              </div>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-sm font-semibold bg-gradient-to-r from-primary/80 to-cyan-500/80 bg-clip-text text-transparent uppercase tracking-wide mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/guidelines" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">
                    Agreements &amp; Guidelines
                  </Link>
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div>
              <h4 className="text-sm font-semibold bg-gradient-to-r from-primary/80 to-cyan-500/80 bg-clip-text text-transparent uppercase tracking-wide mb-3">
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
        <div className="border-t border-sidebar-border/50 bg-gradient-to-r from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <p className="text-sm text-sidebar-foreground/40 text-center">
              &copy; 2026{' '}
              <a
                href="https://ai-focus.org"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-primary/70 to-cyan-500/70 bg-clip-text text-transparent hover:from-primary hover:to-cyan-500 transition-all font-medium"
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
  const env = getEnvironment()
  const version = getVersionString()

  return (
    <footer className="border-t border-border bg-gradient-to-r from-card/60 via-card/80 to-card/60 px-6 py-3 relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground relative">
        <p>
          &copy; 2026{' '}
          <a
            href="https://ai-focus.org"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent hover:from-primary/80 hover:to-cyan-500/80 transition-all font-medium"
          >
            ai-focus.org
          </a>
          {' '}&middot; Sujit Gangadharan
        </p>
        <div className="flex items-center gap-3">
          <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="/guidelines" className="hover:text-primary transition-colors">Guidelines</Link>
          <span className="text-muted-foreground/30">|</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent font-medium">
              {version}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
              env === 'Dev'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              {env}
            </span>
          </span>
        </div>
      </div>
    </footer>
  )
}
