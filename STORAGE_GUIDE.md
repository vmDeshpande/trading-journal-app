# File-Based Storage Guide

## Overview

The Stock Trading Journal App now uses a **completely local, file-based storage system** stored directly on your filesystem. All data is persistent on disk and organized by date in the `Storage/` folder at the project root.

## Folder Structure

```
project-root/
├── Storage/                              # Created automatically
│   ├── 2024-01-15/
│   │   ├── trades.json                  # All trades for this date
│   │   ├── img-1705316400000-abc123.jpg
│   │   ├── img-1705316450000-def456.jpg
│   │   └── ...
│   ├── 2024-01-16/
│   │   ├── trades.json
│   │   ├── img-1705402800000-ghi789.jpg
│   │   └── ...
│   └── ...
├── app/
├── components/
├── lib/
└── package.json
```

## When Does Storage Folder Appear?

The `Storage/` folder is created **automatically on first save**:
- When you create your first trade, the folder structure is created
- For each date with trades, a dated subfolder is created (e.g., `Storage/2024-01-15/`)
- The `trades.json` file in each date folder contains all trades for that day
- Images are saved as separate JPEG files in the same folder

## File Formats

### trades.json Format

Each `Storage/[date]/trades.json` contains:

```json
{
  "date": "2024-01-15",
  "trades": [
    {
      "id": "trade-1705316400000-xyz",
      "date": "2024-01-15",
      "symbol": "AAPL",
      "entryPrice": 150.25,
      "exitPrice": 152.50,
      "quantity": 10,
      "side": "BUY",
      "type": "LIMIT",
      "status": "CLOSED",
      "notes": "Strong uptrend",
      "images": [
        {
          "id": "img-1705316400000-abc123",
          "name": "chart.jpg",
          "type": "image/jpeg",
          "imagePath": "img-1705316400000-abc123.jpg",
          "caption": "Entry point",
          "createdAt": 1705316400000
        }
      ],
      "entryTime": "09:30",
      "exitTime": "14:15",
      "pnl": 225,
      "pnlPercent": 1.5,
      "createdAt": 1705316400000,
      "updatedAt": 1705316400000
    }
  ],
  "createdAt": 1705316400000,
  "updatedAt": 1705316400000
}
```

### Image Files

Images are stored as actual JPEG binary files with names like:
- `img-1705316400000-abc123.jpg` (real binary JPEG file)
- `img-1705316450000-def456.jpg`

## How Data Flows

### Saving a Trade

1. You fill out the trade form and add images
2. Images are compressed to JPEG format (client-side)
3. **API: POST /api/storage/save-image**
   - Creates `Storage/[date]/` folder if it doesn't exist
   - Saves compressed image as binary JPEG file
4. **API: POST /api/storage/save-trade**
   - Reads existing `Storage/[date]/trades.json` (or creates new)
   - Adds/updates the trade record
   - Writes updated JSON back to disk

### Loading Trades

1. **API: GET /api/storage/get-trades?date=YYYY-MM-DD**
   - Reads `Storage/[date]/trades.json` from disk
   - Returns all trades for that date
2. **Direct: GET /Storage/[date]/[imageName]**
   - Route handler serves image file directly with proper MIME type
   - Browser caches images for performance

### Deleting Trades

1. **API: POST /api/storage/delete-trade**
   - Removes trade from `Storage/[date]/trades.json`
   - If no trades remain, deletes entire date folder
2. **API: POST /api/storage/delete-image**
   - Removes image file from `Storage/[date]/`

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/storage/save-trade` | POST | Save/update a trade record |
| `/api/storage/save-image` | POST | Save an image file |
| `/api/storage/get-trades` | GET | Get all trades for a date |
| `/api/storage/get-all-trades` | GET | Get all trades from all dates |
| `/api/storage/get-daily-records` | GET | Get all daily records metadata |
| `/api/storage/delete-trade` | POST | Delete a single trade |
| `/api/storage/delete-image` | POST | Delete an image file |
| `/Storage/[date]/[image]` | GET | Serve image files directly |

## Key Implementation Files

### New Files
- `app/api/storage/save-trade/route.ts` - Trade persistence
- `app/api/storage/save-image/route.ts` - Image file saving
- `app/api/storage/get-trades/route.ts` - Load trades by date
- `app/api/storage/get-all-trades/route.ts` - Load all trades
- `app/api/storage/get-daily-records/route.ts` - Load daily summaries
- `app/api/storage/delete-trade/route.ts` - Trade deletion
- `app/api/storage/delete-image/route.ts` - Image deletion
- `app/Storage/[...slug]/route.ts` - Static file serving
- `lib/file-storage.ts` - Storage abstraction layer (client-side API calls)

### Modified Files
- `lib/types.ts` - Changed `TradeImage.data` to `TradeImage.imagePath`
- `lib/image-utils.ts` - Updated for file-based image handling
- `hooks/useJournal.ts` - Now uses file-storage module (API calls)
- `components/images/image-upload.tsx` - Pass date for file organization
- `components/images/image-gallery.tsx` - Load images from Storage folder
- `components/forms/trade-modal.tsx` - Pass date to ImageUpload

### Removed Files
- `lib/db.ts` - IndexedDB implementation removed

## Removed Dependencies
- `idb` - IndexedDB package no longer needed

## Advantages

✅ **Completely Local** - No cloud storage required  
✅ **Persistent** - Data survives app restarts  
✅ **Portable** - Share entire Storage folder as backup  
✅ **Private** - Data never leaves your machine  
✅ **Easy Access** - Plain JSON and image files  
✅ **Unlimited Storage** - Limited only by disk space  
✅ **Fast** - Direct filesystem operations  

## Backup Your Data

To backup all your trading data:

```bash
# Create a dated backup of the Storage folder
cp -r Storage Storage-backup-$(date +%Y-%m-%d)
```

To restore from backup:

```bash
# Copy backup back
cp -r Storage-backup-2024-01-20/* Storage/
```

## Manual Data Access

Since all data is plain JSON and image files, you can:

1. Open `Storage/[date]/trades.json` in any text editor to view/edit trades
2. View images in any image viewer
3. Parse the JSON programmatically if needed
4. Make manual backups by copying the Storage folder

Example: View trades for a specific date
```bash
cat Storage/2024-01-15/trades.json | jq '.'
ls -lh Storage/2024-01-15/
```

## Troubleshooting

**Q: Storage folder doesn't exist**  
A: It's created on first trade save. Create your first trade and the folder will appear.

**Q: Can't see images in the app**  
A: Make sure the Next.js dev server is running. Images are served via the `/Storage/` route handler.

**Q: Lost data accidentally**  
A: If you have a backup, restore it using the backup commands above. Otherwise, data in Storage folder is permanent.

**Q: How to wipe all data**  
A: Delete the entire `Storage/` folder. The app will recreate it when you save the next trade.

---

**Storage System:** Filesystem-based (v2.0)  
**Last Updated:** 2024
