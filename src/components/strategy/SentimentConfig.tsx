/**
 * Sentiment configuration section.
 * Shown but disabled for backtesting (can't retroactively get historical news).
 */

import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { InfoPanel } from '@/components/ui/info-panel'
import { Label } from '@/components/ui/label'
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

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-sm text-warning-foreground">
        Sentiment analysis is not available for backtesting since historical
        news/social data cannot be reliably reconstructed. When sentiment is disabled,
        technical and fundamental weights are automatically normalized.
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="sentiment-toggle">Enable Sentiment</Label>
          <p className="text-xs text-muted-foreground">Available for live trading only</p>
        </div>
        <Switch
          id="sentiment-toggle"
          checked={config.enabled}
          onCheckedChange={checked => onChange({ ...config, enabled: checked })}
          disabled
        />
      </div>

      <div className={config.enabled ? '' : 'opacity-50 pointer-events-none'}>
        <InfoPanel variant="tip" title="Score Thresholds">
          <p>
            Each score ranges from 0-100. Higher thresholds mean you only act on strongly positive or negative sentiment.
            A <strong>news score</strong> is derived from financial news articles, while a <strong>social score</strong> comes
            from social media analysis.
          </p>
        </InfoPanel>
        <div className="space-y-4 mt-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>News Score Threshold</Label>
              <span className="text-sm text-muted-foreground">{config.newsScoreThreshold}</span>
            </div>
            <Slider
              value={[config.newsScoreThreshold]}
              onValueChange={([v]) => onChange({ ...config, newsScoreThreshold: v })}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Social Score Threshold</Label>
              <span className="text-sm text-muted-foreground">{config.socialScoreThreshold}</span>
            </div>
            <Slider
              value={[config.socialScoreThreshold]}
              onValueChange={([v]) => onChange({ ...config, socialScoreThreshold: v })}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
