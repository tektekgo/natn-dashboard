import { Info, BookOpen, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoPanelProps {
  title?: string
  children: React.ReactNode
  variant?: 'info' | 'learn' | 'tip'
  className?: string
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900',
    icon: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50',
    title: 'text-blue-900 dark:text-blue-100',
    body: 'text-blue-800 dark:text-blue-200',
  },
  learn: {
    container: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900',
    icon: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/50',
    title: 'text-purple-900 dark:text-purple-100',
    body: 'text-purple-800 dark:text-purple-200',
  },
  tip: {
    container: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900',
    icon: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/50',
    title: 'text-emerald-900 dark:text-emerald-100',
    body: 'text-emerald-800 dark:text-emerald-200',
  },
}

const icons = {
  info: Info,
  learn: BookOpen,
  tip: Lightbulb,
}

export function InfoPanel({ title, children, variant = 'info', className }: InfoPanelProps) {
  const styles = variantStyles[variant]
  const Icon = icons[variant]

  return (
    <div className={cn('rounded-lg border p-4', styles.container, className)}>
      <div className="flex gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', styles.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          {title && <p className={cn('text-sm font-semibold mb-1', styles.title)}>{title}</p>}
          <div className={cn('text-sm leading-relaxed', styles.body)}>{children}</div>
        </div>
      </div>
    </div>
  )
}
