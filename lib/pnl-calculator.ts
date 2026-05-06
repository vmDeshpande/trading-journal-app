import { JournalEntry, Direction } from './types';

/**
 * Calculate P&L based on trade direction and prices
 * BUY (Long): P&L = Exit Price - Entry Price (profit when price goes up)
 * SELL (Short): P&L = Entry Price - Exit Price (profit when price goes down)
 */
export function calculatePnL(
  direction: Direction,
  entryPrice: number,
  exitPrice: number
): number {
  if (direction === 'buy') {
    return exitPrice - entryPrice;
  } else {
    // sell (short)
    return entryPrice - exitPrice;
  }
}

/**
 * Determine the color for P&L display
 * Green: profit (P&L > 0)
 * Red: loss (P&L < 0)
 * Neutral: no P&L (P&L === 0)
 */
export function getPnLColor(pnl: number): string {
  if (pnl > 0) return 'bg-green-100 border-green-300';
  if (pnl < 0) return 'bg-red-100 border-red-300';
  return 'bg-slate-100 border-slate-300';
}

/**
 * Get text color for P&L values
 */
export function getPnLTextColor(pnl: number): string {
  if (pnl > 0) return 'text-green-700';
  if (pnl < 0) return 'text-red-700';
  return 'text-slate-700';
}

/**
 * Format P&L with sign for display
 */
export function formatPnL(pnl: number): string {
  const sign = pnl > 0 ? '+' : '';
  return `${sign}₹${pnl.toFixed(2)}`;
}

/**
 * Calculate total daily P&L (sum of all trades for a date)
 */
export function calculateDailyPnL(entries: JournalEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.pnl, 0);
}

/**
 * Separate total profit from total loss (both as positive numbers)
 */
export function splitPnL(entries: JournalEntry[]): { profit: number; loss: number } {
  const profit = entries
    .filter((e) => e.pnl > 0)
    .reduce((sum, e) => sum + e.pnl, 0);
  
  const loss = Math.abs(
    entries
      .filter((e) => e.pnl < 0)
      .reduce((sum, e) => sum + e.pnl, 0)
  );

  return { profit, loss };
}
