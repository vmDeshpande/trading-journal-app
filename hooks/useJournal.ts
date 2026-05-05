/**
 * Custom hook for managing journal entries and trades
 * Supports multiple trades per day with backward compatibility
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trade, DailyRecord, JournalEntry } from '@/lib/types';
import {
  saveTrade,
  getTradesForDate,
  getAllTrades,
  getAllDailyRecords,
  deleteTrade,
  initDB,
} from '@/lib/file-storage';

export interface UseJournalResult {
  trades: Trade[];
  dailyRecords: DailyRecord[];
  entries: Record<string, JournalEntry>;
  isLoading: boolean;
  error: string | null;
  upsertEntry: (entry: Trade) => Promise<void>;
  getEntry: (date: string) => Trade | undefined;
  removeEntry: (id: string) => Promise<void>;
  getAllEntriesArray: () => Trade[];
  getEntriesByRange: (startDate: string, endDate: string) => Trade[];
  saveTrade: (trade: Trade) => Promise<void>;
  deleteTrade: (tradeId: string, date: string) => Promise<void>;
  getTradesForDate: (date: string) => Promise<Trade[]>;
  refreshData: () => Promise<void>;
}

export function useJournal(): UseJournalResult {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await initDB();
      const [allTrades, allRecords] = await Promise.all([getAllTrades(), getAllDailyRecords()]);
      setTrades(allTrades);
      setDailyRecords(allRecords.sort((a, b) => a.date.localeCompare(b.date)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save trade
  const handleSaveTrade = useCallback(async (trade: Trade) => {
    try {
      await saveTrade(trade);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save trade';
      setError(message);
      throw err;
    }
  }, [loadData]);

  // Delete trade
  const handleDeleteTrade = useCallback(async (tradeId: string, date: string) => {
    try {
      await deleteTrade(tradeId, date);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete trade';
      setError(message);
      throw err;
    }
  }, [loadData]);

  // Get trades for a date
  const handleGetTradesForDate = useCallback(async (date: string): Promise<Trade[]> => {
    try {
      return await getTradesForDate(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get trades');
      return [];
    }
  }, []);

  // Backward compatibility: entries as record
  const entries: Record<string, JournalEntry> = {};
  trades.forEach((trade) => {
    entries[trade.id] = trade;
  });

  // Backward compatibility: get entry for date
  const getEntry = useCallback(
    (date: string) => {
      return trades.find((t) => t.date === date);
    },
    [trades]
  );

  // Backward compatibility: remove entry (delete trade)
  const removeEntry = useCallback(
    async (id: string) => {
      const trade = trades.find((t) => t.id === id);
      if (trade) {
        await handleDeleteTrade(id, trade.date);
      }
    },
    [trades, handleDeleteTrade]
  );

  // Backward compatibility: get all entries as array
  const getAllEntriesArray = useCallback(() => {
    return trades;
  }, [trades]);

  // Backward compatibility: get entries by date range
  const getEntriesByRange = useCallback(
    (startDate: string, endDate: string) => {
      return trades.filter((t) => t.date >= startDate && t.date <= endDate);
    },
    [trades]
  );

  return {
    trades,
    dailyRecords,
    entries,
    isLoading,
    error,
    upsertEntry: handleSaveTrade,
    getEntry,
    removeEntry,
    getAllEntriesArray,
    getEntriesByRange,
    saveTrade: handleSaveTrade,
    deleteTrade: handleDeleteTrade,
    getTradesForDate: handleGetTradesForDate,
    refreshData: loadData,
  };
}
