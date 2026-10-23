import type { TrackDTO } from '../../Music/model/types';

export interface QueueTrackDTO { Id: number; QueueId: number; TrackId: number; Order: number; IsManuallyAdded: boolean; Track: TrackDTO }
export interface QueueDTO { Id: number; Position: string | null; CollectionId: number | null; CurrentTrackId: number | null; QueueTracks: QueueTrackDTO[] }
const object = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const number = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
export function normalizeQueue(response: unknown): QueueDTO | null {
  if (typeof response === 'string') { try { return normalizeQueue(JSON.parse(response)); } catch { return null; } }
  const row = object(response); if (!row) return null;
  const id = number(row.Id ?? row.id) ?? 0;
  const rawTracks = row.QueueTracks ?? row.queueTracks ?? row.Tracks ?? row.tracks;
  if (!Array.isArray(rawTracks)) return null;
  const tracks: QueueTrackDTO[] = [];
  for (let index = 0; index < rawTracks.length; index++) {
    const entry = object(rawTracks[index]); if (!entry) continue;
    const track = object(entry.Track ?? entry.track ?? entry);
    if (!track || typeof track.id !== 'number' || typeof track.title !== 'string') continue;
    tracks.push({ Id: number(entry.Id ?? entry.id) ?? index + 1, QueueId: number(entry.QueueId ?? entry.queueId) ?? id, TrackId: number(entry.TrackId ?? entry.trackId) ?? track.id, Order: number(entry.Order ?? entry.order) ?? index, IsManuallyAdded: entry.IsManuallyAdded === true || entry.isManuallyAdded === true, Track: track as unknown as TrackDTO });
  }
  const position = row.Position ?? row.position;
  return { Id: id, Position: typeof position === 'string' ? position : null, CollectionId: number(row.CollectionId ?? row.collectionId), CurrentTrackId: number(row.CurrentTrackId ?? row.currentTrackId), QueueTracks: tracks };
}
