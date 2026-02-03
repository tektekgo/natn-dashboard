/**
 * Risk management configuration section.
 * Take profit, stop loss, position sizing with educational explanations.
 */

import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InfoPanel } from '@/components/ui/info-panel'
import type { RiskConfig as RiskConfigType } from '@/types/strategy-config'

interface RiskConfigProps {
  config: RiskConfigType
  onChange: (config: RiskConfigType) => void
}

export default function RiskConfig({ config, onChange }: RiskConfigProps) {
  return (
    <div className="space-y-6">
      <InfoPanel variant="learn" title="Why Risk Management Matters">
        <p>
          <strong>Risk management</strong> is arguably the most important part of any trading strategy.
          Even the best signal-generating strategy can lose money without proper risk controls.
          These settings protect your portfolio from catastrophic losses by automatically closing positions
          and limiting exposure.
        </p>
      </InfoPanel>

      <InfoPanel variant="tip" title="Take Profit &amp; Stop Loss">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Take Profit</strong> — automatically sells when a position gains this percentage. Locks in gains before they reverse. Example: 10% means sell when the stock is up 10%.</li>
          <li><strong>Stop Loss</strong> — automatically sells when a position loses this percentage. Limits downside. Example: 5% means sell if the stock drops 5% from your entry price.</li>
        </ul>
      </InfoPanel>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Take Profit</Label>
            <span className="text-sm text-muted-foreground">{config.takeProfitPercent}%</span>
          </div>
          <Slider
            value={[config.takeProfitPercent]}
            onValueChange={([v]) => onChange({ ...config, takeProfitPercent: v })}
            min={1}
            max={50}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Stop Loss</Label>
            <span className="text-sm text-muted-foreground">{config.stopLossPercent}%</span>
          </div>
          <Slider
            value={[config.stopLossPercent]}
            onValueChange={([v]) => onChange({ ...config, stopLossPercent: v })}
            min={1}
            max={30}
            step={1}
          />
        </div>
      </div>

      <InfoPanel variant="tip" title="Position Sizing">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Max Position Size</strong> — the maximum % of your portfolio that can go into a single stock. Lower values = more diversification.</li>
          <li><strong>Max Open Positions</strong> — how many stocks you can hold at once. More positions spreads risk across more companies.</li>
          <li><strong>Max Portfolio Risk</strong> — the total portfolio percentage exposed to open positions at any time.</li>
        </ul>
      </InfoPanel>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Max Position Size</Label>
            <span className="text-sm text-muted-foreground">{config.maxPositionSizePercent}%</span>
          </div>
          <Slider
            value={[config.maxPositionSizePercent]}
            onValueChange={([v]) => onChange({ ...config, maxPositionSizePercent: v })}
            min={5}
            max={100}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxOpenPositions">Max Open Positions</Label>
          <Input
            id="maxOpenPositions"
            type="number"
            min={1}
            max={50}
            value={config.maxOpenPositions}
            onChange={e => onChange({ ...config, maxOpenPositions: Number(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">Simultaneous stock holdings</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Max Portfolio Risk</Label>
          <span className="text-sm text-muted-foreground">{config.maxPortfolioRiskPercent}%</span>
        </div>
        <Slider
          value={[config.maxPortfolioRiskPercent]}
          onValueChange={([v]) => onChange({ ...config, maxPortfolioRiskPercent: v })}
          min={10}
          max={100}
          step={1}
        />
      </div>
    </div>
  )
}
