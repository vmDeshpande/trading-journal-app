'use client';

import { useState, useRef, useEffect } from 'react';
import { TradeImage } from '@/lib/types';
import {
  validateImageFile,
  createTradeImage,
  isMaxImagesReached,
  MAX_IMAGES_PER_TRADE,
  formatFileSize,
  getImageDataFromStorage,
} from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ImageUploadProps {
  images: TradeImage[];
  onImagesAdd: (newImages: TradeImage[]) => void;
  onImageRemove: (imageId: string) => void;
  date: string; // Trade date for file storage organization
}

export function ImageUpload({ images, onImagesAdd, onImageRemove, date }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const newImages: TradeImage[] = [];
      const remainingSlots = MAX_IMAGES_PER_TRADE - images.length;

      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        const file = files[i];
        const validation = validateImageFile(file);

        if (!validation.valid) {
          setUploadError(validation.error || 'Invalid file');
          continue;
        }

        try {
          const tradeImage = await createTradeImage(file, date);
          newImages.push(tradeImage);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : 'Failed to process image');
        }
      }

      if (newImages.length > 0) {
        onImagesAdd(newImages);
      }

      if (newImages.length < files.length) {
        setUploadError(`Only ${newImages.length} of ${files.length} images were added`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMaxImagesReached(images)) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!isMaxImagesReached(images)) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const maxReached = isMaxImagesReached(images);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : maxReached
            ? 'border-muted bg-muted/20 cursor-not-allowed opacity-60'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
        )}
        onClick={() => !maxReached && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={isUploading || maxReached}
        />

        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {isUploading ? 'Processing images...' : 'Drag images here or click to upload'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {maxReached
            ? `Maximum ${MAX_IMAGES_PER_TRADE} images reached`
            : `Up to ${MAX_IMAGES_PER_TRADE - images.length} more images allowed`}
        </p>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Attached Images ({images.length}/{MAX_IMAGES_PER_TRADE})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image) => (
              <ImageThumbnail
                key={image.id}
                image={image}
                date={date}
                onRemove={() => onImageRemove(image.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageThumbnail({
  image,
  date,
  onRemove,
}: {
  image: TradeImage;
  date: string;
  onRemove: () => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if ('imagePath' in image && image.imagePath) {
          const dataUrl = await getImageDataFromStorage(date, image.imagePath);
          setImageSrc(dataUrl);
        }
      } catch (error) {
        console.error('[Error] Failed to load image:', error);
      }
    };

    loadImage();
  }, [image, date]);

  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={image.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('[Error] Failed to load image:', imageSrc);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-xs text-muted-foreground">Loading...</div>
          </div>
        )}
      </div>
      {/* Delete Button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
        title="Remove image"
      >
        <X className="h-4 w-4" />
      </button>
      {/* Checkmark for successfully uploaded */}
      <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1">
        <CheckCircle2 className="h-3 w-3 text-white" />
      </div>
    </div>
  );
}
