/**
 * Risk management configuration section.
 * Take profit, stop loss, position sizing.
 */

import Slider from '@/components/common/Slider'
import Input from '@/components/common/Input'
import type { RiskConfig as RiskConfigType } from '@/types/strategy-config'

interface RiskConfigProps {
  config: RiskConfigType
  onChange: (config: RiskConfigType) => void
}

export default function RiskConfig({ config, onChange }: RiskConfigProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Slider
          label="Take Profit"
          value={config.takeProfitPercent}
          onChange={v => onChange({ ...config, takeProfitPercent: v })}
          min={1}
          max={50}
          suffix="%"
        />
        <Slider
          label="Stop Loss"
          value={config.stopLossPercent}
          onChange={v => onChange({ ...config, stopLossPercent: v })}
          min={1}
          max={30}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="Max Position Size"
          value={config.maxPositionSizePercent}
          onChange={v => onChange({ ...config, maxPositionSizePercent: v })}
          min={5}
          max={100}
          suffix="%"
        />
        <Input
          label="Max Open Positions"
          type="number"
          min={1}
          max={50}
          value={config.maxOpenPositions}
          onChange={e => onChange({ ...config, maxOpenPositions: Number(e.target.value) })}
        />
      </div>

      <Slider
        label="Max Portfolio Risk"
        value={config.maxPortfolioRiskPercent}
        onChange={v => onChange({ ...config, maxPortfolioRiskPercent: v })}
        min={10}
        max={100}
        suffix="%"
      />
    </div>
  )
}
