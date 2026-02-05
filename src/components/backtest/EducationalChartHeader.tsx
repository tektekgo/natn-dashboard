/**
 * Educational chart header with collapsible "Learn" toggle.
 * Wraps a CardHeader with an optional educational info panel.
 */

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { InfoPanel } from '@/components/ui/info-panel'

interface EducationalChartHeaderProps {
  title: string
  subtitle?: string
  learnTitle: string
  learnContent: string
}

export default function EducationalChartHeader({
  title,
  subtitle,
  learnTitle,
  learnContent,
}: EducationalChartHeaderProps) {
  const [showLearn, setShowLearn] = useState(false)

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={() => setShowLearn(!showLearn)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
            aria-label={`Learn about ${title}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showLearn ? 'Hide' : 'Learn'}</span>
          </button>
        </div>
        {showLearn && (
          <InfoPanel variant="learn" title={learnTitle} className="mt-3">
            <p>{learnContent}</p>
          </InfoPanel>
        )}
      </CardHeader>
    </>
  )
}
