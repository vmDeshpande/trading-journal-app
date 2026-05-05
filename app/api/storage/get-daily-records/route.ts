import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { DailyRecord } from '@/lib/types';

const STORAGE_DIR = path.join(process.cwd(), 'Storage');

/**
 * GET /api/storage/get-daily-records
 * Retrieves all daily records (trades.json files from all dates)
 */
export async function GET(request: NextRequest) {
  try {
    const allRecords: DailyRecord[] = [];

    try {
      const entries = await fs.readdir(STORAGE_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const tradesJsonPath = path.join(STORAGE_DIR, entry.name, 'trades.json');
          try {
            const fileContent = await fs.readFile(tradesJsonPath, 'utf-8');
            const dailyRecord: DailyRecord = JSON.parse(fileContent);
            allRecords.push(dailyRecord);
          } catch {
            // Skip if file doesn't exist
          }
        }
      }
    } catch (error) {
      // Storage directory doesn't exist yet
      console.log('[Info] Storage directory not found');
    }

    // Sort by date
    allRecords.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ records: allRecords });
  } catch (error) {
    console.error('[Error] Failed to get daily records:', error);
    return NextResponse.json(
      { error: 'Failed to get daily records' },
      { status: 500 }
    );
  }
}
