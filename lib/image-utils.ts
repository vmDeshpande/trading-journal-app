/**
 * Image compression and processing utilities for offline image storage
 * Images are stored in localStorage as base64, organized by date
 */

import { TradeImage } from './types';
import { saveImageFile, getImageFile } from './file-storage';

const MAX_IMAGES_PER_TRADE = 5;
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const MAX_DIMENSION = 1200; // Max width/height in pixels
const COMPRESSION_QUALITY = 0.8;

/**
 * Compress image using Canvas API
 * Returns base64-encoded compressed image
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if image is too large
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress and convert to base64
        const compressed = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
        resolve(compressed);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image (JPEG, PNG, GIF, WebP)' };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    const sizeMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `Image must be smaller than ${sizeMB}MB` };
  }

  return { valid: true };
}

/**
 * Convert base64 to blob for preview/download
 */
export function base64ToBlob(base64: string, type: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    view[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type });
}

/**
 * Get data URL from base64
 */
export function getImageDataURL(base64: string): string {
  if (base64.startsWith('data:')) {
    return base64;
  }
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Get image data URL from file storage
 * Returns direct file path for images stored in Storage/[date]/[imageName]
 */
export async function getImageDataFromStorage(date: string, imagePath: string): Promise<string | null> {
  try {
    // Images are stored in Storage/[date]/[imageName]
    // Return the direct path that can be loaded by img src
    return `/Storage/${date}/${imagePath}`;
  } catch (error) {
    console.error('[Error] Failed to get image from storage:', error);
    return null;
  }
}

/**
 * Calculate storage size estimate (in characters)
 * Note: Images are stored separately in file storage
 */
export function estimateStorageSize(images: TradeImage[]): number {
  // Since images are stored separately, return a symbolic size
  return images.length * 50000; // Rough estimate of 50KB per image
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a TradeImage from a file and save it to storage
 */
export async function createTradeImage(file: File, date: string): Promise<TradeImage> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const compressedBase64 = await compressImage(file);
  // Extract base64 data without the data URL prefix
  const base64Data = compressedBase64.includes(',') 
    ? compressedBase64.split(',')[1] 
    : compressedBase64;

  const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const imagePath = `${imageId}.jpg`;

  // Save image to file storage
  await saveImageFile(date, imagePath, base64Data);

  return {
    id: imageId,
    name: file.name,
    type: 'image/jpeg', // Always JPEG after compression
    imagePath,
    createdAt: Date.now(),
  };
}

/**
 * Check if trade has reached max images
 */
export function isMaxImagesReached(images?: TradeImage[]): boolean {
  return (images?.length || 0) >= MAX_IMAGES_PER_TRADE;
}

export { MAX_IMAGES_PER_TRADE, MAX_IMAGE_SIZE, MAX_DIMENSION };
