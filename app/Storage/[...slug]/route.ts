import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const STORAGE_DIR = path.join(process.cwd(), 'Storage');

/**
 * GET /Storage/[date]/[imageName]
 * Serves files directly from Storage directory
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    
    if (!slug || slug.length === 0) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Reconstruct the file path from slug
    const filePath = path.join(STORAGE_DIR, ...slug);

    // Security: Prevent directory traversal
    if (!filePath.startsWith(STORAGE_DIR)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    try {
      const fileData = await fs.readFile(filePath);
      
      // Determine MIME type based on extension
      const ext = path.extname(filePath).toLowerCase();
      let mimeType = 'application/octet-stream';
      
      if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.json') mimeType = 'application/json';

      return new NextResponse(fileData, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (error) {
      console.error('[Error] File not found:', error);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[Error] Failed to serve file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
