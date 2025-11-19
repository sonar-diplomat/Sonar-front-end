import { API_BASE_URL, API_ENDPOINTS } from '@shared/config';

/**
 * Converts image ID to blob API URL for image retrieval
 * @param imageId - Image ID from API response
 * @returns Full URL to blob controller endpoint
 */
export const getImageUrlById = (imageId: number | null | undefined): string | undefined => {
  if (!imageId || imageId <= 0) return undefined;
  
  // Remove trailing slash from base URL if present
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/${API_ENDPOINTS.blob.image(imageId)}`;
};

/**
 * Gets image URL from various sources
 * Supports:
 * - Image ID (number) - converts to blob API URL
 * - Full URL (string starting with http/https) - returns as is
 * - File object - creates object URL
 * - Object with id property - extracts ID and converts to blob API URL
 * - Object with url property - returns URL if it's a full URL, otherwise converts to blob API URL
 * @param source - Can be an image ID, full URL, File object, or object with id/url property
 * @returns Image URL or undefined
 */
export const getImageUrl = (
  source?: number | string | File | { id?: number; url?: string } | null
): string | undefined => {
  if (!source) return undefined;
  
  // Number source (image ID)
  if (typeof source === 'number') {
    return getImageUrlById(source);
  }
  
  // String source
  if (typeof source === 'string') {
    // If already a full URL, return as is
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return source;
    }
    // Try to parse as number (for backward compatibility)
    const parsedId = Number(source);
    if (!isNaN(parsedId) && parsedId > 0) {
      return getImageUrlById(parsedId);
    }
    return undefined;
  }
  
  // File object
  if (source instanceof File) {
    return URL.createObjectURL(source);
  }
  
  // Object with id property (priority)
  if (typeof source === 'object' && 'id' in source && typeof source.id === 'number') {
    return getImageUrlById(source.id);
  }
  
  // Object with url property (fallback)
  if (typeof source === 'object' && 'url' in source && source.url) {
    const url = source.url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Try to parse as number
    const parsedId = Number(url);
    if (!isNaN(parsedId) && parsedId > 0) {
      return getImageUrlById(parsedId);
    }
    return undefined;
  }
  
  return undefined;
};

