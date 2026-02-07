/**
 * Reusable educational tooltip — HelpCircle icon that shows
 * a short explanation on hover. Used throughout the Activity page
 * to help users learn trading bot concepts.
 */

import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface LearnTipProps {
  /** Short explanation shown on hover */
  tip: string
  /** Optional longer detail shown below the main tip */
  detail?: string
  /** Icon size in px (default 13) */
  size?: number
  /** Tooltip placement */
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export default function LearnTip({ tip, detail, size = 13, side = 'top' }: LearnTipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-help ml-1">
            <HelpCircle style={{ width: size, height: size }} />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-xs">{tip}</p>
          {detail && <p className="text-xs text-muted-foreground mt-1 italic">{detail}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
