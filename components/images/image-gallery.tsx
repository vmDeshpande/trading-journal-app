'use client';

import { useState, useEffect } from 'react';
import { TradeImage } from '@/lib/types';
import { ImagePreviewModal } from './image-preview-modal';
import { cn } from '@/lib/utils';
import { getImageDataFromStorage } from '@/lib/image-utils';

interface ImageGalleryProps {
  images?: TradeImage[];
  maxDisplay?: number;
  clickable?: boolean;
  date?: string; // Trade date for loading images from storage
}

export function ImageGallery({ images = [], maxDisplay = 4, clickable = true, date }: ImageGalleryProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [imageSrcs, setImageSrcs] = useState<(string | null)[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      if (!date || images.length === 0) {
        setImageSrcs(images.map(() => null));
        return;
      }

      const srcs = await Promise.all(
        images.map(async (image) => {
          try {
            if ('imagePath' in image && image.imagePath) {
              return await getImageDataFromStorage(date, image.imagePath);
            }
          } catch (error) {
            console.error('[Error] Failed to load image:', error);
          }
          return null;
        })
      );
      setImageSrcs(srcs);
    };

    loadImages();
  }, [images, date]);

  if (images.length === 0) {
    return null;
  }

  const displayedImages = images.slice(0, maxDisplay);
  const remaining = Math.max(0, images.length - maxDisplay);

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {displayedImages.map((image, idx) => (
          <button
            key={image.id}
            onClick={() => clickable && setPreviewIndex(idx)}
            className={cn(
              'group relative overflow-hidden rounded-lg w-16 h-16 border border-border bg-muted',
              clickable && 'cursor-pointer hover:ring-2 hover:ring-primary transition-all'
            )}
          >
            {imageSrcs[idx] ? (
              <img
                src={imageSrcs[idx]}
                alt={image.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('[Error] Failed to load gallery image:', imageSrcs[idx]);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Loading...
              </div>
            )}
            {clickable && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="text-white text-xs opacity-0 group-hover:opacity-100">View</span>
              </div>
            )}
          </button>
        ))}

        {remaining > 0 && (
          <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center text-sm font-semibold text-muted-foreground">
            +{remaining}
          </div>
        )}
      </div>

      {clickable && previewIndex !== null && (
        <ImagePreviewModal
          images={images}
          imageSrcs={imageSrcs}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  );
}
