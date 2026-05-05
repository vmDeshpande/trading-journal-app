/**
 * Core data types for the stock trading journal
 */

export type Direction = 'buy' | 'sell';

export interface TradeImage {
  id: string; // Unique image ID
  name: string; // Original filename
  type: string; // MIME type (e.g., 'image/jpeg')
  imagePath: string; // Path to image file relative to Storage/[date]/
  caption?: string; // Optional caption for the image
  createdAt: number; // Upload timestamp
}

export interface Trade {
  id: string; // Unique trade ID (uuid or timestamp-based)
  date: string; // ISO date string (YYYY-MM-DD)
  index: string;
  direction: Direction; // 'buy' (long) or 'sell' (short)
  entryPrice: number; // Price when entering the position
  exitPrice: number; // Price when exiting the position
  pnl: number; // Auto-calculated: (exitPrice - entryPrice) for BUY, (entryPrice - exitPrice) for SELL
  executionQuality: number; // 1-10 rating (1-3: poor/red, 4-6: average/yellow, 7-10: good/green)
  notes: string;
  images?: TradeImage[]; // Optional array of attached images (max 5)
  manualPnL?: boolean; // Optional: true if user manually overrode P&L
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface DailyRecord {
  date: string; // ISO date string (YYYY-MM-DD) - primary key
  trades: Trade[];
  createdAt: number;
  updatedAt: number;
}

// Legacy type alias for backwards compatibility
export type JournalEntry = Trade;

export interface DailyStats {
  date: string;
  pnl: number;
  tradesCount: number;
  avgExecutionQuality: number;
}

export interface WeeklyStats {
  weekStart: string; // ISO date of Monday
  weekEnd: string;
  pnl: number;
  profit: number;
  loss: number;
  tradesCount: number;
  winRate: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  pnl: number;
  profit: number;
  loss: number;
  tradesCount: number;
  winRate: number;
}
