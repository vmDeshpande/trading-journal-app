'use client';

import { Trade } from '@/lib/types';
import { formatPnL, getPnLColor } from '@/lib/pnl-calculator';
import { getQualityColor, getQualityLabel, getQualityBadgeColor } from '@/lib/quality-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { ImageGallery } from '@/components/images/image-gallery';

interface TradesListProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
  isLoading?: boolean;
}

export function TradesList({ trades, onEdit, onDelete, isLoading }: TradesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <Card className="p-8 text-center bg-card/50 border-dashed">
        <p className="text-muted-foreground">No trades for this date yet</p>
        <p className="text-sm text-muted-foreground mt-1">Add your first trade to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {trades.map((trade, index) => (
        <div
          key={trade.id}
          className={cn(
            'animate-in fade-in slide-in-from-left-2 duration-300',
            `animation-delay-[${index * 100}ms]`
          )}
        >
          <Card className={cn(
            'p-4 border-2 transition-all hover:shadow-md',
            trade.pnl > 0
              ? 'bg-green-50 border-green-200'
              : trade.pnl < 0
              ? 'bg-red-50 border-red-200'
              : 'bg-slate-50 border-slate-200'
          )}>
            <div className="flex items-start justify-between">
              {/* Trade Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl font-bold text-foreground">{trade.index}</span>
                  <span className={cn(
                    'px-2.5 py-1 rounded text-xs font-semibold text-white',
                    trade.direction === 'buy' ? 'bg-green-600' : 'bg-red-600'
                  )}>
                    {trade.direction === 'buy' ? 'BUY' : 'SELL'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {trade.direction === 'buy' ? (
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 inline mr-1" />
                    )}
                    {trade.entryPrice.toFixed(2)} → {trade.exitPrice.toFixed(2)}
                  </span>
                </div>

                {/* P&L and Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className={cn(
                      'text-lg font-bold',
                      trade.pnl > 0 ? 'text-green-700' : trade.pnl < 0 ? 'text-red-700' : 'text-slate-700'
                    )}>
                      {formatPnL(trade.pnl)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Quality:</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-semibold text-white',
                      getQualityBadgeColor(trade.executionQuality)
                    )}>
                      {trade.executionQuality}/10 {getQualityLabel(trade.executionQuality)}
                    </span>
                  </div>
                  {trade.notes && (
                    <div className="text-muted-foreground italic">
                      &ldquo;{trade.notes.substring(0, 50)}{trade.notes.length > 50 ? '...' : ''}&rdquo;
                    </div>
                  )}
                </div>

                {/* Images Gallery */}
                {trade.images && trade.images.length > 0 && (
                  <div className="mt-3">
                    <ImageGallery images={trade.images} maxDisplay={4} clickable={true} date={trade.date} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(trade)}
                  className="text-foreground hover:bg-muted"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Delete this trade?')) {
                      onDelete(trade.id);
                    }
                  }}
                  className="text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
