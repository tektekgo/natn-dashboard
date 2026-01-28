/**
 * Technical configuration form section.
 * RSI and SMA parameter inputs.
 */

import Input from '@/components/common/Input'
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
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">RSI Settings</h3>
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="RSI Period"
          type="number"
          min={2}
          max={50}
          value={config.rsiPeriod}
          onChange={e => update('rsiPeriod', Number(e.target.value))}
        />
        <Input
          label="Oversold"
          type="number"
          min={0}
          max={50}
          value={config.rsiOversold}
          onChange={e => update('rsiOversold', Number(e.target.value))}
          helperText="Buy below this"
        />
        <Input
          label="Overbought"
          type="number"
          min={50}
          max={100}
          value={config.rsiOverbought}
          onChange={e => update('rsiOverbought', Number(e.target.value))}
          helperText="Sell above this"
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mt-6">SMA Settings</h3>
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Short Period"
          type="number"
          min={5}
          max={100}
          value={config.smaShortPeriod}
          onChange={e => update('smaShortPeriod', Number(e.target.value))}
          helperText="Fast moving average"
        />
        <Input
          label="Long Period"
          type="number"
          min={50}
          max={500}
          value={config.smaLongPeriod}
          onChange={e => update('smaLongPeriod', Number(e.target.value))}
          helperText="Slow moving average"
        />
        <Input
          label="Trend Period"
          type="number"
          min={5}
          max={50}
          value={config.smaTrendPeriod}
          onChange={e => update('smaTrendPeriod', Number(e.target.value))}
          helperText="Short-term trend"
        />
      </div>
    </div>
  )
}
