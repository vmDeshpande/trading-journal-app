import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const STORAGE_DIR = path.join(process.cwd(), 'Storage');

/**
 * POST /api/storage/delete-image
 * Deletes an image file from Storage/[date]/[imageName]
 */
export async function POST(request: NextRequest) {
  try {
    const { date, imageName } = await request.json() as {
      date: string;
      imageName: string;
    };

    if (!date || !imageName) {
      return NextResponse.json(
        { error: 'Missing required fields: date, imageName' },
        { status: 400 }
      );
    }

    const imagePath = path.join(STORAGE_DIR, date, imageName);

    try {
      await fs.unlink(imagePath);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('[Error] Failed to delete image:', error);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[Error] Failed to delete image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
