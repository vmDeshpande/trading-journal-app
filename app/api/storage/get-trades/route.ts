import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { DailyRecord } from '@/lib/types';

const STORAGE_DIR = path.join(process.cwd(), 'Storage');

/**
 * GET /api/storage/get-trades?date=YYYY-MM-DD
 * Retrieves all trades for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Missing required query parameter: date' },
        { status: 400 }
      );
    }

    const dateDir = path.join(STORAGE_DIR, date);
    const tradesJsonPath = path.join(dateDir, 'trades.json');

    try {
      const fileContent = await fs.readFile(tradesJsonPath, 'utf-8');
      const dailyRecord: DailyRecord = JSON.parse(fileContent);
      return NextResponse.json(dailyRecord);
    } catch (error) {
      // File doesn't exist - return empty record
      return NextResponse.json({
        date,
        trades: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error('[Error] Failed to get trades:', error);
    return NextResponse.json(
      { error: 'Failed to get trades' },
      { status: 500 }
    );
  }
}
