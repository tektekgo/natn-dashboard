/**
 * Trade table component.
 * Shows all simulated trades with details.
 */

import Card from '@/components/common/Card'
import type { ClosedTrade } from '@/engine/types'

interface TradeTableProps {
  trades: ClosedTrade[]
}

export default function TradeTable({ trades }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <Card title="Trades">
        <p className="text-gray-500 text-sm text-center py-4">No trades were executed.</p>
      </Card>
    )
  }

  return (
    <Card title={`Trades (${trades.length})`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left py-2 font-medium">#</th>
              <th className="text-left py-2 font-medium">Symbol</th>
              <th className="text-left py-2 font-medium">Entry Date</th>
              <th className="text-left py-2 font-medium">Exit Date</th>
              <th className="text-right py-2 font-medium">Entry $</th>
              <th className="text-right py-2 font-medium">Exit $</th>
              <th className="text-right py-2 font-medium">Qty</th>
              <th className="text-right py-2 font-medium">P&L $</th>
              <th className="text-right py-2 font-medium">P&L %</th>
              <th className="text-right py-2 font-medium">Days</th>
              <th className="text-left py-2 font-medium">Exit</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 text-gray-400">{i + 1}</td>
                <td className="py-2 font-mono font-medium text-gray-900">{trade.symbol}</td>
                <td className="py-2 text-gray-600">{trade.entryDate}</td>
                <td className="py-2 text-gray-600">{trade.exitDate}</td>
                <td className="py-2 text-right font-mono">${trade.entryPrice.toFixed(2)}</td>
                <td className="py-2 text-right font-mono">${trade.exitPrice.toFixed(2)}</td>
                <td className="py-2 text-right font-mono text-gray-600">{trade.quantity}</td>
                <td className={`py-2 text-right font-mono font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </td>
                <td className={`py-2 text-right font-mono ${trade.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                </td>
                <td className="py-2 text-right text-gray-600">{trade.holdingDays}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    trade.exitReason === 'take_profit'
                      ? 'bg-green-100 text-green-700'
                      : trade.exitReason === 'stop_loss'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {trade.exitReason.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
