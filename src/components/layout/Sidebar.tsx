/**
 * Navigation sidebar for the dashboard.
 * Dark professional design with colorful accents inspired by fintech platforms.
 * Uses CSS variables for theme-aware styling.
 */

import { NavLink } from 'react-router-dom'
import { APP_VERSION } from '@/lib/version'
import { useAuth } from '@/hooks/useAuth'

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/strategies', label: 'Strategies', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/compare', label: 'Compare', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/guide', label: 'Guide', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
]

const adminNavItem = {
  to: '/admin',
  label: 'Admin',
  icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
}

interface SidebarProps {
  collapsed?: boolean
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const { isOwner } = useAuth()
  const navItems = isOwner ? [...baseNavItems, adminNavItem] : baseNavItems

  return (
    <aside className={`bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-200 relative`}>
      {/* Subtle accent glow at top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative px-4 py-6 border-b border-sidebar-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5" />

        {/* Logo container with accent background */}
        <div className={`
          relative mx-auto
          ${collapsed ? 'w-14 h-14' : 'w-32 h-32'}
          rounded-2xl
          bg-gradient-to-br from-white/15 to-white/5
          border border-white/20
          shadow-xl shadow-primary/20
          flex items-center justify-center
          p-3
        `}>
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/15 via-transparent to-cyan-500/15" />

          <img
            src="/natnlab-logo-png.png"
            alt="NATN Lab"
            className={collapsed ? 'h-10 relative' : 'h-24 w-24 object-contain relative'}
          />
        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 relative">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/30'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Left accent bar for active item */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-lg shadow-white/50" />
                )}

                {/* Icon container with glow effect */}
                <div className="relative flex-shrink-0">
                  {/* Soft glow on hover (hidden when active) */}
                  {!isActive && (
                    <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-r from-primary/0 to-cyan-500/0 group-hover:from-primary/20 group-hover:to-cyan-500/20 blur-md transition-all duration-300" />
                  )}

                  <svg
                    className={`
                      relative w-5 h-5 transition-all duration-300
                      ${isActive
                        ? 'stroke-white'
                        : 'stroke-sidebar-foreground/50 group-hover:stroke-[url(#nav-icon-gradient)]'
                      }
                      ${!isActive && 'group-hover:scale-110 group-hover:drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]'}
                    `}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    {/* Gradient definition for icons */}
                    <defs>
                      <linearGradient id="nav-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>

                {!collapsed && (
                  <span className="flex items-center gap-2">
                    {item.label}
                    {/* Small gradient dot indicator for active */}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white/50 animate-pulse" />
                    )}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="relative px-5 py-4 border-t border-sidebar-border/50 overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

        <div className="relative flex flex-col items-center gap-2">
          {/* Logo mark with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-500 blur-lg opacity-20" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center border border-primary/20">
              <span className="text-xs font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                N
              </span>
            </div>
          </div>

          {/* Version text */}
          <p className="text-[10px] uppercase tracking-widest text-center">
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent font-semibold">
              NATN Lab
            </span>
            <span className="text-sidebar-foreground/40"> v{APP_VERSION}</span>
          </p>
        </div>
      </div>
    </aside>
  )
}
