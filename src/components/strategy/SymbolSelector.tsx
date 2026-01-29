/**
 * Stock symbol picker component.
 * Add/remove symbols for strategy.
 */

import { useState } from 'react'
import InfoPanel from '@/components/common/InfoPanel'

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
          <span
            key={s}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-mono"
          >
            {s}
            <button
              type="button"
              onClick={() => removeSymbol(s)}
              className="text-primary-400 hover:text-primary-600 ml-1"
            >
              &times;
            </button>
          </span>
        ))}
        {symbols.length === 0 && (
          <span className="text-sm text-gray-400">No symbols selected</span>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Enter symbol (e.g. AAPL)"
          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none hover:border-gray-300 transition-colors placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => addSymbol(input)}
          disabled={!input.trim()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Popular symbols */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Popular stocks:</p>
        <div className="flex flex-wrap gap-1">
          {POPULAR_SYMBOLS.filter(s => !symbols.includes(s)).slice(0, 12).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addSymbol(s)}
              className="px-2 py-1 text-xs font-mono bg-gray-50 text-gray-600 rounded hover:bg-gray-100 border border-gray-200"
            >
              +{s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
