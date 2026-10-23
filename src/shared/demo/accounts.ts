import { clone,type DemoOutboxItem } from './database.ts';
import { byId,features,id,integer,languages,need,numbers,privacyGroups,qualities,record,route,text,themes,trackView,type Context,type Route } from './operations.ts';

const field = (b: Record<string, unknown>, key: string) => Object.entries(b).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1];
export async function digestPassword(password: string): Promise<string> { const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)); return [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, '0')).join(''); }
function email(value: unknown): string { const v = text(value, 'Email', 254).toLowerCase(); need(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email'); return v; }
function receipt(c: Context, kind: DemoOutboxItem['kind'], address: string) { const item: DemoOutboxItem = { id: c.s.nextId++, kind, email: address, token: 'demo-token', createdAt: c.now }; c.s.outbox.filter(v => v.kind === kind && v.email === address && !v.usedAt).forEach(v => { v.usedAt = c.now; }); c.s.outbox.push(item); return item; }
function consume(c: Context, kind: DemoOutboxItem['kind'], address: string, token: unknown) { const item = [...c.s.outbox].reverse().find(v => v.kind === kind && v.email === address && !v.usedAt); need(item && item.token === token, 'Invalid or already used local confirmation code'); item!.usedAt = c.now; }
function session(c: Context, userId: number, deviceName = 'This demo browser') { const found = { id: c.s.nextId++, userId, deviceName, userAgent: 'Local demo', ipAddress: 'local', createdAt: c.now, lastActive: c.now }; c.s.sessions.push(found); c.s.session = { userId, sessionId: found.id }; return { accessToken: '', refreshToken: '', sessionId: found.id, demoUserId: userId }; }
function queue(c: Context) { return c.s.queues[c.user()] ??= { trackIds: [], currentTrackId: null, collectionId: null, position: '00:00:00', statusId: 1 }; }

export const accountRoutes: Route[] = [
  route('POST', 'Demo/session', c => session(c, byId(c.s.users, 1).id), true),
  route('DELETE', 'Demo/session', c => { c.s.session = null; }, true),
  route('POST', 'Auth/register', async c => {
    const b = record(c.body), address = email(field(b, 'email')), username = text(field(b, 'username'), 'Username'), login = text(field(b, 'login'), 'Login'), password = text(field(b, 'password'), 'Password', 200);
    need(password.length >= 6, 'Password must have at least 6 characters');
    need(!c.s.users.some(u => u.email.toLowerCase() === address || u.login.toLowerCase() === login.toLowerCase() || u.publicIdentifier.toLowerCase() === login.toLowerCase()), 'Email or login is already registered locally', 409);
    const passwordDigest = await digestPassword(password), userId = c.s.nextId++;
    const u = { ...clone(byId(c.s.users, 1)), id: userId, userName: username, login, email: address, publicIdentifier: login, firstName: text(field(b, 'firstName') ?? username), lastName: String(field(b, 'lastName') ?? ''), dateOfBirth: String(field(b, 'dateOfBirth') ?? '2000-01-01'), registrationDate: c.now, emailConfirmed: false, subscriptionPackId: null, avatarImageId: 305, biography: '', accessFeatures: clone(features), userStateId: userId, settingsId: userId, inventoryId: userId, libraryId: userId };
    c.s.users.push(u); c.s.passwordDigests[userId] = passwordDigest;
    c.s.settings[userId] = { ...clone(c.s.settings[1]), id: userId, userId, userPrivacySettingsId: userId, blockedUserIds: [], userPrivacy:{...clone(c.s.settings[1].userPrivacy!),id:userId,settingsId:userId} };
    const folderId = c.s.nextId++, playlistId = c.s.nextId++;
    c.s.playlists.push({ id: playlistId, name: 'Favorites', creatorId: userId, trackIds: [], contributors: [], isProtected: true, visibilityStateId: 1, coverId: 201 });
    c.s.folders.push({ id: folderId, name: 'Root', isProtected: true, ownerId: userId, collectionIds: [playlistId] });
    c.s.queues[userId] = { trackIds: [], currentTrackId: null, collectionId: null, position: '00:00:00', statusId: 1 };
    return receipt(c, 'confirm-email', address);
  }, true),
  route('POST', 'Auth/login', async c => { const identifier = text(c.p.get('userIdentifier'), 'Login').toLowerCase(), password = text(c.p.get('password'), 'Password', 200); const user = c.s.users.find(u => [u.email, u.login, u.publicIdentifier].some(v => v.toLowerCase() === identifier)); need(user && c.s.passwordDigests[user.id] === await digestPassword(password), 'Local login or password is incorrect', 401); need(user!.emailConfirmed, 'Complete local email confirmation first', 403); return session(c, user!.id); }, true),
  route('POST', 'Auth/refresh-token', () => ({ newAccessToken: '', refreshToken: '' }), true),
  route('POST', 'Auth/verify-2fa', () => { need(false, 'Two-factor authentication is disabled for local demo accounts'); }),
  route('GET', 'Auth/sessions', c => c.s.sessions.filter(s => s.userId === c.user())),
  route('POST', 'Auth/sessions/:id/revoke', c => { const found = byId(c.s.sessions, id(c), 'Session'); need(found.userId === c.user(), 'Cannot revoke another user session', 403); c.s.sessions = c.s.sessions.filter(v => v.id !== found.id); if (c.s.session?.sessionId === found.id) c.s.session = null; }),
  route('POST', 'Auth/sessions/revoke-all', c => { const me = c.user(); c.s.sessions = c.s.sessions.filter(v => v.userId !== me); c.s.session = null; }),
  route('POST', 'Auth/confirm-email', c => { const address = email(c.p.get('email')), user = c.s.users.find(u => u.email.toLowerCase() === address); need(user, 'Local account not found', 404); consume(c, 'confirm-email', address, c.p.get('token')); user!.emailConfirmed = true; return { email: address, confirmed: true }; }, true),
  route('POST', 'Auth/forgot-password', c => { const address = email(field(record(c.body), 'email')); need(c.s.users.some(u => u.email.toLowerCase() === address), 'Local account not found', 404); return receipt(c, 'reset-password', address); }, true),
  route('POST', 'Auth/reset-password', async c => { const b = record(c.body), address = email(field(b, 'email')), user = c.s.users.find(u => u.email.toLowerCase() === address); need(user, 'Local account not found', 404); const password = text(field(b, 'newPassword'), 'Password'); need(password.length >= 6, 'Password must have at least 6 characters'); consume(c, 'reset-password', address, field(b, 'token')); c.s.passwordDigests[user!.id] = await digestPassword(password); return { email: address, passwordChanged: true }; }, true),
  route('POST', 'Auth/request-password-change', c => receipt(c, 'change-password', byId(c.s.users, c.user()).email)),
  route('POST', 'Auth/confirm-password-change', async c => { const b = record(c.body), u = byId(c.s.users, c.user()); need(c.s.passwordDigests[u.id] === await digestPassword(text(field(b, 'oldPassword'), 'Old password')), 'Old local password is incorrect'); const password = text(field(b, 'newPassword'), 'New password'); need(password.length >= 6, 'Password must have at least 6 characters'); consume(c, 'change-password', u.email, field(b, 'token')); c.s.passwordDigests[u.id] = await digestPassword(password); }),
  route('POST', 'Auth/request-email-change', c => { const address = email(c.body); need(!c.s.users.some(u => u.email.toLowerCase() === address), 'Email is already registered locally', 409); return receipt(c, 'change-email', address); }),
  route('POST', 'Auth/confirm-email-change', c => { const b = record(c.body), u = byId(c.s.users, c.user()), address = email(b.email); need(String(u.id) === String(b.userId), 'User does not match session', 403); consume(c, 'change-email', address, b.token); u.email = address; u.emailConfirmed = true; }),
  route('GET', 'ClientSettings', c => c.s.settings[c.user()]),
  route('GET', 'ClientSettings/languages', () => languages, true),
  route('GET', 'ClientSettings/themes', () => themes, true),
  route('GET', 'ClientSettings/playback-qualities', () => qualities, true),
  route('GET', 'ClientSettings/notification-types', () => [{ id: 1, name: 'All', description: 'All notifications' }, { id: 2, name: 'None', description: 'Notifications disabled' }], true),
  route('PATCH', 'ClientSettings', c => {
    const s = c.s.settings[c.user()], b = record(c.body); const allowed = ['autoPlay', 'crossfade', 'explicitContent', 'preferredPlaybackQualityId', 'languageId', 'themeId', 'notificationTypeId', 'notificationTypeIds', 'userPrivacySettingsId', 'userPrivacy', 'blockedUserIds'];
    need(Object.keys(b).every(k => allowed.includes(k)), 'Unknown client setting');
    for (const key of ['autoPlay', 'crossfade', 'explicitContent'] as const) if (b[key] !== undefined) { need(typeof b[key] === 'boolean', `${key} must be boolean`); s[key] = b[key] as boolean; }
    if (b.languageId != null) { s.language = byId(languages, integer(b.languageId)); s.languageId = s.language.id; }
    if (b.themeId != null) { s.theme = byId(themes, integer(b.themeId)); s.themeId = s.theme.id; }
    if (b.preferredPlaybackQualityId != null) { s.preferredPlaybackQuality = byId(qualities, integer(b.preferredPlaybackQualityId)); s.preferredPlaybackQualityId = s.preferredPlaybackQuality.id; }
    if (b.blockedUserIds !== undefined) { s.blockedUserIds = numbers(b.blockedUserIds); s.blockedUserIds.forEach(v => { byId(c.s.users, v); need(v !== c.user(), 'You cannot block yourself'); }); }
    if (b.userPrivacy !== undefined) { const p = record(b.userPrivacy), current = s.userPrivacy!; if (p.whichCanViewProfileId != null) { current.whichCanViewProfile = byId(privacyGroups, integer(p.whichCanViewProfileId)); current.whichCanViewProfileId = current.whichCanViewProfile.id; } if (p.whichCanMessageId != null) { current.whichCanMessage = byId(privacyGroups, integer(p.whichCanMessageId)); current.whichCanMessageId = current.whichCanMessage.id; } }
    if (b.notificationTypeId != null) s.notificationTypeId = integer(b.notificationTypeId);
    if (b.notificationTypeIds != null) s.notificationTypes = numbers(b.notificationTypeIds).map(v => ({ id: v, name: v === 1 ? 'All' : 'None', description: 'Local notification preference' }));
    return s;
  }),
  route('GET', 'UserState/queue', c => { const q = queue(c); return { Id: c.user(), Position: q.position, CollectionId: q.collectionId, CurrentTrackId: q.currentTrackId, QueueTracks: q.trackIds.map((trackId, i) => ({ Id: i + 1, QueueId: c.user(), TrackId: trackId, Order: i, IsManuallyAdded: true, Track: trackView(c, byId(c.s.tracks, trackId)) })) }; }),
  route('PUT', 'UserState/current-position', c => { const position = text(c.body, 'Position'); need(/^\d{1,3}:\d{2}:\d{2}(\.\d+)?$/.test(position), 'Position must be a TimeSpan'); queue(c).position = position; }),
  route('PUT', 'UserState/listening/:trackId', c => setListening(c)),
  route('PUT', 'UserState/listening/:trackId/:collectionId', c => setListening(c)),
  route('POST', 'UserState/queue', c => { const trackId = byId(c.s.tracks, integer(c.body)).id; queue(c).trackIds.push(trackId); }),
  route('DELETE', 'UserState/queue', c => { const trackId = integer(c.body); queue(c).trackIds = queue(c).trackIds.filter(v => v !== trackId); }),
  route('PUT', 'UserState/queue', c => { need(Array.isArray(c.body), 'Queue must be an array of track IDs'); const ids = (c.body as unknown[]).map(v => byId(c.s.tracks, integer(v)).id); queue(c).trackIds = ids; }),
  route('PUT', 'UserState/status/:id', c => { const status = id(c); need(status <= 3, 'Unknown status'); queue(c).statusId = status; }),
  route('PATCH', 'UserState/session', c => { byId(c.s.sessions, c.s.session!.sessionId).lastActive = c.now; }),
];
function setListening(c: Context) { const trackId = byId(c.s.tracks, id(c, 'trackId')).id, collectionId = c.v.collectionId ? id(c, 'collectionId') : null, q = queue(c); if (collectionId) need([...c.s.albums, ...c.s.playlists].some(a => a.id === collectionId && a.trackIds.includes(trackId)), 'Track is not in the selected collection'); if(q.currentTrackId===trackId && q.collectionId===collectionId) return; q.currentTrackId = trackId; q.collectionId = collectionId; q.position = '00:00:00'; byId(c.s.tracks, trackId).playCount++; c.s.recentTracks = [{ userId:c.user(), trackId, lastPlayedAtUtc: c.now, contextId: collectionId, contextType: collectionId ? (c.s.albums.some(a => a.id === collectionId) ? 1 : 2) : 0 }, ...c.s.recentTracks.filter(v => v.userId!==c.user() || v.trackId !== trackId)]; if (collectionId) c.s.recentCollections = [{ userId:c.user(), collectionId, collectionType: c.s.albums.some(a => a.id === collectionId) ? 1 : 2, lastPlayedAtUtc: c.now }, ...c.s.recentCollections.filter(v => v.userId!==c.user() || v.collectionId !== collectionId)]; }
