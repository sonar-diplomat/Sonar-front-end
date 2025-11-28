import { createApi } from '@reduxjs/toolkit/query/react';
import { rtkBaseQuery } from './rtkBaseQuery';
import { API_ENDPOINTS } from '@shared/config';

// Import types
import type { TrackDTO } from '@entities/Music';
import type { User, NonSensitiveUserDTO } from '@entities/User';
import type { ChatDTO, MessageDTO } from '@entities/Chat';
import type { CursorPageDTO } from '@entities/Playlist';
import type { AccessFeatureDTO } from '@entities/Access';
import type { Settings } from '@entities/ClientSettings';
import type { FolderDTO } from '@entities/Library';
import type { GiftResponseDTO, GiftStyleDTO } from '@entities/Gift';
import type {
  ReportDTO,
  ReportFilterDTO,
  ReportReasonTypeDTO,
  ReportableEntityTypeDTO,
} from '@entities/Report';
import type {
  SubscriptionPackDTO,
  SubscriptionPaymentDTO,
  SubscriptionFeatureDTO,
} from '@entities/Subscription';
import type { PlaylistDTO } from '@entities/Playlist';
import type {
  DistributorDTO,
  DistributorAccountDTO,
  ArtistRegistrationRequestDTO,
} from '@entities/Distribution';
import type { ShareLinkDTO } from '@entities/Collection';
import type {
  ActiveSessionDTO,
  UserRegisterDTO,
  LoginResponseDTO,
  Verify2FaDTO,
  Verify2FaResponseDTO,
  RefreshTokenResponse,
  ConfirmEmailChangeDTO,
  ConfirmPasswordChangeDTO,
} from '@features/auth';

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
  ],
  endpoints: () => ({}),
});

