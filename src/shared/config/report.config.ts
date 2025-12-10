export type ReportEntityCategory = 'content' | 'user';

export const ENTITY_TYPE_IDS = {
  track: 1,
  album: 2,
  playlist: 3,
  artist: 4,
  user: 5,
} as const;

export const CONTENT_ENTITY_TYPES = [
  ENTITY_TYPE_IDS.track,
  ENTITY_TYPE_IDS.album,
  ENTITY_TYPE_IDS.playlist,
  ENTITY_TYPE_IDS.artist,
] as const;

export const USER_ENTITY_TYPE = ENTITY_TYPE_IDS.user;

/**
 * Determines the category of an entity type
 * @param entityTypeId - The ID of the entity type
 * @returns 'content' for track/album/playlist/artist, 'user' for user
 */
export function getEntityCategory(entityTypeId: number): ReportEntityCategory {
  return CONTENT_ENTITY_TYPES.includes(entityTypeId as any) ? 'content' : 'user';
}

/**
 * Checks if an entity type is a content type
 * @param entityTypeId - The ID of the entity type
 * @returns true if the entity is content (track, album, playlist, artist)
 */
export function isContentEntity(entityTypeId: number): boolean {
  return getEntityCategory(entityTypeId) === 'content';
}

/**
 * Checks if an entity type is a user type
 * @param entityTypeId - The ID of the entity type
 * @returns true if the entity is a user
 */
export function isUserEntity(entityTypeId: number): boolean {
  return getEntityCategory(entityTypeId) === 'user';
}

/**
 * Default descriptions for report forms based on category
 * Note: Filtering of reasons is now handled by the backend based on entity type
 */
export const REPORT_DESCRIPTIONS = {
  content: "Help us keep Sonar safe. Select the reason why you're reporting this content.",
  user: "Help us keep Sonar safe. Select the reason why you're reporting this user.",
} as const;

/**
 * Gets the appropriate description for a report form based on entity category
 * @param entityTypeId - The ID of the entity type
 * @returns Description string for the report form
 */
export function getReportDescription(entityTypeId: number): string {
  const category = getEntityCategory(entityTypeId);
  return REPORT_DESCRIPTIONS[category];
}

