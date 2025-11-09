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
    name: string
}

export interface NonSensetiveUserDTO {
    biography?: string | null
    publicIdentifier: string
    registrationDate: ISODate
    avatarImageId: number
    avatarImage: ImageFile
    posts: Post[]
    accessFeatures: AccessFeature[]
}

export interface UserUpdateDTO {
    publicIdentifier?: string | null
    biography?: string | null
    dateOfBirth?: ISODateOnly | null
    lastName?: string | null
    firstName?: string | null
}

export interface User {
    id: number
    userName: string
    normalizedUserName: string
    email: string
    normalizedEmail: string
    emailConfirmed: boolean
    passwordHash?: string | null
    securityStamp?: string | null
    concurrencyStamp?: string | null
    phoneNumber?: string | null
    phoneNumberConfirmed: boolean
    twoFactorEnabled: boolean
    lockoutEnd?: ISODate | null
    lockoutEnabled: boolean
    accessFailedCount: number
    firstName: string
    lastName: string
    dateOfBirth: ISODateOnly
    login: string
    biography?: string | null
    publicIdentifier: string
    availableCurrency: number
    registrationDate: ISODate
    enabled2FA: boolean
    googleAuthorizationKey?: string | null
    avatarImageId: number
    visibilityStateId: number
    subscriptionPackId?: number | null
    userStateId: number
    settingsId: number
    inventoryId: number
    visibilityState?: unknown
    avatarImage: ImageFile
    subscriptionPack?: unknown
    userState?: unknown
    settings?: unknown
    inventory?: unknown
    artist?: unknown
    userSessions?: unknown[]
    achievementProgresses?: unknown[]
    posts: Post[]
    accessFeatures: AccessFeature[]
    messages?: unknown[]
    chats?: unknown[]
    collections?: unknown[]
    licenses?: unknown[]
    tracks?: unknown[]
    settingsBlockedUsers?: unknown[]
}
