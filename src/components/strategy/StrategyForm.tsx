/**
 * Full strategy configuration form.
 * Combines all sub-forms into a complete strategy builder.
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import TechnicalConfig from './TechnicalConfig'
import FundamentalConfig from './FundamentalConfig'
import SentimentConfig from './SentimentConfig'
import RiskConfig from './RiskConfig'
import SignalWeightSliders from './SignalWeightSliders'
import SymbolSelector from './SymbolSelector'
import type { FullStrategyConfig } from '@/types/strategy-config'

interface StrategyFormProps {
  initialConfig: FullStrategyConfig
  onSubmit: (config: FullStrategyConfig) => void
  submitLabel?: string
  loading?: boolean
}

type Section = 'symbols' | 'technical' | 'fundamental' | 'sentiment' | 'weights' | 'risk'

export default function StrategyForm({
  initialConfig,
  onSubmit,
  submitLabel = 'Save Strategy',
  loading = false,
}: StrategyFormProps) {
  const [config, setConfig] = useState<FullStrategyConfig>(initialConfig)
  const [activeSection, setActiveSection] = useState<Section>('symbols')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(config)
  }

  const sections: { key: Section; label: string }[] = [
    { key: 'symbols', label: 'Symbols' },
    { key: 'technical', label: 'Technical' },
    { key: 'fundamental', label: 'Fundamental' },
    { key: 'sentiment', label: 'Sentiment' },
    { key: 'weights', label: 'Weights' },
    { key: 'risk', label: 'Risk' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and description */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategyName">Strategy Name</Label>
              <Input
                id="strategyName"
                value={config.name}
                onChange={e => setConfig({ ...config, name: e.target.value })}
                required
                placeholder="My Strategy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialCapital">Initial Capital ($)</Label>
              <Input
                id="initialCapital"
                type="number"
                min={1000}
                step={1000}
                value={config.initialCapital}
                onChange={e => setConfig({ ...config, initialCapital: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={config.description}
              onChange={e => setConfig({ ...config, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none text-sm"
              placeholder="Describe your strategy..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Section tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {sections.map(section => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveSection(section.key)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeSection === section.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Active section content */}
      <Card>
        <CardContent className="pt-6">
          {activeSection === 'symbols' && (
            <SymbolSelector
              symbols={config.symbols}
              onChange={symbols => setConfig({ ...config, symbols })}
            />
          )}
          {activeSection === 'technical' && (
            <TechnicalConfig
              config={config.technical}
              onChange={technical => setConfig({ ...config, technical })}
            />
          )}
          {activeSection === 'fundamental' && (
            <FundamentalConfig
              config={config.fundamental}
              onChange={fundamental => setConfig({ ...config, fundamental })}
            />
          )}
          {activeSection === 'sentiment' && (
            <SentimentConfig
              config={config.sentiment}
              onChange={sentiment => setConfig({ ...config, sentiment })}
            />
          )}
          {activeSection === 'weights' && (
            <SignalWeightSliders
              weights={config.weights}
              onChange={weights => setConfig({ ...config, weights })}
              sentimentEnabled={config.sentiment.enabled}
            />
          )}
          {activeSection === 'risk' && (
            <RiskConfig
              config={config.risk}
              onChange={risk => setConfig({ ...config, risk })}
            />
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || config.symbols.length === 0}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
