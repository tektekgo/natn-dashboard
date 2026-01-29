/**
 * Educational info panel for contextual learning.
 * Used throughout the app to explain concepts to learners.
 *
 * variant="info"     — blue, general guidance
 * variant="learn"    — purple, concept explanations
 * variant="tip"      — green, practical tips
 */

interface InfoPanelProps {
  title?: string
  children: React.ReactNode
  variant?: 'info' | 'learn' | 'tip'
  className?: string
}

const variantStyles = {
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600 bg-blue-100',
    title: 'text-blue-900',
    body: 'text-blue-800',
    iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  learn: {
    bg: 'bg-purple-50 border-purple-200',
    icon: 'text-purple-600 bg-purple-100',
    title: 'text-purple-900',
    body: 'text-purple-800',
    iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  tip: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-600 bg-emerald-100',
    title: 'text-emerald-900',
    body: 'text-emerald-800',
    iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
}

export default function InfoPanel({ title, children, variant = 'info', className = '' }: InfoPanelProps) {
  const s = variantStyles[variant]

  return (
    <div className={`rounded-lg border p-4 ${s.bg} ${className}`}>
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.icon}`}>
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
          </svg>
        </div>
        <div className="min-w-0">
          {title && <p className={`text-sm font-semibold mb-1 ${s.title}`}>{title}</p>}
          <div className={`text-sm leading-relaxed ${s.body}`}>{children}</div>
        </div>
      </div>
    </div>
  )
}
