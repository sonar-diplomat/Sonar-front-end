import type { AlbumDTO } from '../../entities/Album/model/types.ts';
import type { Artist,Post } from '../../entities/Artist/model/types.ts';
import type { ChatDTO,MessageDTO } from '../../entities/Chat/model/types.ts';
import type { Settings } from '../../entities/ClientSettings/model/types/Settings.ts';
import type { ArtistRegistrationRequestDTO,DistributorAccountDTO,DistributorDTO } from '../../entities/Distribution/model/types.ts';
import type { GiftResponseDTO } from '../../entities/Gift/model/types.ts';
import type { FolderDTO } from '../../entities/Library/model/types.ts';
import type { TrackDTO } from '../../entities/Music/model/types.ts';
import type { PlaylistDTO } from '../../entities/Playlist/model/types.ts';
import type { ReportDTO } from '../../entities/Report/model/types.ts';
import type { SubscriptionPackDTO,SubscriptionPaymentDTO } from '../../entities/Subscription/model/types.ts';
import type { User } from '../../entities/User/model/types.ts';
import type { ActiveSessionDTO } from '../../features/auth/model/types.ts';

export const SCHEMA_VERSION = 1;
export const SEED_VERSION = '1.1.0';
export const STORAGE_KEY = 'sonar-demo:state';
export interface DemoTrack extends TrackDTO { artistIds: number[]; albumId: number; playCount: number }
export interface DemoAlbum extends AlbumDTO { trackIds: number[]; artistIds: number[] }
export interface DemoPlaylist extends PlaylistDTO { trackIds: number[]; isProtected: boolean }
export interface DemoFolder extends Pick<FolderDTO, 'id' | 'name' | 'isProtected' | 'parentFolderId'> { ownerId: number; collectionIds: number[] }
export interface DemoMessage extends MessageDTO { id: number; chatId: number; senderId: number; createdAt: string }
export interface DemoChat extends ChatDTO { id: number }
export interface DemoSession extends ActiveSessionDTO { userId: number }
export interface DemoOutboxItem { id: number; kind: 'confirm-email' | 'reset-password' | 'change-password' | 'change-email'; email: string; token: string; createdAt: string; usedAt?: string }
export interface DemoQueue { trackIds: number[]; currentTrackId: number | null; collectionId: number | null; position: string; statusId: number }
export interface DemoGift extends GiftResponseDTO { paymentId:number; buyerId: number; receiverId: number; subscriptionPackId: number; state: 'pending' | 'accepted' | 'cancelled' }
export interface DemoState {
  revision: number;
  nextId: number;
  session: { userId: number; sessionId: number } | null;
  users: User[];
  artists: Artist[];
  tracks: DemoTrack[];
  albums: DemoAlbum[];
  playlists: DemoPlaylist[];
  folders: DemoFolder[];
  follows: { followerId: number; followingId: number; followedAt: string }[];
  settings: Record<number, Settings>;
  queues: Record<number, DemoQueue>;
  posts: Post[];
  chats: DemoChat[];
  messages: DemoMessage[];
  sessions: DemoSession[];
  outbox: DemoOutboxItem[];
  passwordDigests: Record<number, string>;
  distributorPasswordDigests: Record<number, string>;
  packs: SubscriptionPackDTO[];
  payments: SubscriptionPaymentDTO[];
  gifts: DemoGift[];
  reports: ReportDTO[];
  distributors: DistributorDTO[];
  distributorAccounts: DistributorAccountDTO[];
  artistRequests: ArtistRegistrationRequestDTO[];
  recentTracks: { userId: number; trackId: number; lastPlayedAtUtc: string; contextId: number | null; contextType: number }[];
  recentCollections: { userId: number; collectionId: number; collectionType: number; lastPlayedAtUtc: string }[];
}
export interface DemoSeed { schemaVersion: number; currentUserId: number; state: DemoState }
export interface MockRequest { url: string; method?: string; params?: Record<string, unknown>; body?: unknown; signal?: AbortSignal }
export interface MockResult<T = unknown> { success: boolean; status: number; message: string; data?: T; errors?: string[]; details?: string[] }
export type DemoScenario = 'default' | 'empty' | 'error';
export type LocalEvent = { name: string; payload: unknown };
export const clone = <T>(value: T): T => structuredClone(value);

export function validateSeed(seed: DemoSeed): void {
  if (seed.schemaVersion !== SCHEMA_VERSION) throw new Error('Unsupported demo seed schema');
  validateState(seed.state);
  if (!seed.state.users.some(u => u.id === seed.currentUserId)) throw new Error('Missing current demo user');
}

export function validateState(s: DemoState): void {
  if (!s.passwordDigests || typeof s.passwordDigests !== 'object' || !s.distributorPasswordDigests || typeof s.distributorPasswordDigests !== 'object') throw new Error('Invalid demo credentials schema');
  const tables = [s.users, s.artists, s.tracks, s.albums, s.playlists, s.folders, s.chats, s.messages, s.posts, s.sessions, s.outbox, s.packs, s.payments, s.gifts, s.reports, s.distributors, s.distributorAccounts, s.artistRequests];
  for (const rows of tables) {
    if (!Array.isArray(rows) || rows.some(r => !Number.isSafeInteger(r.id) || r.id < 1) || new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('Invalid or duplicate demo IDs');
  }
  if (!Number.isSafeInteger(s.nextId) || s.nextId < 10000 || !Number.isSafeInteger(s.revision) || s.revision < 0 || tables.some(rows => rows.some(r => r.id >= s.nextId))) throw new Error('Invalid demo sequence');
  const users = new Set(s.users.map(u => u.id)), artists = new Set(s.artists.map(a => a.id)), tracks = new Set(s.tracks.map(t => t.id));
  const collections = new Set([...s.albums, ...s.playlists].map(c => c.id));
  if (collections.size !== s.albums.length + s.playlists.length) throw new Error('Collection IDs overlap');
  const check = (ok: boolean, relation: string) => { if (!ok) throw new Error(`Broken demo relation: ${relation}`); };
  s.users.forEach(u => check(!!s.settings[u.id] && !!s.queues[u.id] && /^[0-9a-f]{64}$/.test(s.passwordDigests[u.id]), 'user.settings/queue/credentials'));
  s.sessions.forEach(v => check(users.has(v.userId), 'session.user'));
  s.artists.forEach(a => check(users.has(a.userId), 'artist.user'));
  s.tracks.forEach(t => { check(t.artistIds.every(id => artists.has(id)), 'track.artist'); check(s.albums.some(a => a.id === t.albumId), 'track.album'); check(typeof t.title === 'string' && t.coverId > 0 && t.lowQualityAudioFileId > 0, 'track.metadata'); });
  s.albums.forEach(a => { check(a.trackIds.every(id => tracks.has(id)), 'album.track'); check(a.artistIds.every(id => artists.has(id)), 'album.artist'); });
  s.playlists.forEach(p => { check(users.has(p.creatorId), 'playlist.creator'); check(p.trackIds.every(id => tracks.has(id)), 'playlist.track'); });
  s.folders.forEach(f => { check(users.has(f.ownerId), 'folder.owner'); check(f.collectionIds.every(id => collections.has(id)), 'folder.collection'); check(f.parentFolderId == null || s.folders.some(p => p.id === f.parentFolderId), 'folder.parent'); const visited = new Set([f.id]); let parent = f.parentFolderId; while (parent != null) { check(!visited.has(parent), 'folder.cycle'); visited.add(parent); parent = s.folders.find(p => p.id === parent)?.parentFolderId; } });
  s.chats.forEach(c => check(c.userIds.every(id => users.has(id)) && users.has(c.creatorId) && c.adminIds.every(id => c.userIds.includes(id)), 'chat.user'));
  s.messages.forEach(m => check(s.chats.some(c => c.id === m.chatId) && users.has(m.senderId), 'message.chat/sender'));
  s.posts.forEach(p => check(artists.has(p.artistId), 'post.artist'));
  s.gifts.forEach(g=>check(users.has(g.buyerId)&&users.has(g.receiverId)&&s.payments.some(p=>p.id===g.paymentId),'gift.payment'));
  s.follows.forEach(f => check(users.has(f.followerId) && users.has(f.followingId), 'follow.user'));
  s.recentTracks.forEach(v => check(users.has(v.userId) && tracks.has(v.trackId), 'recentTrack'));
  s.recentCollections.forEach(v => check(users.has(v.userId) && collections.has(v.collectionId), 'recentCollection'));
  check(s.session === null || (users.has(s.session.userId) && s.sessions.some(v => v.id === s.session?.sessionId && v.userId === s.session.userId)), 'session');
  for (const [id, settings] of Object.entries(s.settings)) check(users.has(Number(id)) && typeof settings.autoPlay === 'boolean' && Array.isArray(settings.blockedUserIds), 'settings');
  for (const queue of Object.values(s.queues)) check(Array.isArray(queue.trackIds) && queue.trackIds.every(id => tracks.has(id)) && (queue.currentTrackId === null || tracks.has(queue.currentTrackId)), 'queue');
}
