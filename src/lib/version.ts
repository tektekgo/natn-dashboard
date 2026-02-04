/**
 * Version and environment utilities.
 * Values are injected at build time by Vite.
 */

// Build-time injected values (defined in vite.config.ts)
export const APP_VERSION = __APP_VERSION__
export const BUILD_NUMBER = __BUILD_NUMBER__
export const BUILD_TIME = __BUILD_TIME__

/**
 * Get the current environment based on hostname.
 * - localhost / 127.0.0.1 → Dev
 * - Vercel preview URLs (*-*.vercel.app) → Dev
 * - Production domain → Prod
 */
export function getEnvironment(): 'Dev' | 'Prod' {
  if (typeof window === 'undefined') return 'Dev'

  const hostname = window.location.hostname

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'Dev'
  }

  // Vercel preview deployments (branch deploys)
  // Format: project-name-git-branch-team.vercel.app or project-name-hash-team.vercel.app
  if (hostname.includes('vercel.app') && !hostname.startsWith('natn-dashboard.')) {
    return 'Dev'
  }

  // Everything else is production (including custom domains)
  return 'Prod'
}

/**
 * Get formatted version string for display.
 * Example: "v0.1.0 build 42"
 */
export function getVersionString(): string {
  return `v${APP_VERSION} build ${BUILD_NUMBER}`
}

/**
 * Get full build info for debugging.
 */
export function getBuildInfo() {
  return {
    version: APP_VERSION,
    build: BUILD_NUMBER,
    buildTime: BUILD_TIME,
    environment: getEnvironment(),
  }
}
