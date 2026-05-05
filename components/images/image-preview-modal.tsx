'use client';

import { useState } from 'react';
import { TradeImage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImagePreviewModalProps {
  images: TradeImage[];
  imageSrcs?: (string | null)[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImagePreviewModal({ images, imageSrcs = [], initialIndex = 0, onClose }: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];
  const imageUrl = imageSrcs[currentIndex] || 'about:blank';

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoom(1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoom(1);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) => {
      const newZoom = direction === 'in' ? Math.min(prev + 0.2, 3) : Math.max(prev - 0.2, 1);
      return newZoom;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-white text-sm font-medium">
            {currentIndex + 1} of {images.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('out')}
              disabled={zoom === 1}
              className="text-white hover:bg-white/10"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('in')}
              disabled={zoom === 3}
              className="text-white hover:bg-white/10"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transition: 'transform 0.3s ease-out',
              transform: `scale(${zoom})`,
            }}
          >
            <img
              src={imageUrl}
              alt={currentImage.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('[Error] Failed to load preview image:', imageUrl);
                e.currentTarget.alt = 'Failed to load image';
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto max-w-xs">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoom(1);
                  }}
                  className={cn(
                    'flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all bg-white/10',
                    currentIndex === idx
                      ? 'border-white ring-2 ring-white'
                      : 'border-white/30 hover:border-white/60'
                  )}
                >
                  {imageSrcs[idx] ? (
                    <img
                      src={imageSrcs[idx]}
                      alt={img.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('[Error] Failed to load thumbnail:', imageSrcs[idx]);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                      Loading...
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="text-white hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
