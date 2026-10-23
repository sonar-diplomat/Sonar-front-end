import {digestPassword} from './accounts.ts';
import { clone } from './database.ts';
import { byId,id,integer,need,offsetPage,record,removeId,route,text,upload,type Context,type Route } from './operations.ts';
const entityTypes = [{ id: 1, name: 'Track' }, { id: 2, name: 'Playlist' }, { id: 3, name: 'User' }, { id: 4, name: 'Post' }];
const reasonTypes = [{ id: 1, name: 'Inappropriate content', recommendedSuspensionDuration: '1.00:00:00', applicableEntityTypeIds: [1, 2, 3, 4] }, { id: 2, name: 'Spam', recommendedSuspensionDuration: '00:00:00', applicableEntityTypeIds: [2, 3, 4] }];
const giftStyles = [{ id: 1, name: 'First light' }, { id: 2, name: 'Blue hour' }];
function createPayment(c: Context, packId: number, amount: number) { const pack=byId(c.s.packs,packId,'Subscription pack');need(Number.isFinite(amount)&&amount>0&&amount<=1000000,'Amount must be a positive payment amount');const payment={id:c.s.nextId++,buyerId:c.user(),buyer:{id:c.user()},subscriptionPackId:pack.id,subscriptionPackName:pack.name,amount,createdAt:c.now,subscriptionPack:clone(pack)};c.s.payments.push(payment);return payment; }
function purchase(c: Context, packId: number, amount: number) { const payment=createPayment(c,packId,amount);byId(c.s.users,c.user()).subscriptionPackId=packId;return payment; }
function ownGift(c: Context) { const g = byId(c.s.gifts, id(c), 'Gift'); need(g.buyerId === c.user() || g.receiverId === c.user(), 'Gift access denied', 403); return g; }
function filterReports(c: Context) { const raw = c.p.get('filter'); let b: Record<string, unknown> = {}; if (raw) { try { b = record(JSON.parse(raw)); } catch { need(false, 'Invalid report filter JSON'); } } else b = Object.fromEntries(c.p); return offsetPage(c, c.s.reports.filter(r => (b.entityId == null || r.entityIdentifier === Number(b.entityId)) && (b.typeId == null || r.reportableEntityTypeId === Number(b.typeId)) && (b.reporterId == null || r.reporterId === Number(b.reporterId)) && (b.isClosed == null || r.isClosed === (b.isClosed === true || b.isClosed === 'true')))).items; }
function account(c: Context) { return byId(c.s.distributorAccounts, id(c), 'Distributor account'); }

export const administrationRoutes: Route[] = [
  route('GET', 'Subscription/packs', c => c.s.packs, true),
  route('GET', 'Subscription/packs/:id', c => byId(c.s.packs, id(c)), true),
  route('GET', 'Subscription/features', c => [...new Map(c.s.packs.flatMap(p => p.subscriptionFeatures).map(f => [f.id, f])).values()], true),
  route('GET', 'Subscription/features/:id', c => byId(c.s.packs.flatMap(p => p.subscriptionFeatures), id(c)), true),
  route('GET', 'Subscription/payments', c => c.s.payments.filter(p => p.buyerId === c.user())),
  route('GET', 'Subscription/payments/:id', c => { const p = byId(c.s.payments, id(c)); need(p.buyerId === c.user(), 'Payment access denied', 403); return p; }),
  route('POST', 'Subscription/purchase', c => { const b = record(c.body); return purchase(c, integer(b.subscriptionPackId), Number(b.amount)); }),
  route('GET', 'Gift/styles', () => giftStyles, true),
  route('GET', 'Gift/styles/:id', c => byId(giftStyles, id(c)), true),
  route('GET', 'Gift/received', c => c.s.gifts.filter(g => g.receiverId === c.user() && g.state !== 'cancelled')),
  route('GET', 'Gift/sent', c => c.s.gifts.filter(g => g.buyerId === c.user())),
  route('GET', 'Gift/:id', ownGift),
  route('POST', 'Gift/send', c => { const b = record(c.body), receiver = byId(c.s.users, integer(b.receiverId)), style = byId(giftStyles, integer(b.giftStyleId)), pack = byId(c.s.packs, integer(b.subscriptionPackId)); need(Number(b.buyerId) === c.user(), 'Sender must be the current user', 403); const amount = Number(b.amount); const title=text(b.title); const payment=createPayment(c,pack.id,amount); const gift = { id: c.s.nextId++, buyerId: c.user(), receiverId: receiver.id, subscriptionPackId: pack.id, paymentId:payment.id, title, textContent: String(b.textContent ?? ''), giftTime: String(b.giftTime ?? c.now), acceptanceDate: '', receiverName: receiver.userName, giftStyleName: style.name, subscriptionAmount: amount, subscriptionPackName: pack.name, state: 'pending' as const }; c.s.gifts.push(gift); return gift; }),
  route('POST', 'Gift/:id/accept', c => { const g = ownGift(c); need(g.receiverId === c.user(), 'Only the recipient can accept', 403); need(g.state === 'pending', 'Gift is no longer pending', 409); const receiver=byId(c.s.users,c.user());need(receiver.subscriptionPackId==null,'This user already has a subscription',403);g.state = 'accepted'; g.acceptanceDate = c.now; receiver.subscriptionPackId=g.subscriptionPackId;return byId(c.s.payments,g.paymentId,'Gift payment'); }),
  route('DELETE', 'Gift/:id/cancel', c => { const g = ownGift(c); need(g.receiverId === c.user(), 'Only the recipient can cancel', 403); need(g.state === 'pending', 'Gift is no longer pending', 409); c.s.payments=removeId(c.s.payments,g.paymentId);c.s.gifts=removeId(c.s.gifts,g.id); }),
  route('GET', 'Report', c => filterReports(c)),
  route('GET', 'Report/filter', c => filterReports(c)),
  route('GET', 'Report/open', c => c.s.reports.filter(r => !r.isClosed)),
  route('GET', 'Report/reporter/:id', c => c.s.reports.filter(r => r.reporterId === id(c))),
  route('GET', 'Report/:id', c => byId(c.s.reports, id(c), 'Report')),
  route('GET', 'Report/reason-types', () => reasonTypes, true),
  route('GET', 'Report/reason-types/:id', c => byId(reasonTypes, id(c)), true),
  route('GET', 'Report/reason-types/by-entity-type/:id', c => reasonTypes.filter(r => r.applicableEntityTypeIds.includes(id(c))), true),
  route('GET', 'Report/entity-types', () => entityTypes, true),
  route('GET', 'Report/entity-types/:id', c => byId(entityTypes, id(c)), true),
  route('POST', 'Report', c => { const b = record(c.body), type = byId(entityTypes, integer(b.reportableEntityTypeId)), reason = byId(reasonTypes, integer(b.reportReasonTypeId)), entityId = integer(b.entityIdentifier); byId<{id:number}>(type.id === 1 ? c.s.tracks : type.id === 2 ? c.s.playlists : type.id === 3 ? c.s.users : c.s.posts, entityId, type.name); need(reason.applicableEntityTypeIds.includes(type.id), 'Reason does not apply to this entity'); const report = { id: c.s.nextId++, isClosed: false, entityIdentifier: entityId, reportableEntityTypeId: type.id, reporterId: c.user(), reportableEntityType: type, reportReasonType: reason }; c.s.reports.push(report); return report; }),
  route('PUT', 'Report/:id/close', c => { byId(c.s.reports, id(c), 'Report').isClosed = true; }),
  route('DELETE', 'Report/:id', c => { byId(c.s.reports, id(c), 'Report'); c.s.reports = removeId(c.s.reports, id(c)); }),
  route('GET', 'Distributor', c => c.s.distributors),
  route('GET', 'Distributor/:id', c => byId(c.s.distributors, id(c))),
  route('POST', 'Distributor', async c => { const b = record(c.body), name = text(b.name), contactEmail = text(b.contactEmail), coverId = await upload(c); const d = { id: c.s.nextId++, name, createdAt: c.now, description: String(b.description ?? ''), contactEmail, coverId, albumCount: 0, license: { id: c.s.nextId++, issuingDate: c.now, lastUpdatedDate: c.now, expirationDate: String(b.expirationDate ?? '2099-01-01'), issuerId: c.user() } }; c.s.distributors.push(d); return d; }),
  route('PUT', 'Distributor/:id', c => { const d = byId(c.s.distributors, id(c)), b = record(c.body); if (b.name !== undefined) d.name = text(b.name); if (b.description !== undefined) d.description = String(b.description); if (b.contactEmail !== undefined) d.contactEmail = text(b.contactEmail); return d; }),
  route('DELETE', 'Distributor/:id', c => { const distributorId = id(c); byId(c.s.distributors, distributorId); need(!c.s.albums.some(a => a.distributorId === distributorId), 'Distributor still has albums', 409); c.s.distributors = removeId(c.s.distributors, distributorId); c.s.distributorAccounts = c.s.distributorAccounts.filter(a => a.distributorId !== distributorId); }),
  route('GET', 'Distributor/update-key/:id', c => { const d = byId(c.s.distributors, id(c)); d.license.lastUpdatedDate = c.now; return `demo-distributor-${d.id}-revision-${c.s.revision + 1}`; }, false, true),
  route('GET', 'Distributor/request', c => c.s.artistRequests),
  route('GET', 'Distributor/request/:id', c => byId(c.s.artistRequests, id(c), 'Artist request')),
  route('POST', 'Distributor/request/:id', c => { const request = byId(c.s.artistRequests, id(c)); need(!request.isResolved, 'Request already resolved', 409); request.isResolved = true; request.resolvedAt = c.now; if (c.p.get('approve') === 'true' && !c.s.artists.some(a => a.userId === request.userId)) c.s.artists.push({ id: c.s.nextId++, userId: request.userId, artistName: request.artistName }); }),
  route('GET', 'AuthDistributor/sessions', c => c.s.sessions.filter(s => s.userId === c.user())),
  route('POST', 'AuthDistributor/register', async c => { const b = record(c.body); byId(c.s.distributors, integer(b.distributorId)); const a = { id: c.s.nextId++, userName: text(b.userName), email: text(b.email), distributorId: Number(b.distributorId), isMaster: false }; need(!c.s.distributorAccounts.some(v => v.email === a.email), 'Local distributor account already exists', 409); c.s.distributorAccounts.push(a); c.s.distributorPasswordDigests[a.id] = await digestPassword(text(b.password, 'Password')); return a; }),
  route('POST', 'AuthDistributor/login', async c => { const a=c.s.distributorAccounts.find(a=>a.email.toLowerCase()===String(c.p.get('email')).toLowerCase()); need(a && c.s.distributorPasswordDigests[a.id]===await digestPassword(text(c.p.get('password'),'Password')), 'Local distributor login or password is incorrect',401); const session={id:c.s.nextId++,userId:1,deviceName:'Local distributor demo',createdAt:c.now,lastActive:c.now};c.s.sessions.push(session);c.s.session={userId:1,sessionId:session.id};return {accessToken:'',refreshToken:'',sessionId:session.id,demoUserId:1}; }, true),
  route('POST', 'AuthDistributor/refresh-token', () => ({ newAccessToken: '', refreshToken: '' }), true),
  route('DELETE', 'AuthDistributor/session/:id', c => { const session = byId(c.s.sessions, id(c)); need(session.userId === c.user(), 'Session access denied', 403); c.s.sessions = removeId(c.s.sessions, session.id); if (c.s.session?.sessionId === session.id) c.s.session = null; }),
  route('POST', 'AuthDistributor/:id/revoke', c => { const session = byId(c.s.sessions, id(c)); need(session.userId === c.user(), 'Session access denied', 403); c.s.sessions = removeId(c.s.sessions, session.id); if (c.s.session?.sessionId === session.id) c.s.session = null; }),
  route('POST', 'AuthDistributor/sessions/revoke-all', c => { const me = c.user(); c.s.sessions = c.s.sessions.filter(v => v.userId !== me); c.s.session = null; }),
  route('GET', 'DistributorMaster/account/:id', account),
  route('DELETE', 'DistributorMaster/account/:id', c => { account(c); c.s.distributorAccounts = removeId(c.s.distributorAccounts, id(c)); delete c.s.distributorPasswordDigests[id(c)]; }),
  route('PUT', 'DistributorMaster/account/:id/username', c => { account(c).userName = text(c.body); }),
  route('PUT', 'DistributorMaster/account/:id/email', c => { account(c).email = text(c.body); }),
  route('PUT', 'DistributorMaster/account/:id/password', async c => { account(c); const b = record(c.body); need(typeof b.oldPassword === 'string' && typeof b.newPassword === 'string' && b.newPassword.length >= 6, 'Old and new passwords are required'); need(c.s.distributorPasswordDigests[id(c)]===await digestPassword(String(b.oldPassword)), 'Old local distributor password is incorrect'); c.s.distributorPasswordDigests[id(c)]=await digestPassword(String(b.newPassword)); return {changedLocally:true}; }),
];
