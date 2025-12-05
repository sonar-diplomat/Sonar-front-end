import { createApi } from '@reduxjs/toolkit/query/react';
import { rtkBaseQuery } from './rtkBaseQuery';

/**
 * Базовый RTK Query API
 * Endpoints добавляются через injectEndpoints в отдельных файлах для каждой сущности
 */
export const rtkApi = createApi({
  reducerPath: 'rtkApi',
  baseQuery: rtkBaseQuery,
  tagTypes: [
    'Track',
    'User',
    'Chat',
    'Message',
    'AccessFeature',
    'ClientSettings',
    'Language',
    'Theme',
    'PlaybackQuality',
    'Folder',
    'Gift',
    'GiftStyle',
    'Report',
    'ReportReasonType',
    'ReportableEntityType',
    'SubscriptionPack',
    'SubscriptionPayment',
    'SubscriptionFeature',
    'Playlist',
    'Album',
    'Distributor',
    'DistributorAccount',
    'ArtistRegistrationRequest',
    'Share',
    'Session',
    'FriendRequest',
    'Friend',
  ],
  endpoints: () => ({}),
});

