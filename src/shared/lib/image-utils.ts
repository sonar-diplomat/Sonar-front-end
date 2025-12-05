import { API_ENDPOINTS } from '@shared/config';

/**
 * Base URL for blob and stream endpoints
 * Используется отдельный домен для медиа-контента
 */
const MEDIA_BASE_URL = 'https://sonar.pp.ua/api';

/**
 * Converts image ID to blob API URL for image retrieval
 * @param imageId - Image ID from API response
 * @returns Full URL to blob controller endpoint
 */
export const getImageUrlById = (imageId: number | null | undefined): string | undefined => {
  if (!imageId || imageId <= 0) return undefined;
  
  return `${MEDIA_BASE_URL}/${API_ENDPOINTS.blob.image(imageId)}`;
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

/**
 * Converts track ID to stream API URL for audio streaming
 * @param trackId - Track ID from API response
 * @param params - Optional query parameters (startPosition, length, download)
 * @returns Full URL to track stream endpoint
 */
export const getTrackStreamUrl = (
  trackId: number,
  params?: { startPosition?: string; length?: string; download?: boolean }
): string => {
  const baseUrl = `${MEDIA_BASE_URL}/${API_ENDPOINTS.track.stream(trackId)}`;
  
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams();
  if (params.startPosition) searchParams.append('startPosition', params.startPosition);
  if (params.length) searchParams.append('length', params.length);
  if (params.download !== undefined) searchParams.append('download', String(params.download));
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

