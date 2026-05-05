import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Trade, DailyRecord } from '@/lib/types';

const STORAGE_DIR = path.join(process.cwd(), 'Storage');

/**
 * GET /api/storage/get-all-trades
 * Retrieves all trades from all dates
 */
export async function GET(request: NextRequest) {
  try {
    const allTrades: Trade[] = [];

    try {
      const entries = await fs.readdir(STORAGE_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const tradesJsonPath = path.join(STORAGE_DIR, entry.name, 'trades.json');
          try {
            const fileContent = await fs.readFile(tradesJsonPath, 'utf-8');
            const dailyRecord: DailyRecord = JSON.parse(fileContent);
            allTrades.push(...dailyRecord.trades);
          } catch {
            // Skip if file doesn't exist
          }
        }
      }
    } catch (error) {
      // Storage directory doesn't exist yet
      console.log('[Info] Storage directory not found');
    }

    return NextResponse.json({ trades: allTrades });
  } catch (error) {
    console.error('[Error] Failed to get all trades:', error);
    return NextResponse.json(
      { error: 'Failed to get all trades' },
      { status: 500 }
    );
  }
}
