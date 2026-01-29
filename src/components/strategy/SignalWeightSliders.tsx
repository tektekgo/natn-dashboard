/**
 * Signal weight sliders.
 * Draggable weight allocation for technical, fundamental, and sentiment.
 */

import Slider from '@/components/common/Slider'
import InfoPanel from '@/components/common/InfoPanel'
import type { SignalWeights } from '@/types/strategy-config'

interface SignalWeightSlidersProps {
  weights: SignalWeights
  onChange: (weights: SignalWeights) => void
  sentimentEnabled?: boolean
}

export default function SignalWeightSliders({
  weights,
  onChange,
  sentimentEnabled = false,
}: SignalWeightSlidersProps) {
  const total = weights.technical + weights.fundamental + (sentimentEnabled ? weights.sentiment : 0)

  // Normalized weights (what the engine actually uses)
  const techNorm = sentimentEnabled
    ? (weights.technical / total) * 100
    : (weights.technical / (weights.technical + weights.fundamental)) * 100
  const fundNorm = sentimentEnabled
    ? (weights.fundamental / total) * 100
    : (weights.fundamental / (weights.technical + weights.fundamental)) * 100

  return (
    <div className="space-y-4">
      <InfoPanel variant="learn" title="How Signal Weighting Works">
        <p>
          Your strategy combines multiple signals (technical, fundamental, and optionally sentiment) into
          a single <strong>combined score</strong> that drives buy/sell decisions. Weights determine how much
          influence each signal type has. For example, setting Technical to 70 and Fundamental to 30 means
          price-based signals have more than double the influence of financial health signals.
        </p>
        <p className="mt-2">
          Weights are automatically <strong>normalized</strong> to total 100% — so the raw slider values
          represent relative proportions, not absolute percentages.
        </p>
      </InfoPanel>

      <Slider
        label="Technical Weight"
        value={weights.technical}
        onChange={v => onChange({ ...weights, technical: v })}
        min={0}
        max={100}
      />
      <Slider
        label="Fundamental Weight"
        value={weights.fundamental}
        onChange={v => onChange({ ...weights, fundamental: v })}
        min={0}
        max={100}
      />
      <div className={sentimentEnabled ? '' : 'opacity-50 pointer-events-none'}>
        <Slider
          label="Sentiment Weight"
          value={weights.sentiment}
          onChange={v => onChange({ ...weights, sentiment: v })}
          min={0}
          max={100}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <p className="font-medium text-gray-700 mb-1">Effective Weights (normalized):</p>
        <div className="flex gap-4 text-gray-600">
          <span>Technical: <strong>{techNorm.toFixed(1)}%</strong></span>
          <span>Fundamental: <strong>{fundNorm.toFixed(1)}%</strong></span>
          {sentimentEnabled && (
            <span>Sentiment: <strong>{((weights.sentiment / total) * 100).toFixed(1)}%</strong></span>
          )}
        </div>
      </div>
    </div>
  )
}
