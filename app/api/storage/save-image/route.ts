import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

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
 * Ensure date folder exists
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
 * POST /api/storage/save-image
 * Saves an image file to Storage/[date]/[imageName]
 */
export async function POST(request: NextRequest) {
  try {
    const { date, imageName, imageData } = await request.json() as {
      date: string;
      imageName: string;
      imageData: string; // base64 string
    };

    if (!date || !imageName || !imageData) {
      return NextResponse.json(
        { error: 'Missing required fields: date, imageName, imageData' },
        { status: 400 }
      );
    }

    await ensureStorageDir();
    const dateDir = await ensureDateFolder(date);
    const imagePath = path.join(dateDir, imageName);

    // Convert base64 to buffer and save
    const buffer = Buffer.from(imageData, 'base64');
    await fs.writeFile(imagePath, buffer);

    return NextResponse.json({ 
      success: true, 
      imagePath: imagePath,
      imageName 
    });
  } catch (error) {
    console.error('[Error] Failed to save image:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}
