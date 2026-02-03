/**
 * Stock symbol picker component.
 * Add/remove symbols for strategy.
 */

import { useState } from 'react'
import { InfoPanel } from '@/components/ui/info-panel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SymbolSelectorProps {
  symbols: string[]
  onChange: (symbols: string[]) => void
}

const POPULAR_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
  'JPM', 'V', 'JNJ', 'WMT', 'PG', 'UNH', 'HD', 'BAC',
  'DIS', 'NFLX', 'ADBE', 'CRM', 'PYPL',
]

export default function SymbolSelector({ symbols, onChange }: SymbolSelectorProps) {
  const [input, setInput] = useState('')

  function addSymbol(symbol: string) {
    const s = symbol.trim().toUpperCase()
    if (s && !symbols.includes(s)) {
      onChange([...symbols, s])
    }
    setInput('')
  }

  function removeSymbol(symbol: string) {
    onChange(symbols.filter(s => s !== symbol))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSymbol(input)
    }
  }

  return (
    <div className="space-y-4">
      <InfoPanel variant="learn" title="What are Stock Symbols?">
        <p>
          A <strong>ticker symbol</strong> (e.g., AAPL for Apple, MSFT for Microsoft) is a unique abbreviation
          used to identify a publicly traded company on a stock exchange. Select the stocks your strategy will
          analyze and trade. You can pick from the popular list below or type any valid ticker.
        </p>
      </InfoPanel>

      {/* Selected symbols */}
      <div className="flex flex-wrap gap-2">
        {symbols.map(s => (
          <Badge key={s} variant="secondary" className="font-mono text-sm px-3 py-1">
            {s}
            <button
              type="button"
              onClick={() => removeSymbol(s)}
              className="ml-2 hover:text-destructive"
            >
              &times;
            </button>
          </Badge>
        ))}
        {symbols.length === 0 && (
          <span className="text-sm text-muted-foreground">No symbols selected</span>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Enter symbol (e.g. AAPL)"
          className="flex-1 font-mono"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => addSymbol(input)}
          disabled={!input.trim()}
        >
          Add
        </Button>
      </div>

      {/* Popular symbols */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Popular stocks:</p>
        <div className="flex flex-wrap gap-1">
          {POPULAR_SYMBOLS.filter(s => !symbols.includes(s)).slice(0, 12).map(s => (
            <Button
              key={s}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSymbol(s)}
              className="font-mono text-xs h-7 px-2"
            >
              +{s}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
