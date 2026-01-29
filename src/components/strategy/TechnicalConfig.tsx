/**
 * Technical configuration form section.
 * RSI and SMA parameter inputs with educational explanations.
 */

import Input from '@/components/common/Input'
import InfoPanel from '@/components/common/InfoPanel'
import type { TechnicalConfig as TechnicalConfigType } from '@/types/strategy-config'

interface TechnicalConfigProps {
  config: TechnicalConfigType
  onChange: (config: TechnicalConfigType) => void
}

export default function TechnicalConfig({ config, onChange }: TechnicalConfigProps) {
  function update(key: keyof TechnicalConfigType, value: number) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <InfoPanel variant="learn" title="What is Technical Analysis?">
        <p>
          <strong>Technical analysis</strong> studies past price and volume data to predict future price movements.
          Unlike fundamental analysis (which looks at a company's finances), technical analysis focuses entirely
          on chart patterns and mathematical indicators. NATN Lab uses two popular indicators:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>RSI (Relative Strength Index)</strong> — measures whether a stock is overbought or oversold on a scale of 0-100.</li>
          <li><strong>SMA (Simple Moving Average)</strong> — smooths out price data by averaging closing prices over a set number of days.</li>
        </ul>
      </InfoPanel>

      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">RSI Settings</h3>
      <InfoPanel variant="tip" title="Understanding RSI">
        <p>
          <strong>RSI</strong> ranges from 0 to 100. When RSI drops below the <em>oversold</em> threshold (default 30),
          the stock may be undervalued — a potential <strong>buy signal</strong>. When it rises above the
          <em> overbought</em> threshold (default 70), the stock may be overvalued — a potential <strong>sell signal</strong>.
          The <em>period</em> (default 14 days) controls how many days of data RSI uses.
        </p>
      </InfoPanel>
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="RSI Period"
          type="number"
          min={2}
          max={50}
          value={config.rsiPeriod}
          onChange={e => update('rsiPeriod', Number(e.target.value))}
          helperText="Number of days (default 14)"
        />
        <Input
          label="Oversold Threshold"
          type="number"
          min={0}
          max={50}
          value={config.rsiOversold}
          onChange={e => update('rsiOversold', Number(e.target.value))}
          helperText="Buy signal below this (default 30)"
        />
        <Input
          label="Overbought Threshold"
          type="number"
          min={50}
          max={100}
          value={config.rsiOverbought}
          onChange={e => update('rsiOverbought', Number(e.target.value))}
          helperText="Sell signal above this (default 70)"
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mt-6">SMA Settings</h3>
      <InfoPanel variant="tip" title="Understanding SMA (Moving Averages)">
        <p>
          An <strong>SMA</strong> calculates the average closing price over N days.
          A <em>short-period SMA</em> (e.g., 20 days) reacts quickly to price changes, while a
          <em> long-period SMA</em> (e.g., 200 days) shows the broader trend. When the short SMA crosses
          <strong> above</strong> the long SMA, it's called a <em>golden cross</em> (bullish signal).
          When it crosses <strong>below</strong>, it's a <em>death cross</em> (bearish signal).
        </p>
      </InfoPanel>
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Short Period"
          type="number"
          min={5}
          max={100}
          value={config.smaShortPeriod}
          onChange={e => update('smaShortPeriod', Number(e.target.value))}
          helperText="Fast average (default 20)"
        />
        <Input
          label="Long Period"
          type="number"
          min={50}
          max={500}
          value={config.smaLongPeriod}
          onChange={e => update('smaLongPeriod', Number(e.target.value))}
          helperText="Slow average (default 200)"
        />
        <Input
          label="Trend Period"
          type="number"
          min={5}
          max={50}
          value={config.smaTrendPeriod}
          onChange={e => update('smaTrendPeriod', Number(e.target.value))}
          helperText="Short-term trend (default 10)"
        />
      </div>
    </div>
  )
}
