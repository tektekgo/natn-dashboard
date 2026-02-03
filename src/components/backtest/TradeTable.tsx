/**
 * Trade table component.
 * Shows all simulated trades with details.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ClosedTrade } from '@/engine/types'

interface TradeTableProps {
  trades: ClosedTrade[]
}

export default function TradeTable({ trades }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">No trades were executed.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trades ({trades.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead>Exit Date</TableHead>
                <TableHead className="text-right">Entry $</TableHead>
                <TableHead className="text-right">Exit $</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">P&L $</TableHead>
                <TableHead className="text-right">P&L %</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead>Exit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade, i) => (
                <TableRow key={trade.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-mono font-medium">{trade.symbol}</TableCell>
                  <TableCell className="text-muted-foreground">{trade.entryDate}</TableCell>
                  <TableCell className="text-muted-foreground">{trade.exitDate}</TableCell>
                  <TableCell className="text-right font-mono">${trade.entryPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">${trade.exitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{trade.quantity}</TableCell>
                  <TableCell className={`text-right font-mono font-medium ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${trade.pnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{trade.holdingDays}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trade.exitReason === 'take_profit'
                          ? 'default'
                          : trade.exitReason === 'stop_loss'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className={trade.exitReason === 'take_profit' ? 'bg-success hover:bg-success/80' : ''}
                    >
                      {trade.exitReason.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
