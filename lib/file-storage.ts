/**
 * File-based storage layer using Next.js API routes
 * Stores trades organized as: Storage/[YYYY-MM-DD]/trades.json
 * Images stored as separate files in the same directory
 * 
 * All operations go through API routes that write to the actual filesystem
 */

import { Trade, DailyRecord, JournalEntry } from './types';

/**
 * Initialize storage - checks if API is available
 */
export async function initDB(): Promise<void> {
  // Storage is initialized when first needed (lazy initialization)
  // No setup required
}

/**
 * Save a single trade (creates or updates daily record)
 * Makes API call to /api/storage/save-trade
 */
export async function saveTrade(trade: Trade): Promise<void> {
  try {
    const response = await fetch('/api/storage/save-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trade }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save trade');
    }
  } catch (error) {
    console.error('[Error] Failed to save trade:', error);
    throw error;
  }
}

/**
 * Save image file to Storage/[date]/[imageName]
 * Makes API call to /api/storage/save-image
 */
export async function saveImageFile(
  date: string,
  imageName: string,
  imageData: string // base64 string
): Promise<void> {
  try {
    const response = await fetch('/api/storage/save-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, imageName, imageData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save image');
    }
  } catch (error) {
    console.error('[Error] Failed to save image:', error);
    throw error;
  }
}

/**
 * Get image file data (returns base64 string)
 * Currently returns path reference - images are served directly via filesystem
 */
export async function getImageFile(date: string, imageName: string): Promise<string | null> {
  // Images are stored in Storage/[date]/[imageName]
  // Return reference path that can be accessed
  return `/Storage/${date}/${imageName}`;
}

/**
 * Get all trades for a specific date
 * Makes API call to /api/storage/get-trades
 */
export async function getTradesForDate(date: string): Promise<Trade[]> {
  try {
    const response = await fetch(`/api/storage/get-trades?date=${date}`);
    if (!response.ok) {
      throw new Error('Failed to get trades');
    }
    const record: DailyRecord = await response.json();
    return record.trades;
  } catch (error) {
    console.error('[Error] Failed to get trades for date:', error);
    return [];
  }
}

/**
 * Get all trades (flattened)
 * Makes API call to /api/storage/get-all-trades
 */
export async function getAllTrades(): Promise<Trade[]> {
  try {
    const response = await fetch('/api/storage/get-all-trades');
    if (!response.ok) {
      throw new Error('Failed to get all trades');
    }
    const { trades } = await response.json() as { trades: Trade[] };
    return trades;
  } catch (error) {
    console.error('[Error] Failed to get all trades:', error);
    return [];
  }
}

/**
 * Get all daily records
 * Makes API call to /api/storage/get-daily-records
 */
export async function getAllDailyRecords(): Promise<DailyRecord[]> {
  try {
    const response = await fetch('/api/storage/get-daily-records');
    if (!response.ok) {
      throw new Error('Failed to get daily records');
    }
    const { records } = await response.json() as { records: DailyRecord[] };
    return records;
  } catch (error) {
    console.error('[Error] Failed to get daily records:', error);
    return [];
  }
}

/**
 * Delete a single trade from a daily record
 * Makes API call to /api/storage/delete-trade
 */
export async function deleteTrade(tradeId: string, date: string): Promise<void> {
  try {
    const response = await fetch('/api/storage/delete-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeId, date }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete trade');
    }
  } catch (error) {
    console.error('[Error] Failed to delete trade:', error);
    throw error;
  }
}

/**
 * Delete image file from Storage/[date]/[imageName]
 * Makes API call to /api/storage/delete-image
 */
export async function deleteImageFile(date: string, imageName: string): Promise<void> {
  try {
    const response = await fetch('/api/storage/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, imageName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete image');
    }
  } catch (error) {
    console.error('[Error] Failed to delete image:', error);
    throw error;
  }
}

/**
 * Backward compatibility: Add or update a journal entry (single trade)
 */
export async function saveEntry(entry: JournalEntry): Promise<void> {
  await saveTrade(entry);
}

/**
 * Backward compatibility: Get entry by date (returns first trade)
 */
export async function getEntryByDate(date: string): Promise<JournalEntry | undefined> {
  const trades = await getTradesForDate(date);
  return trades[0];
}

/**
 * Backward compatibility: Get all entries (flattened)
 */
export async function getAllEntries(): Promise<Record<string, JournalEntry>> {
  const trades = await getAllTrades();
  const result: Record<string, JournalEntry> = {};
  trades.forEach((trade) => {
    result[trade.id] = trade;
  });
  return result;
}

/**
 * Backward compatibility: Delete an entry
 */
export async function deleteEntry(id: string): Promise<void> {
  const allRecords = await getAllDailyRecords();
  for (const record of allRecords) {
    const trade = record.trades.find((t) => t.id === id);
    if (trade) {
      await deleteTrade(id, record.date);
      break;
    }
  }
}

/**
 * Get entries for a date range
 */
export async function getEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<JournalEntry[]> {
  const trades = await getAllTrades();
  return trades.filter((trade) => trade.date >= startDate && trade.date <= endDate);
}
