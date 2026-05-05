/**
 * Utility functions for execution quality scoring (1-10 scale)
 */

/**
 * Get color styling for execution quality
 * 1-3: red (poor)
 * 4-6: yellow (average)
 * 7-10: green (good)
 */
export function getQualityColor(quality: number): string {
  if (quality >= 7) {
    return 'text-green-700';
  } else if (quality >= 4) {
    return 'text-yellow-700';
  } else {
    return 'text-red-700';
  }
}

export function getQualityBgColor(quality: number): string {
  if (quality >= 7) {
    return 'bg-green-50 border-green-200';
  } else if (quality >= 4) {
    return 'bg-yellow-50 border-yellow-200';
  } else {
    return 'bg-red-50 border-red-200';
  }
}

export function getQualityBadgeColor(quality: number): string {
  if (quality >= 7) {
    return 'bg-green-600 text-white';
  } else if (quality >= 4) {
    return 'bg-yellow-600 text-white';
  } else {
    return 'bg-red-600 text-white';
  }
}

export function getQualityLabel(quality: number): string {
  if (quality >= 7) {
    return 'Good';
  } else if (quality >= 4) {
    return 'Average';
  } else {
    return 'Poor';
  }
}

export function isValidQuality(quality: number): boolean {
  return quality >= 1 && quality <= 10 && Number.isInteger(quality);
}
