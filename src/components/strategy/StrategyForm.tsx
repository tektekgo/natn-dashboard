/**
 * Full strategy configuration form.
 * Combines all sub-forms into a complete strategy builder.
 */

import { useState } from 'react'
import Card from '@/components/common/Card'
import Input from '@/components/common/Input'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Strategy Name"
            value={config.name}
            onChange={e => setConfig({ ...config, name: e.target.value })}
            required
            placeholder="My Strategy"
          />
          <Input
            label="Initial Capital ($)"
            type="number"
            min={1000}
            step={1000}
            value={config.initialCapital}
            onChange={e => setConfig({ ...config, initialCapital: Number(e.target.value) })}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={config.description}
            onChange={e => setConfig({ ...config, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            placeholder="Describe your strategy..."
          />
        </div>
      </Card>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {sections.map(section => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveSection(section.key)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeSection === section.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Active section content */}
      <Card>
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
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || config.symbols.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
