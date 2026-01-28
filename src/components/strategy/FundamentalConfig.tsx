/**
 * Fundamental configuration form section.
 * PE ratio, EPS, beta, dividend parameters.
 */

import Input from '@/components/common/Input'
import type { FundamentalConfig as FundamentalConfigType } from '@/types/strategy-config'

interface FundamentalConfigProps {
  config: FundamentalConfigType
  onChange: (config: FundamentalConfigType) => void
}

export default function FundamentalConfig({ config, onChange }: FundamentalConfigProps) {
  function update(key: keyof FundamentalConfigType, value: number) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Valuation</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="PE Ratio Min"
          type="number"
          min={0}
          step={1}
          value={config.peRatioMin}
          onChange={e => update('peRatioMin', Number(e.target.value))}
          helperText="Min acceptable PE"
        />
        <Input
          label="PE Ratio Max"
          type="number"
          min={1}
          step={1}
          value={config.peRatioMax}
          onChange={e => update('peRatioMax', Number(e.target.value))}
          helperText="Max acceptable PE"
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mt-6">Growth & Risk</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min EPS Growth"
          type="number"
          step={0.01}
          value={config.epsGrowthMin}
          onChange={e => update('epsGrowthMin', Number(e.target.value))}
          helperText="As decimal (0 = 0%)"
        />
        <Input
          label="Max Beta"
          type="number"
          min={0}
          step={0.1}
          value={config.betaMax}
          onChange={e => update('betaMax', Number(e.target.value))}
          helperText="Maximum volatility"
        />
        <Input
          label="Min Dividend Yield"
          type="number"
          min={0}
          step={0.01}
          value={config.dividendYieldMin}
          onChange={e => update('dividendYieldMin', Number(e.target.value))}
          helperText="As decimal (0.02 = 2%)"
        />
        <Input
          label="Min Market Cap ($)"
          type="number"
          min={0}
          step={1000000000}
          value={config.marketCapMin}
          onChange={e => update('marketCapMin', Number(e.target.value))}
          helperText="$1B = 1000000000"
        />
      </div>
    </div>
  )
}
