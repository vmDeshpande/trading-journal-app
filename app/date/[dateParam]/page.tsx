'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useJournal } from '@/hooks/useJournal';
import { Trade } from '@/lib/types';
import { calculateDailyPnL } from '@/lib/pnl-calculator';
import { TradeModal } from '@/components/forms/trade-modal';
import { TradesList } from '@/components/trades/trades-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';

export default function DatePage() {
  const router = useRouter();
  const params = useParams();
  const dateParam = params.dateParam as string;

  const { trades, saveTrade, deleteTrade, isLoading } = useJournal();
  const [showModal, setShowModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();

  // Get trades for this date
  const dateTrades = trades.filter((t) => t.date === dateParam).sort((a, b) => b.createdAt - a.createdAt);
  const dailyPnL = calculateDailyPnL(dateTrades);

  // Format date for display
  const displayDate = new Date(dateParam + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSaveTrade = async (trade: Trade) => {
    try {
      await saveTrade(trade);
      setShowModal(false);
      setEditingTrade(undefined);
    } catch (error) {
      console.error('[Error] Failed to save trade:', error);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      await deleteTrade(tradeId, dateParam);
    } catch (error) {
      console.error('[Error] Failed to delete trade:', error);
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setShowModal(true);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">{displayDate}</h1>
            <p className="text-muted-foreground mt-2">Manage your trades for this day</p>
          </div>
          <Button
            onClick={() => {
              setEditingTrade(undefined);
              setShowModal(true);
            }}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Trade
          </Button>
        </div>

        {/* Daily Summary */}
        {dateTrades.length > 0 && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-card to-card/80 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Daily P&L</p>
                <p className={`text-3xl font-bold ${
                  dailyPnL > 0 ? 'text-green-600' : dailyPnL < 0 ? 'text-red-600' : 'text-slate-600'
                }`}>
                  {dailyPnL > 0 ? '+' : ''}{dailyPnL.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
                <p className="text-3xl font-bold text-foreground">{dateTrades.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Quality</p>
                <p className="text-3xl font-bold text-foreground">
                  {(dateTrades.reduce((sum, t) => sum + t.executionQuality, 0) / dateTrades.length).toFixed(1)}/5
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Trades List */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h2 className="text-xl font-semibold text-foreground">Trades</h2>
          <TradesList
            trades={dateTrades}
            onEdit={handleEditTrade}
            onDelete={handleDeleteTrade}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Trade Modal */}
      {showModal && (
        <TradeModal
          date={dateParam}
          initialTrade={editingTrade}
          onSave={handleSaveTrade}
          onClose={() => {
            setShowModal(false);
            setEditingTrade(undefined);
          }}
        />
      )}
    </main>
  );
}
