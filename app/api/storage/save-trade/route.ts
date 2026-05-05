import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Trade, DailyRecord } from '@/lib/types';

const STORAGE_DIR = path.join(process.cwd(), 'Storage');

/**
 * Ensure Storage directory exists
 */
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error('[Error] Failed to create Storage directory:', error);
    throw error;
  }
}

/**
 * Ensure date folder exists (Storage/[date]/)
 */
async function ensureDateFolder(date: string) {
  try {
    const dateDir = path.join(STORAGE_DIR, date);
    await fs.mkdir(dateDir, { recursive: true });
    return dateDir;
  } catch (error) {
    console.error('[Error] Failed to create date folder:', error);
    throw error;
  }
}

/**
 * POST /api/storage/save-trade
 * Saves a trade and updates the trades.json file
 */
export async function POST(request: NextRequest) {
  try {
    const { trade } = await request.json() as { trade: Trade };

    if (!trade || !trade.date || !trade.id) {
      return NextResponse.json(
        { error: 'Invalid trade data' },
        { status: 400 }
      );
    }

    await ensureStorageDir();
    const dateDir = await ensureDateFolder(trade.date);
    const tradesJsonPath = path.join(dateDir, 'trades.json');

    // Read existing trades for this date
    let dailyRecord: DailyRecord;
    try {
      const fileContent = await fs.readFile(tradesJsonPath, 'utf-8');
      dailyRecord = JSON.parse(fileContent);
    } catch {
      // File doesn't exist yet, create new daily record
      dailyRecord = {
        date: trade.date,
        trades: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // Update or add trade
    const tradeIndex = dailyRecord.trades.findIndex((t) => t.id === trade.id);
    if (tradeIndex >= 0) {
      dailyRecord.trades[tradeIndex] = trade;
    } else {
      dailyRecord.trades.push(trade);
    }

    dailyRecord.updatedAt = Date.now();

    // Write updated trades.json
    await fs.writeFile(tradesJsonPath, JSON.stringify(dailyRecord, null, 2), 'utf-8');

    return NextResponse.json({ success: true, dateDir });
  } catch (error) {
    console.error('[Error] Failed to save trade:', error);
    return NextResponse.json(
      { error: 'Failed to save trade' },
      { status: 500 }
    );
  }
}
