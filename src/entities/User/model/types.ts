export type ISODate = string
export type ISODateOnly = string

export interface FileItem {
    id: number
    itemName: string
    url: string
}

export interface ImageFile {
    id: number
    itemName?: string
    url?: string
}

export interface Post {
    id: number
    title: string
    textContent: string
    createdAt: ISODate
    userId: number
    visibilityStateId: number
    files: FileItem[]
}

export interface AccessFeature {
    id: number
    name: string
}

export interface NonSensitiveUserDTO {
    biography?: string | null
    publicIdentifier: string
    registrationDate: ISODate
    avatarImageId: number
    imageUrl?: string
    accessFeatures: AccessFeature[]
}

export interface UserPlaylistDTO {
    id: number
    name: string
    coverId: number
    trackCount: number
}

export interface UserProfileDTO {
    id: number
    userName: string
    publicIdentifier: string
    biography?: string | null
    avatarImageId: number
    imageUrl?: string | null
    registrationDate: ISODate
    followersCount: number
    followingCount: number
    accessFeatures: AccessFeature[]
    publicPlaylists: UserPlaylistDTO[]
}

export interface UserUpdateDTO {
    PublicIdentifier?: string | null
    Biography?: string | null
    DateOfBirth?: ISODateOnly | null
    LastName?: string | null
    FirstName?: string | null
}

export interface UserFriendDTO {
    id: number
    userName: string
    publicIdentifier: string
    avatarImageId: number | null
}

export interface UserFollowerDTO {
    id: number
    userName: string
    publicIdentifier: string
    avatarImageId: number
    followedAt: ISODate
}

export interface UserFollowingDTO {
    id: number
    userName: string
    publicIdentifier: string
    avatarImageId: number
    followedAt: ISODate
}

export interface UserProfileStatsDTO {
    followersCount: number
    followingCount: number
    publicPlaylistsCount: number
}

export interface User {
    id: number
    userName: string
    firstName: string
    lastName: string
    login: string
    email: string
    publicIdentifier: string
    registrationDate: ISODate
    emailConfirmed: boolean
    enabled2FA: boolean
    availableCurrency: number
    avatarImageId: number
    visibilityStateId: number
    subscriptionPackId?: number | null
    userStateId: number
    settingsId: number
    inventoryId: number
    libraryId?: number
    accessFeatures: AccessFeature[]
    // Optional fields from different endpoints
    normalizedUserName?: string
    normalizedEmail?: string
    passwordHash?: string | null
    securityStamp?: string | null
    concurrencyStamp?: string | null
    phoneNumber?: string | null
    phoneNumberConfirmed?: boolean
    twoFactorEnabled?: boolean
    lockoutEnd?: ISODate | null
    lockoutEnabled?: boolean
    accessFailedCount?: number
    dateOfBirth?: ISODateOnly
    biography?: string | null
    googleAuthorizationKey?: string | null
    avatarUrl?: string
    visibilityState?: unknown
    avatarImage?: ImageFile
    subscriptionPack?: unknown
    userState?: unknown
    settings?: unknown
    inventory?: unknown
    artist?: unknown
    userSessions?: unknown[]
    achievementProgresses?: unknown[]
    posts?: Post[]
    messages?: unknown[]
    chats?: unknown[]
    collections?: unknown[]
    licenses?: unknown[]
    tracks?: unknown[]
    settingsBlockedUsers?: unknown[]
}
