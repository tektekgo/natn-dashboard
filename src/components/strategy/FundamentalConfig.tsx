/**
 * Fundamental configuration form section.
 * PE ratio, EPS, beta, dividend parameters with educational explanations.
 */

import { InfoPanel } from '@/components/ui/info-panel'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      <InfoPanel variant="learn" title="What is Fundamental Analysis?">
        <p>
          <strong>Fundamental analysis</strong> evaluates a company's financial health and intrinsic value by
          examining its earnings, revenue, assets, and market position. While technical analysis looks at
          <em> price charts</em>, fundamental analysis answers: "Is this company actually worth investing in?"
        </p>
      </InfoPanel>

      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Valuation</h3>
      <InfoPanel variant="tip" title="P/E Ratio Explained">
        <p>
          The <strong>Price-to-Earnings (P/E) ratio</strong> compares a stock's price to its earnings per share.
          A P/E of 20 means investors pay $20 for every $1 of earnings. <em>Lower P/E</em> may indicate
          an undervalued stock; <em>higher P/E</em> may mean it's overvalued or has high growth expectations.
          Setting min/max P/E filters out companies outside your valuation comfort zone.
        </p>
      </InfoPanel>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="peRatioMin">PE Ratio Min</Label>
          <Input
            id="peRatioMin"
            type="number"
            min={0}
            step={1}
            value={config.peRatioMin}
            onChange={e => update('peRatioMin', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Min acceptable PE (default 0)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="peRatioMax">PE Ratio Max</Label>
          <Input
            id="peRatioMax"
            type="number"
            min={1}
            step={1}
            value={config.peRatioMax}
            onChange={e => update('peRatioMax', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Max acceptable PE (default 40)</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mt-6">Growth &amp; Risk</h3>
      <InfoPanel variant="tip" title="Understanding EPS Growth, Beta, and Dividends">
        <ul className="list-disc list-inside space-y-1">
          <li><strong>EPS Growth</strong> — Earnings Per Share growth rate. Positive means the company is growing profits. Set a minimum to filter for growing companies.</li>
          <li><strong>Beta</strong> — measures how volatile a stock is relative to the market. Beta of 1.0 = matches market, &gt;1.0 = more volatile, &lt;1.0 = less volatile. Set a max to limit risk.</li>
          <li><strong>Dividend Yield</strong> — the annual dividend payment as a percentage of stock price. Income-focused strategies may require a minimum yield.</li>
          <li><strong>Market Cap</strong> — the total market value of a company. Larger companies (large-cap) tend to be more stable.</li>
        </ul>
      </InfoPanel>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="epsGrowthMin">Min EPS Growth</Label>
          <Input
            id="epsGrowthMin"
            type="number"
            step={0.01}
            value={config.epsGrowthMin}
            onChange={e => update('epsGrowthMin', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">As decimal (0.10 = 10% growth)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="betaMax">Max Beta</Label>
          <Input
            id="betaMax"
            type="number"
            min={0}
            step={0.1}
            value={config.betaMax}
            onChange={e => update('betaMax', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Max volatility (1.5 = 50% more volatile)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dividendYieldMin">Min Dividend Yield</Label>
          <Input
            id="dividendYieldMin"
            type="number"
            min={0}
            step={0.01}
            value={config.dividendYieldMin}
            onChange={e => update('dividendYieldMin', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">As decimal (0.02 = 2% yield)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="marketCapMin">Min Market Cap ($)</Label>
          <Input
            id="marketCapMin"
            type="number"
            min={0}
            step={1000000000}
            value={config.marketCapMin}
            onChange={e => update('marketCapMin', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">$1B = 1,000,000,000</p>
        </div>
      </div>
    </div>
  )
}
