/**
 * Sentiment configuration section.
 * Shown but disabled for backtesting (can't retroactively get historical news).
 */

import Slider from '@/components/common/Slider'
import Toggle from '@/components/common/Toggle'
import InfoPanel from '@/components/common/InfoPanel'
import type { SentimentConfig as SentimentConfigType } from '@/types/strategy-config'

interface SentimentConfigProps {
  config: SentimentConfigType
  onChange: (config: SentimentConfigType) => void
}

export default function SentimentConfig({ config, onChange }: SentimentConfigProps) {
  return (
    <div className="space-y-4">
      <InfoPanel variant="learn" title="What is Sentiment Analysis?">
        <p>
          <strong>Sentiment analysis</strong> gauges market mood by analyzing news articles, social media posts,
          and other public commentary about a stock. Positive sentiment (bullish news, optimistic social posts)
          can signal buying opportunities, while negative sentiment may indicate risk. Sentiment adds a
          "human factor" layer on top of technical and fundamental data.
        </p>
      </InfoPanel>

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
        <InfoPanel variant="tip" title="Score Thresholds">
          <p>
            Each score ranges from 0-100. Higher thresholds mean you only act on strongly positive or negative sentiment.
            A <strong>news score</strong> is derived from financial news articles, while a <strong>social score</strong> comes
            from social media analysis.
          </p>
        </InfoPanel>
        <Slider
          label="News Score Threshold"
          value={config.newsScoreThreshold}
          onChange={v => onChange({ ...config, newsScoreThreshold: v })}
          min={0}
          max={100}
          className="mt-3"
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
