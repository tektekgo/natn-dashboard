/**
 * Sentiment configuration section.
 * Shown but disabled for backtesting (can't retroactively get historical news).
 */

import Slider from '@/components/common/Slider'
import Toggle from '@/components/common/Toggle'
import type { SentimentConfig as SentimentConfigType } from '@/types/strategy-config'

interface SentimentConfigProps {
  config: SentimentConfigType
  onChange: (config: SentimentConfigType) => void
}

export default function SentimentConfig({ config, onChange }: SentimentConfigProps) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        Sentiment analysis is not available for backtesting since historical
        news/social data cannot be reliably reconstructed. When sentiment is disabled,
        technical and fundamental weights are automatically normalized.
      </div>

      <Toggle
        label="Enable Sentiment"
        checked={config.enabled}
        onChange={checked => onChange({ ...config, enabled: checked })}
        disabled
        description="Available for live trading only"
      />

      <div className={config.enabled ? '' : 'opacity-50 pointer-events-none'}>
        <Slider
          label="News Score Threshold"
          value={config.newsScoreThreshold}
          onChange={v => onChange({ ...config, newsScoreThreshold: v })}
          min={0}
          max={100}
        />
        <Slider
          label="Social Score Threshold"
          value={config.socialScoreThreshold}
          onChange={v => onChange({ ...config, socialScoreThreshold: v })}
          min={0}
          max={100}
          className="mt-4"
        />
      </div>
    </div>
  )
}
