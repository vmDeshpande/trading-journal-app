import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { DailyRecord } from '@/lib/types';

const STORAGE_DIR = path.join(process.cwd(), 'Storage');

/**
 * POST /api/storage/delete-trade
 * Deletes a single trade from a daily record
 */
export async function POST(request: NextRequest) {
  try {
    const { tradeId, date } = await request.json() as {
      tradeId: string;
      date: string;
    };

    if (!tradeId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: tradeId, date' },
        { status: 400 }
      );
    }

    const dateDir = path.join(STORAGE_DIR, date);
    const tradesJsonPath = path.join(dateDir, 'trades.json');

    try {
      const fileContent = await fs.readFile(tradesJsonPath, 'utf-8');
      const dailyRecord: DailyRecord = JSON.parse(fileContent);

      // Filter out the trade to delete
      dailyRecord.trades = dailyRecord.trades.filter((t) => t.id !== tradeId);
      dailyRecord.updatedAt = Date.now();

      if (dailyRecord.trades.length === 0) {
        // Delete the entire directory if no trades remain
        try {
          const files = await fs.readdir(dateDir);
          for (const file of files) {
            await fs.unlink(path.join(dateDir, file));
          }
          await fs.rmdir(dateDir);
        } catch {
          // Directory might already be deleted
        }
      } else {
        // Update trades.json
        await fs.writeFile(tradesJsonPath, JSON.stringify(dailyRecord, null, 2), 'utf-8');
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('[Error] Failed to delete trade:', error);
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[Error] Failed to delete trade:', error);
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 }
    );
  }
}
